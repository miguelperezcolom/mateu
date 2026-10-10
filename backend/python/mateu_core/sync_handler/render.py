"""Rendering a routed view and the visual-builder live preview (Java's __preview__)."""

from __future__ import annotations

from mateu_dtos import UIIncrement
from mateu_uidl import (
    components as fluent,
    ComponentTreeSupplier,
)

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
