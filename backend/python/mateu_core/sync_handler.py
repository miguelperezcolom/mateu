"""Handles a single POST /mateu/v3/sync/{route} call -> a UIIncrement. Port of C#'s SyncHandler."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from mateu_dtos import (
    Message as MessageDto,
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import Label, Message, Required, Step, Wizard
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .mapper import ReflectionMapper, crud_element_type
from .naming import camel_case, humanize
from .reflection import view_fields
from .registry import MateuRegistry, normalize


class RunActionRq(BaseModel):
    """Inbound request (mirrors io.mateu.dtos.RunActionRqDto / the C# RunActionRqDto)."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel, extra="ignore")

    component_state: dict[str, Any] = Field(default_factory=dict)
    app_state: dict[str, Any] = Field(default_factory=dict)
    parameters: dict[str, Any] = Field(default_factory=dict)
    initiator_component_id: str | None = None
    consumed_route: str | None = None
    action_id: str | None = None
    route: str | None = None
    server_side_type: str | None = None
    server_side_component_route: str | None = None


class SyncHandler:
    def __init__(self, registry: MateuRegistry, translator=None):
        self.registry = registry
        self.mapper = ReflectionMapper(translator)

    def handle(self, rq: RunActionRq) -> UIIncrement:
        # 1. App shell at the root route.
        if not rq.action_id:
            t0 = self.registry.resolve(rq.server_side_type, rq.route)
            if t0 is not None and "__mateu_app__" in t0.__dict__:
                return self.render_app(t0)

        # 2. A Crud (by serverSideType or route prefix) — list / detail / new / edit + actions.
        c = self.resolve_crud(rq)
        if c is not None:
            return self.handle_crud(*c, rq)

        type_ = self.registry.resolve(rq.server_side_type, rq.route)
        if type_ is None:
            return self.error(f"Route not found: {rq.route}")

        # 3. A wizard.
        if issubclass(type_, Wizard):
            return self.handle_wizard(type_, rq)

        # 4. A plain view.
        instance = type_()
        self.bind_state(instance, rq.component_state)
        if not rq.action_id:
            return self.render(type_, instance, rq)
        return self.run_action(type_, instance, rq)

    # ── Wizard ─────────────────────────────────────────────────────────────────
    def handle_wizard(self, type_, rq: RunActionRq) -> UIIncrement:
        wizard = type_()
        self.bind_state(wizard, rq.component_state)
        step = self.step_of(rq)
        steps = [(f.marker(Step).step if f.has(Step) else 1) for f in view_fields(type_)]
        total = max(steps, default=1)
        route = "/" + normalize(getattr(type_, "__mateu_ui__", ""))

        if rq.action_id == "back":
            step = max(1, step - 1)
        elif rq.action_id == "next" and step >= total:
            return self.map_result(wizard.complete())
        elif rq.action_id == "next":
            step += 1
        return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step))

    @staticmethod
    def step_of(rq: RunActionRq) -> int:
        v = rq.component_state.get("__step")
        return int(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else 1

    # ── CRUD ───────────────────────────────────────────────────────────────────
    def resolve_crud(self, rq: RunActionRq):
        if rq.server_side_type:
            by_name = self.registry.resolve(rq.server_side_type, None)
            if by_name is not None and crud_element_type(by_name) is not None:
                base = "/" + normalize(getattr(by_name, "__mateu_ui__", ""))
                return by_name, crud_element_type(by_name), base
        pref = self.registry.resolve_by_prefix(rq.route)
        if pref is not None:
            t, base = pref
            el = crud_element_type(t)
            if el is not None:
                return t, el, "/" + base
        return None

    def handle_crud(self, crud_type, element, base_route, rq: RunActionRq) -> UIIncrement:
        crud = crud_type()
        mode, id_ = self.parse_crud_route(base_route, rq.route)
        aid = rq.action_id

        if aid == "search":
            return self.crud_search(crud, element, self.search_text(rq))
        if aid in ("create", "save"):
            return self.crud_save(crud, element, id_, rq, base_route)
        if aid == "delete":
            return self.navigate(base_route, None if id_ is None else self.delete(crud, id_))
        if aid in (None, ""):
            if mode == "new":
                return self.render_entity(crud_type, element, element(), "new", f"{base_route}/new")
            if mode == "view":
                return self.render_entity(
                    crud_type, element, self.get_or_new(crud, element, id_), "view", f"{base_route}/{id_}"
                )
            if mode == "edit":
                return self.render_entity(
                    crud_type, element, self.get_or_new(crud, element, id_), "edit", f"{base_route}/{id_}/edit"
                )
            return self.fragment_response(self.title(crud_type), self.mapper.map_view(crud_type, crud, base_route))
        return self.error(f"Action not found: {aid}")

    @staticmethod
    def parse_crud_route(base_route: str, route: str | None):
        r = "/" + normalize(route)
        bp = base_route.rstrip("/")
        suffix = r[len(bp):].strip("/") if len(r) > len(bp) and r.startswith(bp) else ""
        if suffix == "":
            return "list", None
        if suffix == "new":
            return "new", None
        parts = suffix.split("/")
        if len(parts) >= 2 and parts[1] == "edit":
            return "edit", parts[0]
        return "view", parts[0]

    def render_entity(self, crud_type, element, entity, mode, route) -> UIIncrement:
        return self.fragment_response(
            self.title(crud_type), self.mapper.map_entity_form(crud_type, element, entity, mode, route)
        )

    def crud_save(self, crud, element, id_, rq: RunActionRq, base_route) -> UIIncrement:
        entity = self.get_or_new(crud, element, id_) if id_ is not None else element()
        self.bind_state(entity, rq.component_state)
        if id_ is not None:
            setattr(entity, "id", id_)
        missing = self.required_missing(entity, element)
        if missing:
            return self.error("Please fill: " + ", ".join(missing))
        crud.save(entity)
        return self.navigate(base_route, "Saved")

    def crud_search(self, crud, element, search) -> UIIncrement:
        props = view_fields(element)
        rows = []
        for item in crud.fetch(search):
            rows.append({camel_case(p.name): self.cell_value(getattr(item, p.name, None)) for p in props})
        data = {
            "crud": {
                "page": {"content": rows, "pageSize": len(rows), "pageNumber": 0, "totalElements": len(rows)}
            }
        }
        return UIIncrement.of(
            fragments=[UIFragment(target_component_id="crud", data=data, action="Replace")]
        )

    @staticmethod
    def get_or_new(crud, element, id_):
        return (crud.get(id_) if id_ is not None else None) or element()

    @staticmethod
    def delete(crud, id_) -> str:
        crud.delete(id_)
        return "Deleted"

    @staticmethod
    def required_missing(entity, element) -> list[str]:
        out = []
        for f in view_fields(element):
            if f.has(Required):
                v = getattr(entity, f.name, None)
                if v is None or (isinstance(v, str) and v.strip() == ""):
                    out.append(f.marker(Label).value if f.has(Label) else humanize(f.name))
        return out

    # ── Plain views ─────────────────────────────────────────────────────────────
    def render_app(self, app_type) -> UIIncrement:
        title = getattr(app_type, "__mateu_app__")
        return UIIncrement.of(
            commands=[UICommand(target_component_id="ux_main", type="SetWindowTitle", data=self.mapper.T(title))],
            fragments=[UIFragment(target_component_id="ux_main", component=self.mapper.map_app(app_type), action="Replace")],
        )

    def render(self, type_, instance, rq: RunActionRq) -> UIIncrement:
        route = rq.consumed_route if rq.consumed_route else "_empty"
        return self.fragment_response(self.title(type_), self.mapper.map_view(type_, instance, route))

    def run_action(self, type_, instance, rq: RunActionRq) -> UIIncrement:
        name = self._resolve_action(type_, rq.action_id)
        if name is None:
            return self.error(f"Action not found: {rq.action_id}")
        return self.map_result(getattr(instance, name)())

    @staticmethod
    def _resolve_action(type_, action_id):
        for klass in type_.__mro__:
            for name, val in vars(klass).items():
                if not name.startswith("__") and callable(val) and camel_case(name) == action_id:
                    return name
        return None

    def map_result(self, result) -> UIIncrement:
        if isinstance(result, Message):
            return UIIncrement.of(
                messages=[
                    MessageDto(
                        variant=result.variant.value,
                        position="middle",
                        title=result.title,
                        text=result.text,
                        duration=result.duration,
                    )
                ]
            )
        return UIIncrement.of()

    # ── Helpers ──────────────────────────────────────────────────────────────────
    @staticmethod
    def title(type_) -> str:
        return getattr(type_, "__mateu_title__", humanize(type_.__name__))

    def fragment_response(self, title: str, component) -> UIIncrement:
        return UIIncrement.of(
            commands=[UICommand(target_component_id="ux_main", type="SetWindowTitle", data=title)],
            fragments=[UIFragment(target_component_id="ux_main", component=component, action="Replace")],
        )

    @staticmethod
    def navigate(route: str, success_text: str | None) -> UIIncrement:
        return UIIncrement.of(
            commands=[UICommand(target_component_id="ux_main", type="NavigateTo", data=route)],
            messages=[]
            if success_text is None
            else [MessageDto(variant="success", position="middle", title="", text=success_text, duration=3000)],
        )

    @staticmethod
    def error(text: str) -> UIIncrement:
        return UIIncrement.of(
            messages=[MessageDto(variant="error", position="middle", title="", text=text, duration=5000)]
        )

    @staticmethod
    def search_text(rq: RunActionRq) -> str | None:
        v = rq.component_state.get("searchText")
        return v if isinstance(v, str) else None

    @staticmethod
    def cell_value(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        if isinstance(value, date):
            return value.isoformat()
        if isinstance(value, Enum):
            return value.name
        return value

    def bind_state(self, instance, state: dict[str, Any]) -> None:
        for f in view_fields(type(instance)):
            key = camel_case(f.name)
            if key not in state or state[key] is None:
                continue
            value = self.convert_value(state[key], f.type)
            if value is not None:
                setattr(instance, f.name, value)

    @staticmethod
    def convert_value(raw, target):
        try:
            if raw is None:
                return None
            if target is str:
                return raw if isinstance(raw, str) else str(raw)
            if target is bool:
                return bool(raw)
            if target is int:
                return int(raw)
            if target is float:
                return float(raw)
            if target is Decimal:
                return Decimal(str(raw))
            if target is date:
                return date.fromisoformat(raw)
            if target is datetime:
                return datetime.fromisoformat(raw)
            if isinstance(target, type) and issubclass(target, Enum):
                try:
                    return target[raw]
                except KeyError:
                    return target(raw)
            return raw
        except Exception:
            return None
