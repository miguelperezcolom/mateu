"""Builds a fluent component tree from YAML page text — the visual-builder live preview
(mirrors Java's YamlUidlLoader.parseText and the .NET YamlComponentBuilder).

The YAML uses a ``type`` discriminator; :func:`build_from_yaml` dispatches on it and reads the
YAML keys into the fluent dataclasses, handling the name differences: a FormField's ``id`` →
``field_id``. Envelope-aware — a page with a ``layout:`` key renders that layout. The tree is
then mapped to the wire by the normal ``ReflectionMapper.map_component``.
"""

from __future__ import annotations

from typing import Any

import yaml

from mateu_uidl import components as fluent


def build_from_yaml(text: str) -> fluent.Component | None:
    """Parse YAML page text and build a fluent component tree (or ``None`` on failure)."""
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None
    if isinstance(data, dict) and "layout" in data:
        data = data["layout"]  # page envelope → render the layout
    return _build(data)


def _build(node: Any) -> fluent.Component | None:
    if not isinstance(node, dict):
        return None
    kind = node.get("type")
    if kind == "VerticalLayout":
        return fluent.VerticalLayout(content=_children(node), spacing=bool(node.get("spacing", False)))
    if kind == "HorizontalLayout":
        return fluent.HorizontalLayout(content=_children(node), spacing=bool(node.get("spacing", True)))
    if kind == "FormLayout":
        # Python has no standalone FormLayout fluent — a stacked VerticalLayout is a faithful preview.
        return fluent.VerticalLayout(content=_children(node))
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


def _children(node: dict) -> tuple:
    content = node.get("content")
    if not isinstance(content, list):
        return ()
    return tuple(c for c in (_build(item) for item in content) if c is not None)
