"""Rendering a routed view and the visual-builder live preview (Java's __preview__)."""

from __future__ import annotations

from mateu_ui.dtos import UIIncrement
from mateu_ui.uidl import (
    components as fluent,
    ComponentTreeSupplier,
)

from .. import action_guard, page_inference
from ..naming import snake_case
from ._base import MixinBase
from ._common import RunActionRq


class RenderHandlerMixin(MixinBase):
    def render(self, type_, instance, rq: RunActionRq, layout_override=None) -> UIIncrement:
        route = rq.consumed_route if rq.consumed_route else "_empty"
        # A ComponentTreeSupplier view (and the archetypes on it, and an @auto_page-composed
        # dashboard/welcome) renders its tree directly with no Page wrapper — Java parity. It names
        # the window only when the class DECLARES a title (@title): its class name is no title,
        # but without the declared one the tab kept the previous page's title and screen readers
        # heard no navigation. A YAML layout_override is a reflected page and keeps both.
        composed = layout_override is None and (
            isinstance(instance, ComponentTreeSupplier) or page_inference.composes(type_)
        )
        return self.fragment_response(
            self.record_title(type_, instance),
            self.mapper.map_view(type_, instance, route, layout_override),
            rq,
            self.lookup_labels(type_, instance, instance),
            with_title_command=not composed or "__mateu_title__" in vars(type_),
        )

    # ── Visual-builder live preview ────────────────────────────────────────────
    def _preview_response(self, yaml_text: str, rq: RunActionRq) -> UIIncrement:
        from mateu_ui.core.authoring.validator import MAX_YAML_BYTES
        from mateu_ui.core.yaml_preview import parse_text_reporting
        from mateu_ui.uidl import components as fluent

        if len(yaml_text.encode("utf-8")) > MAX_YAML_BYTES:
            tree: fluent.Component = fluent.Text(text="The YAML is too large to preview", style="color: red;")
        else:
            built, problem = parse_text_reporting(yaml_text, field_types=getattr(self, "field_types", None))
            # Say WHY: "invalid" alone sent the author hunting through the whole file.
            tree = built or fluent.Text(
                text=f"Invalid YAML — {problem}" if problem else "Invalid or empty YAML", style="color: red;"
            )
        return self.fragment_response("Preview", self.mapper.map_component(tree), rq)

    # ── Authoring validation (Java's __validate__) ─────────────────────────────
    def _validate_response(self, yaml_text) -> UIIncrement:
        """The validation report of ``yaml_text`` against the schema and THIS app's catalogues,
        on ``appData._validation`` — what ``mateu_validate_uidl`` is built on. Renders nothing,
        changes nothing; it runs through the same request path, so the access rules apply."""
        from mateu_ui.core.authoring.service import validate_uidl

        report = validate_uidl(self, "" if yaml_text is None else str(yaml_text))
        return UIIncrement(app_data={"_validation": report})

    # ── Component adapters ─────────────────────────────────────────────────────
    def handle_adapted(self, type_, adapter, rq: RunActionRq) -> UIIncrement:
        """A model rendered through its ComponentAdapter: ``deserialize`` rebuilds it from the
        state (the first time from an empty one); an action id the adapted view LISTS runs the
        model's method of that name; None or the model itself re-renders. Anything else is
        refused (403) — the id is wire input."""
        model = adapter.deserialize(dict(rq.component_state or {}))
        if rq.action_id:
            allowed = set(adapter.adapt(model).actions or [])
            if rq.action_id not in allowed or rq.action_id.startswith("_"):
                action_guard.no_such_action(type_, rq.action_id)
            method = getattr(model, rq.action_id, None) or getattr(model, snake_case(rq.action_id), None)
            if method is None or not callable(method):
                action_guard.no_such_action(type_, rq.action_id)
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
