from __future__ import annotations

from dataclasses import dataclass
import importlib
import inspect
from types import ModuleType
from typing import Any

from fastapi.routing import APIRoute
from pydantic import BaseModel


@dataclass(frozen=True)
class EntitySpec:
    name: str
    model_module: str
    model_class: str
    controller_module: str
    router_module: str
    schema_module: str
    schema_create_class: str
    schema_update_class: str
    schema_read_class: str
    table_name: str
    expected_columns: tuple[str, ...]
    router_prefix: str
    expects_group_filter: bool = False


REQUIRED_CONTROLLER_FUNCTIONS = ("create", "read_all", "read_one", "update", "delete")


def _import(module_path: str) -> ModuleType:
    return importlib.import_module(module_path)


def _assert_signature_has(func: Any, expected_params: tuple[str, ...]) -> None:
    signature = inspect.signature(func)
    param_names = tuple(signature.parameters.keys())
    for expected in expected_params:
        assert expected in param_names, (
            f"Expected parameter '{expected}' on {func.__module__}.{func.__name__}, "
            f"found {param_names}"
        )


def assert_model_contract(spec: EntitySpec) -> None:
    model_module = _import(spec.model_module)
    model_cls = getattr(model_module, spec.model_class)

    assert model_cls.__tablename__ == spec.table_name

    column_names = {column.name for column in model_cls.__table__.columns}
    missing_columns = set(spec.expected_columns) - column_names
    assert not missing_columns, (
        f"{spec.model_class} is missing columns: {sorted(missing_columns)}"
    )


def assert_schema_contract(
    spec: EntitySpec,
    create_payload: dict[str, Any],
    update_payload: dict[str, Any],
) -> None:
    schema_module = _import(spec.schema_module)

    create_cls = getattr(schema_module, spec.schema_create_class)
    update_cls = getattr(schema_module, spec.schema_update_class)
    read_cls = getattr(schema_module, spec.schema_read_class)

    assert issubclass(create_cls, BaseModel)
    assert issubclass(update_cls, BaseModel)
    assert issubclass(read_cls, BaseModel)

    create_instance = create_cls(**create_payload)
    assert create_instance.model_dump() == create_payload

    update_instance = update_cls(**update_payload)
    assert update_instance.model_dump(exclude_none=True) == update_payload

    read_instance = read_cls(id=1, **create_payload)
    assert read_instance.id == 1


def assert_controller_contract(spec: EntitySpec) -> None:
    controller_module = _import(spec.controller_module)

    for function_name in REQUIRED_CONTROLLER_FUNCTIONS:
        function = getattr(controller_module, function_name, None)
        assert callable(function), (
            f"Missing controller function {spec.controller_module}.{function_name}"
        )

    _assert_signature_has(getattr(controller_module, "create"), ("db", "request"))
    _assert_signature_has(getattr(controller_module, "read_all"), ("db",))
    _assert_signature_has(getattr(controller_module, "read_one"), ("db", "item_id"))
    _assert_signature_has(getattr(controller_module, "update"), ("db", "item_id", "request"))
    _assert_signature_has(getattr(controller_module, "delete"), ("db", "item_id"))

    if spec.expects_group_filter:
        read_all_by_group = getattr(controller_module, "read_all_by_group", None)
        assert callable(read_all_by_group), (
            f"Missing group filter in {spec.controller_module}.read_all_by_group"
        )
        _assert_signature_has(read_all_by_group, ("db", "group_id"))


def _find_route(routes: list[APIRoute], method: str, path: str) -> APIRoute | None:
    for route in routes:
        if route.path == path and method in (route.methods or set()):
            return route
    return None


def assert_router_contract(spec: EntitySpec) -> None:
    router_module = _import(spec.router_module)
    router = getattr(router_module, "router", None)
    assert router is not None, f"{spec.router_module} does not expose a router"

    assert router.prefix == spec.router_prefix

    api_routes = [route for route in router.routes if isinstance(route, APIRoute)]

    list_path = spec.router_prefix
    detail_path = f"{spec.router_prefix}/{{item_id}}"

    post_route = _find_route(api_routes, "POST", list_path)
    get_list_route = _find_route(api_routes, "GET", list_path)
    get_detail_route = _find_route(api_routes, "GET", detail_path)
    put_route = _find_route(api_routes, "PUT", detail_path)
    delete_route = _find_route(api_routes, "DELETE", detail_path)

    assert post_route is not None, f"Missing POST route for {list_path}"
    assert get_list_route is not None, f"Missing GET route for {list_path}"
    assert get_detail_route is not None, f"Missing GET route for {detail_path}"
    assert put_route is not None, f"Missing PUT route for {detail_path}"
    assert delete_route is not None, f"Missing DELETE route for {detail_path}"

    if spec.expects_group_filter:
        _assert_signature_has(get_list_route.endpoint, ("group_id",))
