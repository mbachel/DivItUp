from decimal import Decimal

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="receipt_items",
    model_module="app.models.receipt_items",
    model_class="ReceiptItems",
    controller_module="app.controllers.receipt_items",
    router_module="app.routers.receipt_items",
    schema_module="app.schemas.receipt_items",
    schema_create_class="ReceiptItemCreate",
    schema_update_class="ReceiptItemUpdate",
    schema_read_class="ReceiptItem",
    table_name="receipt_items",
    expected_columns=("id", "receipt_id", "item_name", "quantity", "unit_price"),
    router_prefix="/receipt-items",
)

CREATE_PAYLOAD = {
    "receipt_id": 1,
    "item_name": "Dish Soap",
    "quantity": 2,
    "unit_price": Decimal("4.99"),
}

UPDATE_PAYLOAD = {
    "quantity": 3,
}


def test_receipt_items_model_contract() -> None:
    assert_model_contract(SPEC)


def test_receipt_items_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_receipt_items_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_receipt_items_router_contract() -> None:
    assert_router_contract(SPEC)
