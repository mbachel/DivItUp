from datetime import date

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="groups",
    model_module="app.models.groups",
    model_class="Groups",
    controller_module="app.controllers.groups",
    router_module="app.routers.groups",
    schema_module="app.schemas.groups",
    schema_create_class="GroupCreate",
    schema_update_class="GroupUpdate",
    schema_read_class="Group",
    table_name="groups",
    expected_columns=(
        "id",
        "name",
        "invite_code",
        "created_by",
        "streak",
        "last_streak_increment_on",
    ),
    router_prefix="/groups",
)

CREATE_PAYLOAD = {
    "name": "Test Group",
    "invite_code": "TEST1234",
    "created_by": 1,
    "streak": 3,
    "last_streak_increment_on": date(2026, 4, 1),
}

UPDATE_PAYLOAD = {
    "streak": 4,
}


def test_groups_model_contract() -> None:
    assert_model_contract(SPEC)


def test_groups_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_groups_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_groups_router_contract() -> None:
    assert_router_contract(SPEC)
