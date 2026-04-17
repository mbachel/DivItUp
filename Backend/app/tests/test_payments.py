from datetime import datetime
from decimal import Decimal

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="payments",
    model_module="app.models.payments",
    model_class="Payments",
    controller_module="app.controllers.payments",
    router_module="app.routers.payments",
    schema_module="app.schemas.payments",
    schema_create_class="PaymentCreate",
    schema_update_class="PaymentUpdate",
    schema_read_class="Payment",
    table_name="payments",
    expected_columns=("id", "payer_id", "payee_id", "expense_split_id", "amount", "paid_at"),
    router_prefix="/payments",
)

CREATE_PAYLOAD = {
    "payer_id": 1,
    "payee_id": 2,
    "expense_split_id": 1,
    "amount": Decimal("20.00"),
    "paid_at": datetime(2026, 4, 15, 18, 30, 0),
}

UPDATE_PAYLOAD = {
    "amount": Decimal("22.50"),
}


def test_payments_model_contract() -> None:
    assert_model_contract(SPEC)


def test_payments_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_payments_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_payments_router_contract() -> None:
    assert_router_contract(SPEC)
