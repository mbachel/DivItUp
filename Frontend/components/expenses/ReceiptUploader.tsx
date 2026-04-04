"use client";

import { useState, useRef } from "react";

interface ScannedItem {
  name: string;
  price: number;
}

interface ReceiptUploaderProps {
  onScan?: (items: ScannedItem[], total: number, store: string) => void;
}

const MOCK_RECEIPT = {
  store: "WHOLE FOODS",
  address: "STREET NO. 442, PORTLAND OR",
  items: [
    { name: "Organic Avocados (x4)", price: 8.0 },
    { name: "Almond Milk 1L", price: 4.5 },
    { name: "Artisan Sourdough", price: 6.2 },
  ],
  total: 18.7,
};

export default function ReceiptUploader({ onScan }: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [scanned, setScanned] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateScan();
  };

  const simulateScan = () => {
    setScanned(true);
    onScan?.(MOCK_RECEIPT.items, MOCK_RECEIPT.total, MOCK_RECEIPT.store);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-outline-variant bg-tertiary-fixed/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Scanned receipt preview */}
      {scanned ? (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 max-w-sm mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-lg tracking-tight">{MOCK_RECEIPT.store}</h3>
              <p className="text-xs text-outline">{MOCK_RECEIPT.address}</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">verified</span>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {MOCK_RECEIPT.items.map((item, i) => (
              <div
                key={i}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${
                  i % 2 === 0 ? "bg-purple-50" : "bg-teal-50/60"
                }`}
              >
                <span className="text-on-surface">{item.name}</span>
                <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-outline-variant">
            <span className="font-bold text-sm tracking-wider">TOTAL</span>
            <span className="font-black text-lg">${MOCK_RECEIPT.total.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-3">
            receipt_long
          </span>
          <p className="text-sm text-outline font-medium">
            Drag receipts here or click to browse
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center mt-2">
        <button
          onClick={simulateScan}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-base">upload</span>
          Upload Receipt
        </button>
        <button
          onClick={simulateScan}
          className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-full font-bold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-base">photo_camera</span>
          Scan via Camera
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={simulateScan}
      />
    </div>
  );
}
