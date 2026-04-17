from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="group_members",
    model_module="app.models.group_members",
    model_class="GroupMembers",
    controller_module="app.controllers.group_members",
    router_module="app.routers.group_members",
    schema_module="app.schemas.group_members",
    schema_create_class="GroupMemberCreate",
    schema_update_class="GroupMemberUpdate",
    schema_read_class="GroupMember",
    table_name="group_members",
    expected_columns=("id", "group_id", "user_id", "role", "is_restricted", "points"),
    router_prefix="/group-members",
)

CREATE_PAYLOAD = {
    "group_id": 1,
    "user_id": 1,
    "role": "member",
    "is_restricted": False,
    "points": 100,
}

UPDATE_PAYLOAD = {
    "points": 150,
}


def test_group_members_model_contract() -> None:
    assert_model_contract(SPEC)


def test_group_members_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_group_members_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_group_members_router_contract() -> None:
    assert_router_contract(SPEC)
