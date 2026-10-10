"""Response helpers: fragments, structure hash (ETag), lookup labels, state binding and value conversion (Java's StructureHashPostProcessor / LookupFieldDataWriter / Hydrater)."""

from __future__ import annotations

from typing import get_args, get_origin

from datetime import (
    date,
    datetime,
)
from decimal import Decimal
from enum import Enum
import hashlib
import json
from typing import Any

from mateu_dtos import (
    Message as MessageDto,
    ServerSideComponent,
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import (
    Lookup,
    LookupLabelSupplier,
    Searchable,
)

from .. import action_guard
from ..mapper import ReflectionMapper
from ..naming import (
    camel_case,
    humanize,
)
from ..reflection import view_fields
from mateu_uidl import components as fluent

from ._base import MixinBase
from ._common import (
    log,
    RunActionRq,
)


class ResponseHelpersMixin(MixinBase):
    # ── Helpers ──────────────────────────────────────────────────────────────────
    @staticmethod
    def title(type_) -> str:
        return getattr(type_, "__mateu_title__", humanize(type_.__name__))

    @staticmethod
    def target(rq: RunActionRq | None) -> str:
        """Fragments and commands address the component that initiated the request (the web
        frontend's top ux id is "_ux" — Java echoes the initiator the same way)."""
        return (rq.initiator_component_id if rq else None) or "ux_main"

    def fragment_response(
        self, title: str, component, rq: RunActionRq | None = None, data=None, with_title_command: bool = True
    ) -> UIIncrement:
        t = self.target(rq)
        # The field values ride BOTH in the component's initialData and in the fragment state (Java
        # parity): the renderer seeds its state from the fragment, the initialData survives a
        # structure-cache hit that strips the component. Read it BEFORE stamping (which may drop it).
        state = None
        if isinstance(component, ServerSideComponent) and component.initial_data:
            state = dict(component.initial_data)
        component = self._stamp_or_strip_structure(component, rq)
        # A ComponentTreeSupplier view emits no SetWindowTitle command (Java parity — the tree is
        # the whole fragment; there is no Page to name the window from).
        commands = (
            [UICommand(target_component_id=t, type="SetWindowTitle", data=title)]
            if with_title_command
            else []
        )
        return UIIncrement.of(
            commands=commands,
            fragments=[UIFragment(target_component_id=t, component=component, state=state, data=data, action="Replace")],
        )

    @staticmethod
    def _stamp_or_strip_structure(component, rq: RunActionRq | None):
        """Structure ETag / template-ref (phase b of the client structure cache): stamp a routed
        component with a stable hash of its structure and, when the client echoed a still-matching
        hash, omit the component so only state/data travel (the frontend merges them onto its
        cached structure). known_structure_hash is only ever sent on a route load, so an action
        re-render can never accidentally strip. Mirrors io.mateu StructureHashPostProcessor."""
        if not isinstance(component, ServerSideComponent):
            return component
        h = ResponseHelpersMixin._structure_hash(component)
        known = rq.known_structure_hash if rq else None
        # A @static_view is never omitted: the client caches its FULL response the first time it
        # sees it each session and then skips the round-trip entirely, so it must always receive
        # the component (carrying static_view=True) to learn that.
        if known and known == h and not component.static_view:
            return None
        return component.model_copy(update={"structure_hash": h})

    @staticmethod
    def _structure_hash(component: ServerSideComponent) -> str:
        # Normalize away the two per-request fields before hashing so the SAME structure always
        # hashes the same: the top-level id is a fresh value each request (an instance id, not
        # structure) and the hash slot must not feed itself. Nested/structural ids are kept. The
        # client only ever echoes the server's hash, so blanking id here is symmetric. sort_keys
        # gives a canonical order at every nesting level.
        data = component.model_copy(update={"id": "", "structure_hash": None}).model_dump(
            by_alias=True, mode="json"
        )
        canonical = json.dumps(data, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def lookup_labels(self, cls, instance, supplier_host) -> dict | None:
        """Display labels for reference fields whose value is already set when the form renders:
        ``Searchable()`` fields ask their selector, ``Lookup()`` fields the view's
        :class:`LookupLabelSupplier` (falling back to a match among its ``options(field_name)``).
        They ride as ``<fieldId>-label`` entries in the fragment data — where the renderer's
        combo looks before showing the raw id (mirrors Java's LookupLabelSupplier)."""
        data = None
        for f in view_fields(cls):
            value = getattr(instance, f.name, None)
            if value is None or str(value) == "":
                continue
            field_id = camel_case(f.name)
            label = None
            searchable = f.marker(Searchable)
            if searchable is not None:
                selector = searchable.selector()
                if isinstance(selector, LookupLabelSupplier):
                    label = selector.label(field_id, value)
            elif f.has(Lookup):
                many = isinstance(value, (list, tuple, set))
                ids = list(value) if many else [value]
                options = []
                for one in ids:
                    one_label = None
                    if isinstance(supplier_host, LookupLabelSupplier):
                        one_label = supplier_host.label(field_id, one)
                    if one_label is None:
                        for o in self.mapper._supplied_options(supplier_host, field_id):
                            if o.value == str(one):
                                one_label = o.label
                                break
                    if one_label is None and not isinstance(supplier_host, LookupLabelSupplier):
                        one_label = str(one)  # no label supplier at all: the raw id (Java)
                    if one_label is not None:
                        options.append({"value": str(one), "label": one_label})
                if options:
                    data = data or {}
                    label = ", ".join(o["label"] for o in options)
                    # The combo's options page, pre-seeded with the current value(s) so it shows
                    # them without a first search (mirrors Java's LookupFieldDataWriter: the
                    # signature is the label for one id, "xxxx" for a collection).
                    data[field_id] = {
                        "searchSignature": "xxxx" if many else label,
                        "pageSize": 1,
                        "pageNumber": 0,
                        "totalElements": 1,
                        "content": options,
                    }
            if label is not None:
                data = data or {}
                data[field_id + "-label"] = label
        return data

    def navigate(self, route: str, success_text: str | None, rq: RunActionRq | None = None) -> UIIncrement:
        return UIIncrement.of(
            commands=[UICommand(target_component_id=self.target(rq), type="NavigateTo", data=route)],
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
            # Mass-assignment guard: a field hidden (EyesOnly) or locked (ReadOnlyUnless) for this
            # caller is never written from the wire — it keeps its server-side value.
            if not action_guard.may_write(self.mapper, f):
                continue
            key = camel_case(f.name)
            if key not in state or state[key] is None:
                continue
            if isinstance(f.type, type) and issubclass(f.type, fluent.Component):
                # a component-holder field is structure, not data: the wire never writes it
                # (Java's HolderFieldChecker)
                continue
            row_type = ReflectionMapper.grid_row_type(f)
            if row_type is not None and isinstance(state[key], list):
                # Grid rows arrive as camelCase dicts — rebuild them as typed row objects.
                rows = []
                for raw in state[key]:
                    if isinstance(raw, dict):
                        row = row_type()
                        self.bind_state(row, raw)
                        rows.append(row)
                setattr(instance, f.name, rows)
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
            origin = get_origin(target)
            if origin in (list, set, frozenset, tuple) and isinstance(raw, (list, tuple)):
                # a collection of plain values: convert each element to the declared item type
                args = [a for a in get_args(target) if a is not Ellipsis]
                item = args[0] if args else None
                items = [
                    ResponseHelpersMixin.convert_value(v, item) if item is not None else v for v in raw
                ]
                items = [v for v in items if v is not None]
                return items if origin is list else origin(items)
            return raw
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            log.warning("convert_value(%r -> %s) failed, the field keeps its value (%s)", raw, target, e)
            return None
