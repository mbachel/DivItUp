from datetime import datetime

from .entity_contracts import (
    EntitySpec,
    assert_controller_contract,
    assert_model_contract,
    assert_router_contract,
    assert_schema_contract,
)


SPEC = EntitySpec(
    name="chore_assignments",
    model_module="app.models.chore_assignments",
    model_class="ChoreAssignments",
    controller_module="app.controllers.chore_assignments",
    router_module="app.routers.chore_assignments",
    schema_module="app.schemas.chore_assignments",
    schema_create_class="ChoreAssignmentCreate",
    schema_update_class="ChoreAssignmentUpdate",
    schema_read_class="ChoreAssignment",
    table_name="chore_assignments",
    expected_columns=("id", "chore_id", "assigned_to", "due_date", "status", "completed_at"),
    router_prefix="/chore-assignments",
)

CREATE_PAYLOAD = {
    "chore_id": 1,
    "assigned_to": 1,
    "due_date": datetime(2026, 4, 20, 9, 0, 0),
    "status": "pending",
    "completed_at": None,
}

UPDATE_PAYLOAD = {
    "status": "completed",
}


def test_chore_assignments_model_contract() -> None:
    assert_model_contract(SPEC)


def test_chore_assignments_schema_contract() -> None:
    assert_schema_contract(SPEC, CREATE_PAYLOAD, UPDATE_PAYLOAD)


def test_chore_assignments_controller_contract() -> None:
    assert_controller_contract(SPEC)


def test_chore_assignments_router_contract() -> None:
    assert_router_contract(SPEC)
