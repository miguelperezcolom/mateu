"""Builds a fluent component tree from YAML page text — the visual-builder live preview
(mirrors Java's YamlUidlLoader.parseText and the .NET YamlComponentBuilder).

The YAML uses a ``type`` discriminator; :func:`build_from_yaml` dispatches on it and reads the
YAML keys into the fluent dataclasses, handling the name differences: a FormField's ``id`` →
``field_id``. Envelope-aware — a page with a ``layout:`` key renders that layout. The tree is
then mapped to the wire by the normal ``ReflectionMapper.map_component``.

A ``type: Partial`` node is resolved here, against a :class:`PartialRegistry`, and never reaches the
built tree — so nothing downstream, and no renderer, has to know partials exist.
"""

from __future__ import annotations

from typing import Any

import yaml

from mateu_core.partial_registry import PartialRegistry
from mateu_uidl import components as fluent

#: A partial chain longer than this is a bug, not a design.
_MAX_DEPTH = 20

_DEFAULT_PARTIALS = PartialRegistry()


def build_from_yaml(text: str, partials: PartialRegistry | None = None) -> fluent.Component | None:
    """Parse YAML page text and build a fluent component tree (or ``None`` on failure)."""
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None
    if isinstance(data, dict) and "layout" in data:
        data = data["layout"]  # page envelope → render the layout
    return _single(data, partials or _DEFAULT_PARTIALS, [])


def parse_spec(
    text: str, partials: PartialRegistry | None = None
) -> tuple[str | None, fluent.Component | None]:
    """Parse a page spec (a file under specs/ui): the declared ModelView class name (or ``None``
    for a bare, unbound layout) plus the layout component. Envelope-aware — a ``layout:`` key holds
    the tree and a ``modelView:`` key names the logic class the tooling binds it to."""
    registry = partials or _DEFAULT_PARTIALS
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None, None
    if not isinstance(data, dict):
        return None, _single(data, registry, [])
    model_view = data.get("modelView")
    layout_node = data["layout"] if "layout" in data else data
    return model_view, _single(layout_node, registry, [])


def _single(node: Any, partials: PartialRegistry, chain: list[str]) -> fluent.Component | None:
    """What a node becomes in a slot that holds exactly one component."""
    expanded = _in_list(node, partials, chain)
    if not expanded:
        return None
    if len(expanded) == 1:
        return expanded[0]
    # Nowhere to splice into: stacking beats dropping all but the first.
    return fluent.VerticalLayout(content=tuple(expanded))


def _in_list(node: Any, partials: PartialRegistry, chain: list[str]) -> list[fluent.Component]:
    """What a node becomes in a content list — where a partial may contribute several."""
    if isinstance(node, dict) and node.get("type") == "Partial":
        ref = node.get("ref") or ""
        if ref in chain or len(chain) >= _MAX_DEPTH:
            return []
        chain.append(ref)
        try:
            resolved: list[fluent.Component] = []
            for child in partials.resolve(ref):
                resolved.extend(_in_list(child, partials, chain))
            return resolved
        finally:
            chain.pop()
    built = _build(node, partials, chain)
    return [] if built is None else [built]


def _build(node: Any, partials: PartialRegistry, chain: list[str]) -> fluent.Component | None:
    if not isinstance(node, dict):
        return None
    kind = node.get("type")
    if kind == "VerticalLayout":
        return fluent.VerticalLayout(
            content=_children(node, partials, chain), spacing=bool(node.get("spacing", False))
        )
    if kind == "HorizontalLayout":
        return fluent.HorizontalLayout(
            content=_children(node, partials, chain), spacing=bool(node.get("spacing", True))
        )
    if kind == "FormLayout":
        # Python has no standalone FormLayout fluent — a stacked VerticalLayout is a faithful preview.
        return fluent.VerticalLayout(content=_children(node, partials, chain))
    if kind == "FormField":
        return fluent.FormField(
            field_id=node.get("id", ""),  # YAML id → wire binding key field_id
            data_type=node.get("dataType", "string"),
            label=node.get("label"),
            stereotype=node.get("stereotype", "regular"),
            required=bool(node.get("required", False)),
            read_only=bool(node.get("readOnly", False)),
        )
    if kind == "Button":
        return fluent.Button(
            label=node.get("label", ""),
            action_id=node.get("actionId", ""),
            button_style="primary" if node.get("buttonStyle") == "primary" else None,
        )
    if kind == "Text":
        return fluent.Text(text=node.get("text", ""))
    return fluent.Text(text=f"Unsupported component: {kind}")


def _children(node: dict, partials: PartialRegistry, chain: list[str]) -> tuple:
    content = node.get("content")
    if not isinstance(content, list):
        return ()
    # Flattened, not one-to-one: a partial standing for several components splices into the parent's
    # content rather than nesting, or a form grid would put them all in one cell.
    children: list[fluent.Component] = []
    for item in content:
        children.extend(_in_list(item, partials, chain))
    return tuple(children)
