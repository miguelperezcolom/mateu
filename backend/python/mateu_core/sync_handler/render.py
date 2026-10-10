"""Rendering a routed view and the visual-builder live preview (Java's __preview__)."""

from __future__ import annotations

from mateu_dtos import UIIncrement
from mateu_uidl import (
    components as fluent,
    ComponentTreeSupplier,
)

from ..naming import snake_case
from ._base import MixinBase
from ._common import RunActionRq


class RenderHandlerMixin(MixinBase):
    def render(self, type_, instance, rq: RunActionRq, layout_override=None) -> UIIncrement:
        route = rq.consumed_route if rq.consumed_route else "_empty"
        # A ComponentTreeSupplier view (and the archetypes on it) renders its tree directly with no
        # Page wrapper and NO SetWindowTitle command — Java parity. A YAML layout_override is a
        # reflected page and keeps both.
        tree_supplier = layout_override is None and isinstance(instance, ComponentTreeSupplier)
        return self.fragment_response(
            self.title(type_),
            self.mapper.map_view(type_, instance, route, layout_override),
            rq,
            self.lookup_labels(type_, instance, instance),
            with_title_command=not tree_supplier,
        )

    # ── Visual-builder live preview ────────────────────────────────────────────
    def _preview_response(self, yaml_text: str, rq: RunActionRq) -> UIIncrement:
        from mateu_core.yaml_preview import build_from_yaml
        from mateu_uidl import components as fluent

        tree = build_from_yaml(yaml_text) or fluent.Text(text="Invalid YAML")
        return self.fragment_response("Preview", self.mapper.map_component(tree), rq)

    # ── Component adapters ─────────────────────────────────────────────────────
    def handle_adapted(self, type_, adapter, rq: RunActionRq) -> UIIncrement:
        """A model rendered through its ComponentAdapter: ``deserialize`` rebuilds it from the
        state (the first time from an empty one); an action id the adapted view LISTS runs the
        model's method of that name; None or the model itself re-renders. Anything else is
        "Action not found" — the id is wire input."""
        model = adapter.deserialize(dict(rq.component_state or {}))
        if rq.action_id:
            allowed = set(adapter.adapt(model).actions or [])
            if rq.action_id not in allowed or rq.action_id.startswith("_"):
                return self.error(f"Action not found: {rq.action_id}")
            method = getattr(model, rq.action_id, None) or getattr(model, snake_case(rq.action_id), None)
            if method is None or not callable(method):
                return self.error(f"Action not found: {rq.action_id}")
            result = method()
            if result is not None and result is not model:
                return self.map_result(result, rq)
        route = rq.consumed_route or rq.route or ""
        component = self.mapper.map_adapted(model, adapter, route)
        view = adapter.adapt(model)
        return self.fragment_response(
            self.title(type_), component, rq, dict(view.data) if view.data else None,
            with_title_command=False,
        )
