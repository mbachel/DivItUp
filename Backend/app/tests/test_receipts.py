from decimal import Decimal

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="receipts",
    model_module="app.models.receipts",
    model_class="Receipts",
    controller_module="app.controllers.receipts",
    router_module="app.routers.receipts",
    schema_module="app.schemas.receipts",
    schema_create_class="ReceiptCreate",
    schema_update_class="ReceiptUpdate",
    schema_read_class="Receipt",
    table_name="receipts",
    expected_columns=("id", "group_id", "uploaded_by", "image_url", "total_extracted", "status"),
    router_prefix="/receipts",
)

CREATE_PAYLOAD = {
    "group_id": 1,
    "uploaded_by": 1,
    "image_url": "https://example.com/receipt.jpg",
    "total_extracted": Decimal("52.90"),
    "status": "processed",
}

UPDATE_PAYLOAD = {
    "status": "pending",
}


def test_receipts_model_contract() -> None:
    assert_model_contract(SPEC)


def test_receipts_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_receipts_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_receipts_router_contract() -> None:
    assert_router_contract(SPEC)
