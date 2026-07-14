"""Golden-JSON tests for the UX-pattern components (dashboard, foldout, hero, empty state,
skeleton, gantt) and the declarative archetypes — the wire shape must match the Java backend's
MetricCardDto / ScoreboardDto / DashboardPanelDto / DashboardLayoutDto / FoldoutLayoutDto /
HeroSectionDto / EmptyStateDto / SkeletonDto / GanttDto serialization."""

import sys
from datetime import date
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    ComponentTreeSupplier,
    Dashboard,
    Foldout,
    ItemOverview,
    Message,
    Panel,
    Welcome,
    title,
    ui,
)
from mateu_uidl.components import (  # noqa: E402
    Button,
    EmptyState,
    Gantt,
    GanttTask,
    HeroSection,
    Kanban,
    KanbanCard,
    KanbanColumn,
    MetricCard,
    ProgressSteps,
    Stat,
    Step,
    Timeline,
    TimelineItem,
    MetricTrend,
    Skeleton,
    SkeletonVariant,
    Text,
)


@ui("sales-dashboard")
@title("Sales dashboard")
class SalesDashboard(Dashboard):
    revenue: MetricCard = MetricCard(
        title="Revenue",
        value="1.2",
        unit="M€",
        trend=MetricTrend.up,
        trend_label="+12% vs last month",
        icon="chart",
        description="Total invoiced",
        action_id="openRevenue",
    )
    tickets: MetricCard = MetricCard(title="Open tickets", value="42", trend=MetricTrend.down)
    plan: Annotated[Gantt, Panel("Plan", subtitle="Q3", col_span=2, row_span=1)] = Gantt(
        tasks=(
            GanttTask(
                id="t1",
                title="Design",
                start=date(2026, 7, 1),
                end=date(2026, 7, 15),
                progress=60.0,
                color="#3366cc",
            ),
        )
    )
    note: Text = Text(text="Updated hourly")

    def open_revenue(self) -> Message:
        return Message("Drilling into revenue")


@ui("project-plan")
@title("Project plan")
class ProjectPlan(ComponentTreeSupplier):
    def component(self):
        return Gantt(
            id="plan",
            tasks=(
                GanttTask(id="a", title="Analysis", start=date(2026, 1, 1), end=date(2026, 2, 1)),
                GanttTask(
                    id="b",
                    title="Build",
                    start=date(2026, 2, 1),
                    end=date(2026, 5, 1),
                    progress=25.5,
                    color="#cc0000",
                ),
            ),
        )


@ui("sprint-board")
@title("Sprint board")
class SprintBoard(ComponentTreeSupplier):
    def component(self):
        return Kanban(
            id="board",
            columns=(
                KanbanColumn(
                    id="todo",
                    title="To do",
                    color="#94a3b8",
                    cards=(KanbanCard(id="c1", title="Task A", badge="3"),),
                ),
                KanbanColumn(
                    id="doing",
                    title="Doing",
                    cards=(
                        KanbanCard(
                            id="c2", title="Task B", description="in flight", action_id="openCard"
                        ),
                    ),
                ),
            ),
        )


@ui("activity")
@title("Activity")
class ActivityFeed(ComponentTreeSupplier):
    def component(self):
        return Timeline(
            id="feed",
            items=(
                TimelineItem(id="e1", title="Order placed", timestamp="09:00", icon="cart"),
                TimelineItem(
                    id="e2",
                    title="Shipped",
                    description="Tracking #ABC",
                    timestamp="14:20",
                    color="#10b981",
                    action_id="openShipment",
                ),
            ),
        )


@ui("checkout")
@title("Checkout")
class CheckoutProgress(ComponentTreeSupplier):
    def component(self):
        return ProgressSteps(
            id="progress",
            steps=(
                Step(id="s1", title="Cart", status="done"),
                Step(id="s2", title="Payment", description="in progress", status="current"),
                Step(id="s3", title="Done", status="upcoming"),
            ),
        )


@ui("kpi")
@title("KPI")
class KpiStat(ComponentTreeSupplier):
    def component(self):
        return Stat(
            id="mrr",
            label="MRR",
            value="48.2",
            unit="k",
            delta="+7.4%",
            trend="up",
            spark=(30.0, 32.0, 31.0, 35.0, 40.0, 42.0, 48.0),
            action_id="openMrr",
        )


@ui("booking")
@title("Booking")
class BookingFoldout(Foldout):
    overview: Text = Text(text="Booking ABC123")
    guests: Annotated[Text, Panel("Guests", subtitle="2 adults", icon="users")] = Text(text="Ada, Alan")
    payments: Annotated[Text, Panel("Payments", open=False)] = Text(text="Paid in full")


@ui("product")
@title("Product")
class ProductOverview(ItemOverview):
    key_info: Text = Text(text="SKU-1")
    specs: Annotated[Text, Panel("Specs")] = Text(text="Specs here")
    stock: Annotated[Text, Panel("Stock")] = Text(text="Stock here")


@ui("welcome")
@title("Welcome")
class WelcomeDemo(Welcome):
    cta: Button = Button(label="Get started", action_id="getStarted")
    empty: Annotated[EmptyState, Panel("Inbox")] = EmptyState(
        icon="inbox",
        title="Nothing here yet",
        description="Create your first item",
        action_id="create",
        action_label="Create",
    )
    loading: Annotated[Skeleton, Panel("Loading")] = Skeleton(variant=SkeletonVariant.card, count=3)

    def hero_title(self) -> str:
        return "Welcome!"

    def hero_subtitle(self) -> str:
        return "Get going in minutes"

    def hero_image(self) -> str:
        return "https://example.com/hero.png"

    def get_started(self) -> Message:
        return Message("Off we go")


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(view_cls) -> dict:
    inc = handler().handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")


def page_children(doc) -> list:
    component = doc["fragments"][0]["component"]
    assert component["type"] == "ServerSide"
    page = component["children"][0]
    assert page["metadata"]["type"] == "Page"
    return page["children"]


def find(children, meta_type):
    return [c for c in children if c["metadata"]["type"] == meta_type]


def test_dashboard_archetype_emits_scoreboard_panels_and_gantt():
    doc = render(SalesDashboard)
    (layout,) = page_children(doc)
    assert layout["metadata"] == {"type": "DashboardLayout", "columns": 0}

    scoreboard, panel, note = layout["children"]

    # Consecutive MetricCards grouped into a Scoreboard band.
    assert scoreboard["metadata"] == {"type": "Scoreboard"}
    card1, card2 = scoreboard["children"]
    assert card1["metadata"] == {
        "type": "MetricCard",
        "title": "Revenue",
        "value": "1.2",
        "unit": "M€",
        "trend": "up",
        "trendLabel": "+12% vs last month",
        "icon": "chart",
        "description": "Total invoiced",
        "actionId": "openRevenue",
    }
    assert card2["metadata"]["trend"] == "down"
    assert card2["metadata"]["actionId"] is None

    # Panel(...)-annotated field becomes a titled DashboardPanel tile wrapping its content.
    assert panel["metadata"] == {
        "type": "DashboardPanel",
        "title": "Plan",
        "subtitle": "Q3",
        "colSpan": 2,
        "rowSpan": 1,
    }
    assert panel["id"] == "plan"
    (gantt,) = panel["children"]
    assert gantt["metadata"] == {
        "type": "Gantt",
        "tasks": [
            {
                "id": "t1",
                "title": "Design",
                "start": "2026-07-01",
                "end": "2026-07-15",
                "progress": 60.0,
                "color": "#3366cc",
            }
        ],
    }

    # Other component fields land on the grid as-is.
    assert note["metadata"]["type"] == "Text"

    # The MetricCard drill-in action is advertised and dispatches to the method.
    component = doc["fragments"][0]["component"]
    assert {"id": "openRevenue", "validationRequired": True} in component["actions"]
    inc = handler().handle(
        RunActionRq(action_id="openRevenue", server_side_type=type_name(SalesDashboard))
    )
    assert inc.messages[0].text == "Drilling into revenue"


def test_component_tree_supplier_emits_kanban():
    doc = render(SprintBoard)
    (kanban,) = page_children(doc)
    assert kanban["id"] == "board"
    assert kanban["metadata"]["type"] == "Kanban"
    columns = kanban["metadata"]["columns"]
    assert len(columns) == 2
    assert columns[0]["title"] == "To do"
    assert columns[0]["color"] == "#94a3b8"
    assert columns[0]["cards"] == [
        {
            "id": "c1",
            "title": "Task A",
            "description": None,
            "badge": "3",
            "color": None,
            "actionId": None,
        }
    ]
    assert columns[1]["cards"][0]["actionId"] == "openCard"


def test_component_tree_supplier_emits_stat():
    doc = render(KpiStat)
    (stat,) = page_children(doc)
    assert stat["id"] == "mrr"
    assert stat["metadata"]["type"] == "Stat"
    m = stat["metadata"]
    assert m["value"] == "48.2"
    assert m["delta"] == "+7.4%"
    assert m["trend"] == "up"
    assert m["spark"] == [30.0, 32.0, 31.0, 35.0, 40.0, 42.0, 48.0]
    assert m["actionId"] == "openMrr"


def test_component_tree_supplier_emits_progress_steps():
    doc = render(CheckoutProgress)
    (steps,) = page_children(doc)
    assert steps["id"] == "progress"
    assert steps["metadata"]["type"] == "ProgressSteps"
    items = steps["metadata"]["steps"]
    assert len(items) == 3
    assert items[0]["title"] == "Cart"
    assert items[0]["status"] == "done"
    assert items[1]["status"] == "current"
    assert items[2]["status"] == "upcoming"


def test_component_tree_supplier_emits_timeline():
    doc = render(ActivityFeed)
    (timeline,) = page_children(doc)
    assert timeline["id"] == "feed"
    assert timeline["metadata"]["type"] == "Timeline"
    items = timeline["metadata"]["items"]
    assert len(items) == 2
    assert items[0]["title"] == "Order placed"
    assert items[0]["timestamp"] == "09:00"
    assert items[1]["actionId"] == "openShipment"
    assert items[1]["color"] == "#10b981"


def test_component_tree_supplier_emits_gantt():
    doc = render(ProjectPlan)
    (gantt,) = page_children(doc)
    assert gantt["id"] == "plan"
    assert gantt["metadata"]["type"] == "Gantt"
    assert gantt["metadata"]["tasks"] == [
        {
            "id": "a",
            "title": "Analysis",
            "start": "2026-01-01",
            "end": "2026-02-01",
            "progress": 0.0,
            "color": None,
        },
        {
            "id": "b",
            "title": "Build",
            "start": "2026-02-01",
            "end": "2026-05-01",
            "progress": 25.5,
            "color": "#cc0000",
        },
    ]


def test_foldout_archetype_slots_overview_and_panels():
    doc = render(BookingFoldout)
    (foldout,) = page_children(doc)
    assert foldout["metadata"]["type"] == "FoldoutLayout"
    assert foldout["metadata"]["panels"] == [
        {"title": "Guests", "subtitle": "2 adults", "icon": "users", "open": True},
        {"title": "Payments", "subtitle": None, "icon": None, "open": False},
    ]
    overview, p0, p1 = foldout["children"]
    assert overview["slot"] == "overview"
    assert overview["metadata"]["text"] == "Booking ABC123"
    assert p0["slot"] == "panel-0"
    assert p0["metadata"]["text"] == "Ada, Alan"
    assert p1["slot"] == "panel-1"


def test_item_overview_archetype_key_info_card_plus_tabs():
    doc = render(ProductOverview)
    (row,) = page_children(doc)
    assert row["metadata"]["type"] == "HorizontalLayout"
    card, tab_layout = row["children"]
    assert card["metadata"]["type"] == "Card"
    assert card["id"] == "key-info"
    assert "position: sticky" in card["style"]
    assert "22rem" in card["style"]
    assert tab_layout["metadata"]["type"] == "TabLayout"
    assert tab_layout["id"] == "item-tabs"
    tabs = tab_layout["children"]
    assert [t["metadata"]["label"] for t in tabs] == ["Specs", "Stock"]
    assert tabs[0]["metadata"]["active"] is True
    assert tabs[0]["children"][0]["metadata"]["text"] == "Specs here"


def test_welcome_archetype_hero_ctas_and_highlight_tiles():
    doc = render(WelcomeDemo)
    (vlayout,) = page_children(doc)
    assert vlayout["metadata"]["type"] == "VerticalLayout"
    hero, highlights = vlayout["children"]
    assert hero["metadata"] == {
        "type": "HeroSection",
        "title": "Welcome!",
        "subtitle": "Get going in minutes",
        "image": "https://example.com/hero.png",
        "height": None,
        "centered": True,
    }
    assert hero["id"] == "hero"
    (cta,) = hero["children"]
    assert cta["metadata"]["type"] == "Button"
    assert cta["metadata"]["label"] == "Get started"
    assert cta["metadata"]["actionId"] == "getStarted"

    assert highlights["metadata"]["type"] == "DashboardLayout"
    assert highlights["id"] == "highlights"
    empty_tile, loading_tile = highlights["children"]
    assert empty_tile["metadata"]["title"] == "Inbox"
    (empty,) = empty_tile["children"]
    assert empty["metadata"] == {
        "type": "EmptyState",
        "icon": "inbox",
        "title": "Nothing here yet",
        "description": "Create your first item",
        "actionId": "create",
        "actionLabel": "Create",
    }
    (skeleton,) = loading_tile["children"]
    assert skeleton["metadata"] == {"type": "Skeleton", "variant": "card", "count": 3}

    # CTA and EmptyState actions advertised; the CTA dispatches to the method.
    component = doc["fragments"][0]["component"]
    action_ids = [a["id"] for a in component["actions"]]
    assert "getStarted" in action_ids and "create" in action_ids
    inc = handler().handle(
        RunActionRq(action_id="getStarted", server_side_type=type_name(WelcomeDemo))
    )
    assert inc.messages[0].text == "Off we go"
