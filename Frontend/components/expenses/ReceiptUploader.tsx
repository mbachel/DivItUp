"use client";

import { useState, useRef, useCallback } from "react";
import * as api from "../../lib/apiClient";

export interface ScannedReceipt {
  storeName: string;
  receiptNumber: string | null;
  date: string | null;
  totalAmount: number;
  totalTax: number;
  category: string;
  subcategory: string | null;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface ReceiptUploaderProps {
  onScan?: (receipt: ScannedReceipt, receiptId: number) => void;
  groupId: number;
  userId: number;
}

type Mode = "idle" | "webcam" | "scanning" | "done" | "error";

export default function ReceiptUploader({ onScan, groupId, userId }: ReceiptUploaderProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [receipt, setReceipt] = useState<ScannedReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [webcamReady, setWebcamReady] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scanFile = useCallback(async (file: File) => {
  setMode("scanning");
  setErrorMsg("");

  const form = new FormData();
  form.append("receipt", file);

  try {
    const res = await fetch("/api/scan-receipt/", {
      method: "POST",
      body: form,
    });

    const body = await res.json();

    if (!res.ok) {
      const errorMessage =
        typeof body?.detail === "string"
          ? body.detail
          : body?.detail?.message || "Scan failed";
      throw new Error(errorMessage);
    }

    const data: ScannedReceipt = body;

    const receiptPayload: api.ReceiptCreatePayload = {
      group_id: groupId,
      uploaded_by: userId,
      image_url: "",
      total_extracted: data.totalAmount,
      status: "processed",
    };

    const backendReceipt = await api.createReceipt(receiptPayload);
    if (!backendReceipt) {
      throw new Error("Failed to create receipt record");
    }

    for (const lineItem of data.lineItems) {
      const itemPayload: api.ReceiptItemCreatePayload = {
        receipt_id: backendReceipt.id,
        item_name: lineItem.description,
        quantity: lineItem.quantity,
        unit_price: lineItem.unitPrice,
      };
      await api.createReceiptItem(itemPayload);
    }

    setReceipt(data);
    setMode("done");
    onScan?.(data, backendReceipt.id);
  } catch (err: unknown) {
    setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    setMode("error");
  }
}, [onScan, groupId, userId]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrorMsg("Please upload an image or PDF file.");
      setMode("error");
      return;
    }
    scanFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const startWebcam = async () => {
    setMode("webcam");
    setWebcamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setWebcamReady(true);
      }
    } catch {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setMode("error");
    }
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("idle");
    setWebcamReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !webcamReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopWebcam();
      const file = new File([blob], "receipt-capture.jpg", { type: "image/jpeg" });
      scanFile(file);
    }, "image/jpeg", 0.95);
  };

  const reset = () => {
    stopWebcam();
    setReceipt(null);
    setErrorMsg("");
    setMode("idle");
  };

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed p-6 transition-all min-h-[320px] flex flex-col ${
        isDragging ? "border-primary bg-primary/5" : "border-outline-variant bg-tertiary-fixed/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {mode === "scanning" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-semibold text-outline">Scanning receipt with Mindee AI…</p>
        </div>
      )}

      {mode === "webcam" && (
        <div className="flex-1 flex flex-col gap-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl object-cover max-h-64 bg-black" />
          <div className="flex gap-3 justify-center">
            <button onClick={capturePhoto} disabled={!webcamReady}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-container disabled:opacity-40 transition-all">
              <span className="material-symbols-outlined text-base">camera</span>
              Capture Receipt
            </button>
            <button onClick={stopWebcam}
              className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-full font-bold text-sm hover:bg-surface-container-highest transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-2xl">error</span>
          </div>
          <p className="text-sm font-semibold text-error text-center">{errorMsg}</p>
          <button onClick={reset} className="text-sm font-bold text-primary hover:underline">Try again</button>
        </div>
      )}

      {mode === "done" && receipt && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-lg tracking-tight">{receipt.storeName}</h3>
                {receipt.date && <p className="text-xs text-outline">{receipt.date}</p>}
              </div>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">verified</span>
              </div>
            </div>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {receipt.lineItems.map((item, i) => (
                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${i % 2 === 0 ? "bg-purple-50" : "bg-teal-50/60"}`}>
                  <span className="text-on-surface truncate mr-2">{item.description}</span>
                  <span className="font-bold text-primary flex-shrink-0">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-3 space-y-1">
              {receipt.totalTax > 0 && (
                <div className="flex justify-between text-xs text-outline">
                  <span>Tax</span><span>${receipt.totalTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm tracking-wider">TOTAL</span>
                <span className="font-black text-lg">${receipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <span className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Added to expenses table
            </span>
            <button onClick={reset} className="text-xs text-outline hover:text-primary font-medium">Scan another</button>
          </div>
        </div>
      )}

      {mode === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-5xl text-outline-variant">receipt_long</span>
          <p className="text-sm text-outline font-medium">Drag receipts here or click to browse</p>
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-base">upload</span>
              Upload Receipt
            </button>
            <button onClick={startWebcam}
              className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-full font-bold text-sm hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-base">photo_camera</span>
              Scan via Camera
            </button>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
    </div>
  );
}
