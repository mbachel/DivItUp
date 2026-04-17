from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="chores",
    model_module="app.models.chores",
    model_class="Chores",
    controller_module="app.controllers.chores",
    router_module="app.routers.chores",
    schema_module="app.schemas.chores",
    schema_create_class="ChoreCreate",
    schema_update_class="ChoreUpdate",
    schema_read_class="Chore",
    table_name="chores",
    expected_columns=("id", "group_id", "title", "frequency"),
    router_prefix="/chores",
    expects_group_filter=True,
)

CREATE_PAYLOAD = {
    "group_id": 1,
    "title": "Take out trash",
    "frequency": "weekly",
}

UPDATE_PAYLOAD = {
    "title": "Take out recycling",
}


def test_chores_model_contract() -> None:
    assert_model_contract(SPEC)


def test_chores_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_chores_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_chores_router_contract() -> None:
    assert_router_contract(SPEC)
