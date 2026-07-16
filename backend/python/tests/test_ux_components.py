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
    AddOn,
    AddOnPicker,
    Button,
    Calendar,
    ChipItem,
    EntityHeader,
    Fact,
    Ledger,
    LedgerLine,
    Meter,
    OfferCard,
    PaymentMethod,
    PaymentPicker,
    ProcessItem,
    ProcessMonitor,
    QueueGroup,
    QueueItem,
    ResourceGrid,
    ResourceItem,
    StatusItem,
    StatusList,
    TaskProgress,
    TaskQueue,
    CalendarEvent,
    CalloutCard,
    Comment,
    CommentThread,
    Checklist,
    ChecklistItem,
    ComparisonCard,
    EmptyState,
    Feature,
    FeatureGrid,
    Faq,
    FaqItem,
    FileItem,
    FileList,
    Funnel,
    FunnelStage,
    HeatCell,
    Heatmap,
    Gantt,
    GanttTask,
    HeroSection,
    Kanban,
    KanbanCard,
    KanbanColumn,
    MetricCard,
    OrgChart,
    OrgNode,
    PricingPlan,
    PricingTable,
    ProgressSteps,
    Stat,
    Step,
    Timeline,
    TimelineItem,
    Testimonial,
    Testimonials,
    TrendChart,
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


@ui("team-calendar")
@title("Team calendar")
class TeamCalendar(ComponentTreeSupplier):
    def component(self):
        return Calendar(
            id="cal",
            month=date(2026, 3, 1),
            events=(
                CalendarEvent(id="ev1", title="Kickoff", date=date(2026, 3, 4), color="#3b82f6"),
                CalendarEvent(id="ev2", title="Launch", date=date(2026, 3, 20), action_id="openEvent"),
            ),
        )


@ui("pricing")
@title("Pricing")
class PricingPlans(ComponentTreeSupplier):
    def component(self):
        return PricingTable(
            id="pricing",
            plans=(
                PricingPlan(
                    id="free", name="Free", price="0", period="/mo",
                    features=("1 project",), cta_label="Start", action_id="choosePlan",
                ),
                PricingPlan(
                    id="pro", name="Pro", price="29", period="/mo", featured=True,
                    features=("Unlimited projects", "Priority support"),
                    cta_label="Go Pro", action_id="choosePlan",
                ),
            ),
        )


@ui("onboarding")
@title("Onboarding")
class OnboardingChecklist(ComponentTreeSupplier):
    def component(self):
        return Checklist(
            id="check",
            title="Onboarding",
            items=(
                ChecklistItem(id="a", label="Create account", done=True),
                ChecklistItem(id="b", label="Invite team", action_id="toggleStep"),
            ),
        )


@ui("month-comparison")
@title("Comparison")
class MonthComparison(ComponentTreeSupplier):
    def component(self):
        return ComparisonCard(
            id="compare",
            title="This month vs last",
            left_label="Last month",
            left_value="€38k",
            right_label="This month",
            right_value="€48k",
            delta="+26%",
            trend="up",
        )


@ui("attachments")
@title("Attachments")
class Attachments(ComponentTreeSupplier):
    def component(self):
        return FileList(
            id="files",
            files=(
                FileItem(name="report.pdf", size="2.4 MB", type="pdf", url="/dl/report.pdf"),
                FileItem(name="logo.png", size="120 KB", type="image", action_id="openFile"),
            ),
        )


@ui("ticket")
@title("Ticket")
class TicketDiscussion(ComponentTreeSupplier):
    def component(self):
        return CommentThread(
            id="thread",
            comments=(
                Comment(
                    id="c1", author="Ada", text="Looks good.", timestamp="2h",
                    replies=(Comment(id="c2", author="Alan", text="Agreed."),),
                ),
            ),
        )


@ui("upgrade")
@title("Upgrade")
class UpgradeCallout(ComponentTreeSupplier):
    def component(self):
        return CalloutCard(
            id="callout",
            theme="success",
            icon="🎉",
            title="You're all set",
            description="Your workspace is ready.",
            cta_label="Open it",
            action_id="openWorkspace",
        )


@ui("help")
@title("Help")
class HelpFaq(ComponentTreeSupplier):
    def component(self):
        return Faq(
            id="faq",
            items=(
                FaqItem(question="Is it free?", answer="There is a free tier.", open=True),
                FaqItem(question="Can I self-host?", answer="Yes."),
            ),
        )


@ui("voices")
@title("Voices")
class CustomerVoices(ComponentTreeSupplier):
    def component(self):
        return Testimonials(
            id="testimonials",
            items=(
                Testimonial(quote="Shipped in a day.", author="Ada", role="CTO", avatar="👩", rating=5),
                Testimonial(quote="Solid.", author="Alan", rating=4),
            ),
        )


@ui("features")
@title("Features")
class ProductFeatures(ComponentTreeSupplier):
    def component(self):
        return FeatureGrid(
            id="features",
            columns=3,
            features=(
                Feature(icon="⚡", title="Fast", description="Blazing quick", action_id="openFeature"),
                Feature(icon="🔒", title="Secure", description="Locked down"),
            ),
        )


@ui("revenue-trend")
@title("Revenue trend")
class RevenueTrend(ComponentTreeSupplier):
    def component(self):
        return TrendChart(
            id="trend",
            title="Revenue",
            values=(10.0, 14.0, 12.0, 18.0, 22.0),
            labels=("Jan", "Feb", "Mar", "Apr", "May"),
            color="#10b981",
            area=True,
        )


@ui("conversion")
@title("Conversion")
class ConversionFunnel(ComponentTreeSupplier):
    def component(self):
        return Funnel(
            id="funnel",
            stages=(
                FunnelStage(label="Visits", value=1000),
                FunnelStage(label="Signups", value=400, color="#8b5cf6"),
                FunnelStage(label="Paid", value=120),
            ),
        )


@ui("activity")
@title("Activity")
class ActivityHeatmap(ComponentTreeSupplier):
    def component(self):
        return Heatmap(
            id="heat",
            cells=(
                HeatCell(date=date(2026, 3, 1), value=2),
                HeatCell(date=date(2026, 3, 2), value=5, label="5 commits"),
            ),
        )


@ui("org")
@title("Org")
class CompanyOrg(ComponentTreeSupplier):
    def component(self):
        return OrgChart(
            id="org",
            root=OrgNode(
                id="ceo", title="Ada", subtitle="CEO", action_id="openPerson",
                children=(
                    OrgNode(id="cto", title="Alan", subtitle="CTO"),
                    OrgNode(id="cfo", title="Grace", subtitle="CFO"),
                ),
            ),
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


@ui("entity-header")
@title("Entity header")
class GuestHeader(ComponentTreeSupplier):
    def component(self):
        return EntityHeader(
            id="entityHeader",
            title="María Fernández",
            badges=(ChipItem(label="PLATINUM", color="contrast"),),
            subtitle="Ocean Suite · 30 Apr → 07 May · 7N · 2pax · All Inclusive",
            facts=(
                Fact(label="TOTAL RESERVA", value="€ 4.890,00"),
                Fact(label="AGENCIA", value="TUI Group · TUI Magic Life"),
            ),
            metric_label="FIDELIDAD",
            metric_value="48.500",
            metric_caption="23 estancias",
        )


@ui("balance-meter")
@title("Balance meter")
class BalanceMeter(ComponentTreeSupplier):
    def component(self):
        return Meter(
            id="meter",
            label="BALANCE ACTUAL",
            value=1240.0,
            max=1800.0,
            unit="€",
            caption="69% de la preautorización consumido",
            warn_at=1440.0,
            danger_at=1710.0,
        )


@ui("pax-progress")
@title("Pax progress")
class PaxProgress(ComponentTreeSupplier):
    def component(self):
        return TaskProgress(
            id="taskProgress",
            label="Reserva con 4 pax. Registrar huéspedes adicionales.",
            total=4,
            done=1,
            action_label="Añadir siguiente pax",
            action_id="addPax",
        )


@ui("incidents")
@title("Incidents")
class Incidents(ComponentTreeSupplier):
    def component(self):
        return StatusList(
            id="statusList",
            items=(
                StatusItem(
                    id="ac",
                    icon="🌡",
                    title="Aire acondicionado con ruido",
                    description="Habitación 901 · Reportado 28 Apr · Mantenimiento avisado",
                    status="En curso",
                    status_color="normal",
                ),
                StatusItem(
                    id="key",
                    icon="🔑",
                    title="Grabar llave / pulsera",
                    description="Complemento de llave digital",
                    action_label="Grabar",
                    action_id="encodeKey",
                ),
                StatusItem(
                    id="ses",
                    icon="✓",
                    title="Parte viajeros (SES)",
                    description="Se enviará automáticamente al confirmar el check-in",
                    status="Automático",
                    status_color="success",
                ),
            ),
        )


@ui("departures")
@title("Departures")
class Departures(ComponentTreeSupplier):
    def component(self):
        return TaskQueue(
            id="taskQueue",
            action_id="openGuest",
            groups=(
                QueueGroup(
                    label="En hotel · late check-out primero",
                    items=(
                        QueueItem(
                            id="1108",
                            title="Carlos Mendoza",
                            caption="Hab 1108 · 7N",
                            badges=(ChipItem(label="LATE · 18:00", color="warning"),),
                            selected=True,
                        ),
                    ),
                ),
                QueueGroup(
                    label="Salida pendiente",
                    items=(
                        QueueItem(
                            id="901",
                            title="Sophie Laurent",
                            caption="Hab 901",
                            badges=(ChipItem(label="GOLD", color="contrast"),),
                        ),
                    ),
                ),
            ),
        )


@ui("room-picker")
@title("Room picker")
class RoomPicker(ComponentTreeSupplier):
    def component(self):
        return ResourceGrid(
            id="resourceGrid",
            action_id="pickRoom",
            columns=4,
            recommended_label="RECOMENDADA",
            items=(
                ResourceItem(
                    id="1201",
                    title="1201",
                    subtitle="Ocupada",
                    status_label="Sucia",
                    status_color="contrast",
                    disabled=True,
                ),
                ResourceItem(
                    id="1204",
                    title="1204",
                    subtitle="Ocean Suite",
                    status_label="Inspeccionada",
                    status_color="success",
                    recommended=True,
                    selected=True,
                ),
                ResourceItem(
                    id="1206",
                    title="1206",
                    subtitle="Libre",
                    status_label="Limpia",
                    status_color="success",
                    note="Ducha averiada",
                    note_color="error",
                ),
            ),
        )


@ui("upgrade-offer")
@title("Upgrade offer")
class UpgradeOffer(ComponentTreeSupplier):
    def component(self):
        return OfferCard(
            id="offerCard",
            tag="UPGRADE DISPONIBLE",
            title="Master Oceanfront Suite",
            subtitle="Planta 14 · Primera línea",
            image="https://example.com/suite.jpg",
            features=("68 m²", "Vista mar frontal", "Terraza + jacuzzi", "Sofá lounge"),
            price_label="+ € 65 / noche",
            action_label="Mejorar a esta habitación",
            action_id="upgrade",
            added=True,
            added_label="✓ Upgrade añadido",
        )


@ui("extras")
@title("Extras")
class Extras(ComponentTreeSupplier):
    def component(self):
        return AddOnPicker(
            id="addOnPicker",
            total_label="Añadidos",
            currency="€",
            action_id="extrasChanged",
            items=(
                AddOn(
                    id="allinc",
                    icon="🍹",
                    title="Paquete All Inclusive",
                    description="Todo incluido · 7 noches · 2 pax",
                    price=343.0,
                    unit="estancia",
                ),
                AddOn(
                    id="parking",
                    icon="🅿",
                    title="Parking",
                    description="Cubierto · Vigilancia 24h",
                    included_label="Incluido Platinum",
                ),
                AddOn(
                    id="late",
                    icon="🕕",
                    title="Late check-out",
                    description="Hasta las 18:00h",
                    price=40.0,
                    added=True,
                ),
            ),
        )


@ui("folio")
@title("Folio")
class Folio(ComponentTreeSupplier):
    def component(self):
        return Ledger(
            id="ledger",
            currency="€",
            total_label="Total",
            lines=(
                LedgerLine(concept="Alojamiento x7 noches", amount=1540.0),
                LedgerLine(
                    concept="All Inclusive Package", included=True, included_label="Incluido"
                ),
                LedgerLine(concept="Descuento Platinum -10%", amount=-154.0),
            ),
            total=1710.5,
        )


@ui("payment")
@title("Payment")
class Payment(ComponentTreeSupplier):
    def component(self):
        return PaymentPicker(
            id="paymentPicker",
            action_id="confirmPayment",
            methods=(
                PaymentMethod(id="card", label="Tarjeta"),
                PaymentMethod(id="cash", label="Efectivo"),
                PaymentMethod(id="points", label="Puntos"),
            ),
            selected="card",
            context_label="PREAUTORIZADO",
            context_value="€ 1.800,00",
            confirm_label="Confirmar — € 1.710,50",
        )


@ui("automations")
@title("Automations")
class Automations(ComponentTreeSupplier):
    def component(self):
        return ProcessMonitor(
            id="processMonitor",
            items=(
                ProcessItem(
                    id="credit",
                    name="Facturación a Crédito",
                    systems=("OHIP", "OIC", "Voxel"),
                    ok=847,
                    warnings=6,
                    errors=0,
                    status="warning",
                    action_label="Solucionar",
                    action_id="fixCredit",
                ),
                ProcessItem(
                    id="sales",
                    name="Comercializadora",
                    systems=("OHIP", "ERP Fusion A/R"),
                    ok=418,
                    warnings=0,
                    errors=0,
                    status="ok",
                ),
            ),
        )


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


def test_component_tree_supplier_emits_checklist():
    doc = render(OnboardingChecklist)
    (check,) = page_children(doc)
    assert check["id"] == "check"
    assert check["metadata"]["type"] == "Checklist"
    m = check["metadata"]
    assert m["title"] == "Onboarding"
    assert len(m["items"]) == 2
    assert m["items"][0]["done"] is True
    assert m["items"][1]["actionId"] == "toggleStep"


def test_component_tree_supplier_emits_comparison_card():
    doc = render(MonthComparison)
    (cc,) = page_children(doc)
    assert cc["id"] == "compare"
    assert cc["metadata"]["type"] == "ComparisonCard"
    m = cc["metadata"]
    assert m["title"] == "This month vs last"
    assert m["leftValue"] == "€38k"
    assert m["rightValue"] == "€48k"
    assert m["delta"] == "+26%"
    assert m["trend"] == "up"


def test_component_tree_supplier_emits_file_list():
    doc = render(Attachments)
    (fl,) = page_children(doc)
    assert fl["id"] == "files"
    assert fl["metadata"]["type"] == "FileList"
    files = fl["metadata"]["files"]
    assert len(files) == 2
    assert files[0]["name"] == "report.pdf"
    assert files[0]["type"] == "pdf"
    assert files[1]["actionId"] == "openFile"


def test_component_tree_supplier_emits_comment_thread():
    doc = render(TicketDiscussion)
    (thread,) = page_children(doc)
    assert thread["id"] == "thread"
    assert thread["metadata"]["type"] == "CommentThread"
    comments = thread["metadata"]["comments"]
    assert len(comments) == 1
    assert comments[0]["author"] == "Ada"
    assert len(comments[0]["replies"]) == 1
    assert comments[0]["replies"][0]["author"] == "Alan"


def test_component_tree_supplier_emits_callout_card():
    doc = render(UpgradeCallout)
    (callout,) = page_children(doc)
    assert callout["id"] == "callout"
    assert callout["metadata"]["type"] == "CalloutCard"
    m = callout["metadata"]
    assert m["theme"] == "success"
    assert m["title"] == "You're all set"
    assert m["ctaLabel"] == "Open it"
    assert m["actionId"] == "openWorkspace"


def test_component_tree_supplier_emits_faq():
    doc = render(HelpFaq)
    (faq,) = page_children(doc)
    assert faq["id"] == "faq"
    assert faq["metadata"]["type"] == "Faq"
    items = faq["metadata"]["items"]
    assert len(items) == 2
    assert items[0]["question"] == "Is it free?"
    assert items[0]["open"] is True
    assert items[1]["open"] is False


def test_component_tree_supplier_emits_testimonials():
    doc = render(CustomerVoices)
    (t,) = page_children(doc)
    assert t["id"] == "testimonials"
    assert t["metadata"]["type"] == "Testimonials"
    items = t["metadata"]["items"]
    assert len(items) == 2
    assert items[0]["quote"] == "Shipped in a day."
    assert items[0]["author"] == "Ada"
    assert items[0]["rating"] == 5


def test_component_tree_supplier_emits_feature_grid():
    doc = render(ProductFeatures)
    (grid,) = page_children(doc)
    assert grid["id"] == "features"
    assert grid["metadata"]["type"] == "FeatureGrid"
    m = grid["metadata"]
    assert m["columns"] == 3
    assert len(m["features"]) == 2
    assert m["features"][0]["title"] == "Fast"
    assert m["features"][0]["actionId"] == "openFeature"


def test_component_tree_supplier_emits_trend_chart():
    doc = render(RevenueTrend)
    (trend,) = page_children(doc)
    assert trend["id"] == "trend"
    assert trend["metadata"]["type"] == "TrendChart"
    m = trend["metadata"]
    assert m["title"] == "Revenue"
    assert m["values"] == [10.0, 14.0, 12.0, 18.0, 22.0]
    assert m["labels"] == ["Jan", "Feb", "Mar", "Apr", "May"]
    assert m["area"] is True


def test_component_tree_supplier_emits_funnel():
    doc = render(ConversionFunnel)
    (funnel,) = page_children(doc)
    assert funnel["id"] == "funnel"
    assert funnel["metadata"]["type"] == "Funnel"
    stages = funnel["metadata"]["stages"]
    assert len(stages) == 3
    assert stages[0]["label"] == "Visits"
    assert stages[0]["value"] == 1000.0
    assert stages[1]["color"] == "#8b5cf6"


def test_component_tree_supplier_emits_heatmap():
    doc = render(ActivityHeatmap)
    (heat,) = page_children(doc)
    assert heat["id"] == "heat"
    assert heat["metadata"]["type"] == "Heatmap"
    cells = heat["metadata"]["cells"]
    assert len(cells) == 2
    assert cells[0]["date"] == "2026-03-01"
    assert cells[1]["value"] == 5.0
    assert cells[1]["label"] == "5 commits"


def test_component_tree_supplier_emits_org_chart():
    doc = render(CompanyOrg)
    (org,) = page_children(doc)
    assert org["id"] == "org"
    assert org["metadata"]["type"] == "OrgChart"
    root = org["metadata"]["root"]
    assert root["title"] == "Ada"
    assert root["subtitle"] == "CEO"
    assert root["actionId"] == "openPerson"
    assert len(root["children"]) == 2
    assert root["children"][0]["title"] == "Alan"


def test_component_tree_supplier_emits_pricing_table():
    doc = render(PricingPlans)
    (pricing,) = page_children(doc)
    assert pricing["id"] == "pricing"
    assert pricing["metadata"]["type"] == "PricingTable"
    plans = pricing["metadata"]["plans"]
    assert len(plans) == 2
    assert plans[0]["name"] == "Free"
    assert plans[0]["featured"] is False
    assert plans[1]["name"] == "Pro"
    assert plans[1]["featured"] is True
    assert plans[1]["features"] == ["Unlimited projects", "Priority support"]
    assert plans[1]["ctaLabel"] == "Go Pro"


def test_component_tree_supplier_emits_calendar():
    doc = render(TeamCalendar)
    (cal,) = page_children(doc)
    assert cal["id"] == "cal"
    assert cal["metadata"]["type"] == "Calendar"
    m = cal["metadata"]
    assert m["month"] == "2026-03-01"
    assert len(m["events"]) == 2
    assert m["events"][0]["title"] == "Kickoff"
    assert m["events"][0]["date"] == "2026-03-04"
    assert m["events"][1]["actionId"] == "openEvent"


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


def test_component_tree_supplier_emits_entity_header():
    doc = render(GuestHeader)
    (header,) = page_children(doc)
    assert header["id"] == "entityHeader"
    assert header["metadata"]["type"] == "EntityHeader"
    assert header["metadata"]["title"] == "María Fernández"
    assert header["metadata"]["badges"] == [{"label": "PLATINUM", "color": "contrast"}]
    assert header["metadata"]["facts"][0] == {"label": "TOTAL RESERVA", "value": "€ 4.890,00"}
    assert header["metadata"]["metricLabel"] == "FIDELIDAD"
    assert header["metadata"]["metricValue"] == "48.500"
    assert header["metadata"]["metricCaption"] == "23 estancias"


def test_component_tree_supplier_emits_meter():
    doc = render(BalanceMeter)
    (meter,) = page_children(doc)
    assert meter["id"] == "meter"
    assert meter["metadata"]["type"] == "Meter"
    assert meter["metadata"]["label"] == "BALANCE ACTUAL"
    assert meter["metadata"]["value"] == 1240.0
    assert meter["metadata"]["max"] == 1800.0
    assert meter["metadata"]["unit"] == "€"
    assert meter["metadata"]["warnAt"] == 1440.0
    assert meter["metadata"]["dangerAt"] == 1710.0


def test_component_tree_supplier_emits_task_progress():
    doc = render(PaxProgress)
    (progress,) = page_children(doc)
    assert progress["id"] == "taskProgress"
    assert progress["metadata"]["type"] == "TaskProgress"
    assert progress["metadata"]["total"] == 4
    assert progress["metadata"]["done"] == 1
    assert progress["metadata"]["actionLabel"] == "Añadir siguiente pax"
    assert progress["metadata"]["actionId"] == "addPax"


def test_component_tree_supplier_emits_status_list():
    doc = render(Incidents)
    (status_list,) = page_children(doc)
    assert status_list["id"] == "statusList"
    assert status_list["metadata"]["type"] == "StatusList"
    items = status_list["metadata"]["items"]
    assert len(items) == 3
    assert items[0]["title"] == "Aire acondicionado con ruido"
    assert items[0]["status"] == "En curso"
    assert items[0]["statusColor"] == "normal"
    assert items[1]["actionLabel"] == "Grabar"
    assert items[1]["actionId"] == "encodeKey"
    assert items[2]["statusColor"] == "success"


def test_component_tree_supplier_emits_task_queue():
    doc = render(Departures)
    (queue,) = page_children(doc)
    assert queue["id"] == "taskQueue"
    assert queue["metadata"]["type"] == "TaskQueue"
    assert queue["metadata"]["actionId"] == "openGuest"
    groups = queue["metadata"]["groups"]
    assert len(groups) == 2
    assert groups[0]["label"] == "En hotel · late check-out primero"
    assert groups[0]["items"][0]["id"] == "1108"
    assert groups[0]["items"][0]["badges"] == [{"label": "LATE · 18:00", "color": "warning"}]
    assert groups[0]["items"][0]["selected"] is True
    assert groups[1]["items"][0]["selected"] is False


def test_component_tree_supplier_emits_resource_grid():
    doc = render(RoomPicker)
    (grid,) = page_children(doc)
    assert grid["id"] == "resourceGrid"
    assert grid["metadata"]["type"] == "ResourceGrid"
    assert grid["metadata"]["actionId"] == "pickRoom"
    assert grid["metadata"]["columns"] == 4
    assert grid["metadata"]["recommendedLabel"] == "RECOMENDADA"
    items = grid["metadata"]["items"]
    assert len(items) == 3
    assert items[0]["disabled"] is True
    assert items[0]["statusLabel"] == "Sucia"
    assert items[1]["recommended"] is True
    assert items[1]["selected"] is True
    assert items[2]["note"] == "Ducha averiada"
    assert items[2]["noteColor"] == "error"


def test_component_tree_supplier_emits_offer_card():
    doc = render(UpgradeOffer)
    (offer,) = page_children(doc)
    assert offer["id"] == "offerCard"
    assert offer["metadata"]["type"] == "OfferCard"
    assert offer["metadata"]["tag"] == "UPGRADE DISPONIBLE"
    assert offer["metadata"]["title"] == "Master Oceanfront Suite"
    assert offer["metadata"]["features"] == [
        "68 m²",
        "Vista mar frontal",
        "Terraza + jacuzzi",
        "Sofá lounge",
    ]
    assert offer["metadata"]["priceLabel"] == "+ € 65 / noche"
    assert offer["metadata"]["actionId"] == "upgrade"
    assert offer["metadata"]["added"] is True
    assert offer["metadata"]["addedLabel"] == "✓ Upgrade añadido"
    assert offer["metadata"]["current"] is False
    assert offer["metadata"]["currentLabel"] is None


def test_component_tree_supplier_emits_add_on_picker():
    doc = render(Extras)
    (picker,) = page_children(doc)
    assert picker["id"] == "addOnPicker"
    assert picker["metadata"]["type"] == "AddOnPicker"
    assert picker["metadata"]["totalLabel"] == "Añadidos"
    assert picker["metadata"]["currency"] == "€"
    assert picker["metadata"]["actionId"] == "extrasChanged"
    items = picker["metadata"]["items"]
    assert len(items) == 3
    assert items[0]["price"] == 343.0
    assert items[0]["unit"] == "estancia"
    assert items[1]["includedLabel"] == "Incluido Platinum"
    assert items[1]["price"] is None
    assert items[2]["added"] is True


def test_component_tree_supplier_emits_ledger():
    doc = render(Folio)
    (ledger,) = page_children(doc)
    assert ledger["id"] == "ledger"
    assert ledger["metadata"]["type"] == "Ledger"
    assert ledger["metadata"]["currency"] == "€"
    assert ledger["metadata"]["totalLabel"] == "Total"
    lines = ledger["metadata"]["lines"]
    assert len(lines) == 3
    assert lines[0]["concept"] == "Alojamiento x7 noches"
    assert lines[0]["amount"] == 1540.0
    assert lines[1]["included"] is True
    assert lines[1]["includedLabel"] == "Incluido"
    assert lines[2]["amount"] == -154.0
    assert ledger["metadata"]["total"] == 1710.5


def test_component_tree_supplier_emits_payment_picker():
    doc = render(Payment)
    (picker,) = page_children(doc)
    assert picker["id"] == "paymentPicker"
    assert picker["metadata"]["type"] == "PaymentPicker"
    assert picker["metadata"]["actionId"] == "confirmPayment"
    methods = picker["metadata"]["methods"]
    assert [m["id"] for m in methods] == ["card", "cash", "points"]
    assert methods[0]["label"] == "Tarjeta"
    assert picker["metadata"]["selected"] == "card"
    assert picker["metadata"]["contextLabel"] == "PREAUTORIZADO"
    assert picker["metadata"]["contextValue"] == "€ 1.800,00"
    assert picker["metadata"]["confirmLabel"] == "Confirmar — € 1.710,50"


def test_component_tree_supplier_emits_process_monitor():
    doc = render(Automations)
    (monitor,) = page_children(doc)
    assert monitor["id"] == "processMonitor"
    assert monitor["metadata"]["type"] == "ProcessMonitor"
    items = monitor["metadata"]["items"]
    assert len(items) == 2
    assert items[0]["name"] == "Facturación a Crédito"
    assert items[0]["systems"] == ["OHIP", "OIC", "Voxel"]
    assert items[0]["ok"] == 847
    assert items[0]["warnings"] == 6
    assert items[0]["errors"] == 0
    assert items[0]["status"] == "warning"
    assert items[0]["actionLabel"] == "Solucionar"
    assert items[0]["actionId"] == "fixCredit"
    assert items[1]["status"] == "ok"
