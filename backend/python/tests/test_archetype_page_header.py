"""The composed archetypes carry the canonical page-header pieces they declare — the Python mirror
of Java's ``ArchetypePageHeaderSyncTest``: inside a page titled like the view unless the tree names
itself; an archetype declaring none renders exactly as before. A ``Welcome``'s hero defaults to the
page's ``@title`` / ``@subtitle``.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Dashboard,
    DataManagement,
    Timestamp,
    Welcome,
    overline,
    subtitle,
    title,
    ui,
)
from mateu_ui.uidl import components as fluent  # noqa: E402
from mateu_ui.uidl.components import Button, MetricCard  # noqa: E402


@ui("hdr-plain-dashboard")
@title("Plain ops")
class HdrPlainDashboard(Dashboard):
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2")


@ui("hdr-dashboard")
@title("Ops")
@subtitle("Today at the front desk")
@overline("Hotel Palma")
class HdrDashboard(Dashboard):
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2")
    updated: Annotated[str, Timestamp("Updated")] = "10:42"


@ui("hdr-dm")
@title("Schedule")
@subtitle("Week 43")
class HdrDataManagement(DataManagement):
    def grid_view(self):
        return fluent.Text(id="grid-view", text="the grid")

    def gantt_view(self):
        return fluent.Text(id="gantt-view", text="the gantt")


@ui("hdr-welcome")
@title("Welcome aboard")
@subtitle("Start here")
class HdrWelcome(Welcome):
    start: Button = Button(label="Start", action_id="start")


@ui("hdr-welcome-override")
@title("Declared")
class HdrOverriddenWelcome(Welcome):
    start: Button = Button(label="Start", action_id="start")

    def hero_title(self):
        return "Overridden"


MODULE = sys.modules[__name__]


def render(view_cls) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def _metas(node, kind):
    if isinstance(node, dict):
        meta = node.get("metadata")
        if isinstance(meta, dict) and meta.get("type") == kind:
            yield meta
        for v in node.values():
            yield from _metas(v, kind)
    elif isinstance(node, list):
        for v in node:
            yield from _metas(v, kind)


def pages(view_cls):
    return list(_metas(render(view_cls), "Page"))


def test_an_archetype_declaring_no_header_piece_gets_no_page():
    assert pages(HdrPlainDashboard) == []


def test_a_dashboard_carries_its_declared_header_in_a_page_titled_like_the_view():
    (page,) = pages(HdrDashboard)
    assert page["title"] == "Ops"
    assert page["subtitle"] == "Today at the front desk"
    assert page["overline"] == "Hotel Palma"
    assert page["timestamp"] == "Updated 10:42"


def test_a_tree_that_names_itself_is_not_titled_twice():
    (page,) = pages(HdrDataManagement)
    assert page["title"] is None
    assert page["subtitle"] == "Week 43"


def test_a_welcome_hero_defaults_to_the_page_title_and_subtitle():
    root = render(HdrWelcome)
    (hero,) = list(_metas(root, "HeroSection"))
    assert hero["title"] == "Welcome aboard"
    assert hero["subtitle"] == "Start here"
    # the hero IS the header: no page around it repeating the subtitle
    assert list(_metas(root, "Page")) == []


def test_an_overridden_hero_title_wins():
    (hero,) = list(_metas(render(HdrOverriddenWelcome), "HeroSection"))
    assert hero["title"] == "Overridden"
