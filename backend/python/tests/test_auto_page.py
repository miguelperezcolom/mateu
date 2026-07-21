"""Page-level inference (``@auto_page``) — the Python mirror of Java's ``AutoPageSyncTest``:
a plain class with MetricCard fields composes the Dashboard archetype; a class with only
Button fields and panel components composes the Welcome landing (hero title from ``@title``);
one data field keeps the class a form, and without the decorator nothing changes.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from typing import Annotated  # noqa: E402

from mateu_core import (  # noqa: E402
    MateuRegistry,
    RunActionRq,
    SyncHandler,
    type_name,
)
from mateu_core.page_type_inference import page_type_of  # noqa: E402
from mateu_uidl import Panel, auto_page, title, ui  # noqa: E402
from mateu_uidl.components import Button, MetricCard, Text  # noqa: E402

MODULE = sys.modules[__name__]


# ── fixtures ──────────────────────────────────────────────────────────────────


@ui("inferred-dashboard")
@title("Ops")
@auto_page
class InferredOps:
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2", unit="M€")
    occupancy: MetricCard = MetricCard(title="Occupancy", value="87%")
    sales: Annotated[Text, Panel("Monthly sales")] = Text(text="sales chart placeholder")


@ui("plain-metrics")
@title("Ops, uninferred")
class PlainOps:
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2")
    note: str = "still a plain form"


@ui("inferred-welcome")
@title("Front desk")
@auto_page
class InferredHome:
    start: Button = Button(label="Start check-in", action_id="startCheckin")
    explore: Button = Button(label="Explore rooms", action_id="exploreRooms")
    today: Annotated[Text, Panel("Today")] = Text(text="42 arrivals expected")


@ui("form-with-button")
@title("Not a landing")
@auto_page
class FormWithButton:
    submit: Button = Button(label="Submit", action_id="submit")
    name: str = ""  # a data field: this is a form that happens to have a button


# ── harness ───────────────────────────────────────────────────────────────────


def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def walk(node):
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def of_type(root, wire_type: str) -> list[dict]:
    return [
        n
        for n in walk(root)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == wire_type
    ]


# ── tests ─────────────────────────────────────────────────────────────────────


def test_auto_page_class_with_metric_cards_composes_the_dashboard_archetype():
    component = component_tree(InferredOps)

    assert of_type(component, "DashboardLayout")
    (scoreboard,) = of_type(component, "Scoreboard")
    titles = [m["metadata"]["title"] for m in scoreboard["children"]]
    assert titles == ["Revenue", "Occupancy"]
    (panel,) = of_type(component, "DashboardPanel")
    assert panel["metadata"]["title"] == "Monthly sales"
    assert component["pageType"] == "dashboard"


def test_auto_page_class_with_only_buttons_and_panels_composes_the_welcome_landing():
    component = component_tree(InferredHome)

    (hero,) = of_type(component, "HeroSection")
    assert hero["metadata"]["title"] == "Front desk"
    assert hero["metadata"]["centered"] is True
    ctas = [c["metadata"] for c in hero["children"] if c["metadata"]["type"] == "Button"]
    assert [c["label"] for c in ctas] == ["Start check-in", "Explore rooms"]
    assert ctas[0]["actionId"] == "startCheckin"
    (tile,) = of_type(component, "DashboardPanel")
    assert tile["metadata"]["title"] == "Today"
    assert component["pageType"] == "landing"
    assert page_type_of(InferredHome) == "landing"


def test_a_data_field_keeps_an_auto_page_class_with_buttons_as_a_plain_form():
    component = component_tree(FormWithButton)

    assert not of_type(component, "HeroSection")
    assert component["pageType"] == "form"


def test_without_auto_page_the_same_shape_keeps_rendering_as_a_plain_form():
    component = component_tree(PlainOps)

    assert not of_type(component, "DashboardLayout")
    assert not of_type(component, "Scoreboard")
