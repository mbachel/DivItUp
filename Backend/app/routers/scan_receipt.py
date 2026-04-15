from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import tempfile

from mindee import ClientV2, InferenceParameters, InferenceResponse, PathInput

router = APIRouter(
    tags=["Receipt Scan"],
    prefix="/scan-receipt"
)


@router.post("/")
async def scan_receipt(receipt: UploadFile = File(...)):
    mindee_api_key = os.getenv("MINDEE_API_KEY")
    mindee_model_id = os.getenv("MINDEE_MODEL_ID")

    if not mindee_api_key:
        raise HTTPException(status_code=500, detail="MINDEE_API_KEY is missing")

    if not mindee_model_id:
        raise HTTPException(status_code=500, detail="MINDEE_MODEL_ID is missing")

    temp_path = None

    try:
        file_bytes = await receipt.read()

        suffix = ""
        if receipt.filename and "." in receipt.filename:
            suffix = "." + receipt.filename.split(".")[-1]

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        mindee_client = ClientV2(mindee_api_key)

        params = InferenceParameters(
            model_id=mindee_model_id
        )

        input_source = PathInput(temp_path)

        response = mindee_client.enqueue_and_get_result(
            InferenceResponse,
            input_source,
            params,
        )

        fields = response.inference.result.fields

        # -----------------------------
        # DEBUG: print actual field info
        # -----------------------------
        print("========== MINDEE DEBUG START ==========")
        print("Mindee field keys:", list(fields.keys()))

        for key, field in fields.items():
            print("FIELD KEY:", key)
            print("FIELD TYPE:", type(field).__name__)
            print("FIELD VALUE:", getattr(field, "value", None))
            print("FIELD RAW VALUE:", getattr(field, "raw_value", None))
            print("FIELD ITEMS:", getattr(field, "items", None))
            print("FIELD FIELDS:", getattr(field, "fields", None))
            print("--------------------------------------")

        print("========== MINDEE DEBUG END ==========")

        store_name = _get_simple_value(
            fields,
            [
                "supplier_name",
                "merchant_name",
                "store_name",
                "business_name",
                "vendor",
                "merchant",
                "supplier",
                "store",
            ],
        ) or "Scanned Receipt"

        receipt_number = _get_simple_value(
            fields,
            [
                "invoice_number",
                "receipt_number",
                "receipt_id",
                "reference_number",
                "transaction_id",
            ],
        )

        receipt_date = _get_simple_value(
            fields,
            [
                "date",
                "invoice_date",
                "receipt_date",
                "transaction_date",
            ],
        )

        total_amount = _get_number_value(
            fields,
            [
                "total_amount",
                "total_incl",
                "amount_total",
                "total",
                "grand_total",
                "receipt_total",
            ],
        )

        total_tax = _get_number_value(
            fields,
            [
                "total_tax",
                "tax_amount",
                "taxes",
                "tax",
                "sales_tax",
            ],
        )

        line_items = _extract_line_items_from_fields(fields)

        return {
            "storeName": store_name,
            "receiptNumber": receipt_number,
            "date": receipt_date,
            "totalAmount": total_amount,
            "totalTax": total_tax,
            "category": "Shopping",
            "subcategory": None,
            "lineItems": line_items,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


def _get_simple_value(fields: dict, possible_keys: list[str]):
    for key in possible_keys:
        field = fields.get(key)
        if field is None:
            continue

        value = getattr(field, "value", None)
        if value not in (None, ""):
            return value

        raw_value = getattr(field, "raw_value", None)
        if raw_value not in (None, ""):
            return raw_value

        nested_fields = getattr(field, "fields", None)
        if isinstance(nested_fields, dict):
            for nested_key in ["value", "text", "name", "label"]:
                nested_field = nested_fields.get(nested_key)
                if nested_field is None:
                    continue

                nested_value = getattr(nested_field, "value", None)
                if nested_value not in (None, ""):
                    return nested_value

                nested_raw_value = getattr(nested_field, "raw_value", None)
                if nested_raw_value not in (None, ""):
                    return nested_raw_value

    return None


def _get_number_value(fields: dict, possible_keys: list[str]) -> float:
    for key in possible_keys:
        field = fields.get(key)
        if field is None:
            continue

        value = getattr(field, "value", None)
        if isinstance(value, (int, float)):
            return float(value)

        raw_value = getattr(field, "raw_value", None)
        if isinstance(raw_value, (int, float)):
            return float(raw_value)

        if isinstance(value, str):
            parsed = _parse_number_string(value)
            if parsed is not None:
                return parsed

        if isinstance(raw_value, str):
            parsed = _parse_number_string(raw_value)
            if parsed is not None:
                return parsed

        nested_fields = getattr(field, "fields", None)
        if isinstance(nested_fields, dict):
            for nested_key in ["amount", "total", "value", "price"]:
                nested_field = nested_fields.get(nested_key)
                if nested_field is None:
                    continue

                nested_value = getattr(nested_field, "value", None)
                if isinstance(nested_value, (int, float)):
                    return float(nested_value)

                nested_raw_value = getattr(nested_field, "raw_value", None)
                if isinstance(nested_raw_value, (int, float)):
                    return float(nested_raw_value)

                if isinstance(nested_value, str):
                    parsed = _parse_number_string(nested_value)
                    if parsed is not None:
                        return parsed

                if isinstance(nested_raw_value, str):
                    parsed = _parse_number_string(nested_raw_value)
                    if parsed is not None:
                        return parsed

    return 0.0


def _extract_line_items_from_fields(fields: dict) -> list[dict]:
    for key in ["line_items", "items", "products", "menu_items", "purchased_items"]:
        field = fields.get(key)
        if field is None:
            continue

        items = getattr(field, "items", None)
        if not items:
            continue

        parsed = []

        for item in items:
            item_fields = getattr(item, "fields", {}) or {}

            description = (
                _get_simple_value(
                    item_fields,
                    [
                        "description",
                        "product_name",
                        "name",
                        "item_name",
                        "title",
                    ],
                )
                or "Item"
            )

            quantity = _get_number_value(item_fields, ["quantity", "qty"]) or 1.0
            unit_price = _get_number_value(item_fields, ["unit_price", "price", "rate"]) or 0.0
            total_price = (
                _get_number_value(item_fields, ["total_price", "amount", "line_total"])
                or (unit_price * quantity)
            )

            parsed.append({
                "description": str(description),
                "quantity": quantity,
                "unitPrice": unit_price,
                "totalPrice": total_price,
            })

        return parsed

    return []


def _parse_number_string(value: str):
    cleaned = value.replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None