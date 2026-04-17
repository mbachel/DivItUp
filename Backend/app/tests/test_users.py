from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="users",
    model_module="app.models.users",
    model_class="Users",
    controller_module="app.controllers.users",
    router_module="app.routers.users",
    schema_module="app.schemas.users",
    schema_create_class="UserCreate",
    schema_update_class="UserUpdate",
    schema_read_class="User",
    table_name="users",
    expected_columns=("id", "username", "email", "password_hash", "full_name"),
    router_prefix="/users",
)

CREATE_PAYLOAD = {
    "username": "test_user",
    "email": "test_user@example.com",
    "password_hash": "plaintext-password",
    "full_name": "Test User",
}

UPDATE_PAYLOAD = {
    "full_name": "Updated User",
}


def test_users_model_contract() -> None:
    assert_model_contract(SPEC)


def test_users_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_users_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_users_router_contract() -> None:
    assert_router_contract(SPEC)
