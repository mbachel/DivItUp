import * as mindee from "mindee";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MINDEE_API_KEY;
    const modelId = process.env.MINDEE_MODEL_ID;

    if (!apiKey || !modelId) {
      return NextResponse.json(
        { error: "Mindee API key or model ID not configured" },
        { status: 500 }
      );
    }

    // Convert File to Buffer for Mindee
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Init Mindee client
    const mindeeClient = new mindee.Client({ apiKey });

    // Load from buffer
    const inputSource = new mindee.BufferInput({
      buffer,
      filename: file.name,
    });

    // Send to Mindee
    const response = await mindeeClient.enqueueAndGetResult(
      mindee.product.Extraction,
      inputSource,
      {
        modelId,
        rag: undefined,
        rawText: undefined,
        polygon: undefined,
        confidence: undefined,
      }
    );

    const fields = response.inference.result.fields;

    // Extract store / supplier name
    const storeName =
      fields.getSimpleField("supplier_name")?.stringValue ?? "Unknown Store";

    const receiptNumber =
      fields.getSimpleField("receipt_number")?.stringValue ?? null;

    const date =
      fields.getSimpleField("date")?.stringValue ?? null;

    const totalAmount =
      fields.getSimpleField("total_amount")?.numberValue ?? 0;

    const totalTax =
      fields.getSimpleField("total_tax")?.numberValue ?? 0;

    const category =
      fields.getSimpleField("purchase_category")?.stringValue ?? "miscellaneous";

    const subcategory =
      fields.getSimpleField("purchase_subcategory")?.stringValue ?? null;

    // Extract line items
    const lineItemsField = fields.getListField("line_items");
    const lineItems: { description: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];

    for (const itemField of lineItemsField.objectItems) {
      const subFields = itemField.simpleFields;
      lineItems.push({
        description: subFields.get("description")?.stringValue ?? "Item",
        quantity:    subFields.get("quantity")?.numberValue  ?? 1,
        unitPrice:   subFields.get("unit_price")?.numberValue ?? 0,
        totalPrice:  subFields.get("total_price")?.numberValue ?? 0,
      });
    }

    return NextResponse.json({
      storeName,
      receiptNumber,
      date,
      totalAmount,
      totalTax,
      category,
      subcategory,
      lineItems,
    });
  } catch (error) {
    console.error("Mindee scan error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
