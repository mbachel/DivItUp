from decimal import Decimal

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="expenses",
    model_module="app.models.expenses",
    model_class="Expenses",
    controller_module="app.controllers.expenses",
    router_module="app.routers.expenses",
    schema_module="app.schemas.expenses",
    schema_create_class="ExpenseCreate",
    schema_update_class="ExpenseUpdate",
    schema_read_class="Expense",
    table_name="expenses",
    expected_columns=(
        "id",
        "group_id",
        "paid_by",
        "receipt_id",
        "title",
        "total_amount",
        "split_type",
        "category",
    ),
    router_prefix="/expenses",
    expects_group_filter=True,
)

CREATE_PAYLOAD = {
    "group_id": 1,
    "paid_by": 1,
    "receipt_id": None,
    "title": "Groceries",
    "total_amount": Decimal("82.50"),
    "split_type": "equal",
    "category": "utilities",
}

UPDATE_PAYLOAD = {
    "category": "other",
}


def test_expenses_model_contract() -> None:
    assert_model_contract(SPEC)


def test_expenses_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_expenses_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_expenses_router_contract() -> None:
    assert_router_contract(SPEC)
