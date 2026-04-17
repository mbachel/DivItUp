from decimal import Decimal

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="expense_splits",
    model_module="app.models.expense_splits",
    model_class="ExpenseSplits",
    controller_module="app.controllers.expense_splits",
    router_module="app.routers.expenses_splits",
    schema_module="app.schemas.expense_splits",
    schema_create_class="ExpenseSplitCreate",
    schema_update_class="ExpenseSplitUpdate",
    schema_read_class="ExpenseSplit",
    table_name="expense_splits",
    expected_columns=("id", "expense_id", "user_id", "amount_owed", "is_settled"),
    router_prefix="/expense-splits",
)

CREATE_PAYLOAD = {
    "expense_id": 1,
    "user_id": 1,
    "amount_owed": Decimal("41.25"),
    "is_settled": False,
}

UPDATE_PAYLOAD = {
    "is_settled": True,
}


def test_expense_splits_model_contract() -> None:
    assert_model_contract(SPEC)


def test_expense_splits_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_expense_splits_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_expense_splits_router_contract() -> None:
    assert_router_contract(SPEC)
