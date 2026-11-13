"""A YAML ``Button`` that declares no action is INERT: it reaches the wire with NO action id (Java's
``YamlInertButtonSyncTest``). The label used to be echoed as one (``Primary`` → ``primary``), the
renderers dispatched it and the server answered 403 for a button that does nothing. A declared
action id is kept, and a route button (``actionable:``) keeps the one derived from its label."""

from __future__ import annotations

from mateu_ui.core.mapper import ReflectionMapper
from mateu_ui.core.yaml_preview import build_from_yaml
from mateu_ui.uidl import components as fl


def _buttons(node, out: dict) -> dict:
    if isinstance(node, dict):
        if node.get("type") == "Button" and "label" in node:
            out[node["label"]] = node.get("actionId")
        for v in node.values():
            _buttons(v, out)
    elif isinstance(node, list):
        for v in node:
            _buttons(v, out)
    return out


def test_a_content_button_with_no_action_carries_no_action_id():
    built = build_from_yaml("""
type: VerticalLayout
content:
  - type: Button
    label: Primary
    buttonStyle: primary
  - type: Button
    label: Go
    actionId: go
""")
    wire = ReflectionMapper().map_component(built).model_dump(by_alias=True)
    ids = _buttons(wire, {})
    assert not ids["Primary"]
    assert ids["Go"] == "go"


def test_a_toolbar_button_with_no_action_carries_no_action_id():
    form = build_from_yaml("""
type: Form
title: Orders
toolbar:
  - {type: Button, label: Primary}
  - {type: Button, label: Save, actionId: save}
  - type: Button
    label: Products
    actionable: {type: RouteLink, route: products}
""")
    wire = ReflectionMapper().map_component(form).model_dump(by_alias=True)
    ids = _buttons(wire, {})
    assert not ids["Primary"]
    assert ids["Save"] == "save"
    # a route button navigates; its id stays the label's echo, as in Java (resolvedActionId)
    assert ids["Products"] == "products"


def test_a_code_authored_button_still_runs_the_action_named_like_its_label():
    wire = ReflectionMapper().map_component(
        fl.Form(title="Orders", toolbar=(fl.Button(label="Save"),))
    ).model_dump(by_alias=True)
    assert _buttons(wire, {})["Save"] == "save"
