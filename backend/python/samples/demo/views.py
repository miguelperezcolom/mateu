"""Demo views for the Python Mateu server — mirrors samples/Mateu.Demo in the C# port."""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Annotated

from mateu_uidl import (
    BannerTheme,
    ComponentTreeSupplier,
    Crud,
    Dashboard,
    Foldout,
    LinkTo,
    Message,
    Money,
    Multiline,
    Panel,
    Password,
    PlainText,
    Required,
    Section,
    Step,
    Tab,
    Welcome,
    Wizard,
    app,
    banner,
    button,
    compact,
    confirm_on_navigation_if_dirty,
    emits,
    fab,
    kpi,
    menu_item,
    shortcut,
    subscribe_to,
    subtitle,
    title,
    ui,
)
from mateu_uidl.components import (
    Button as CtaButton,
    EmptyState,
    Gantt,
    GanttTask,
    MetricCard,
    MetricTrend,
    Skeleton,
    SkeletonVariant,
    Text,
)


class Role(Enum):
    GUEST = "GUEST"
    ADMIN = "ADMIN"


@ui("simple-form")
@title("Simple form")
@emits("greeting-sent")
@subscribe_to("refresh", "greet")
class SimpleForm:
    name: Annotated[str | None, Required()] = None

    @button()
    def greet(self) -> Message:
        return Message(f"Hello {self.name}!")


@ui("person")
@title("Person")
@subtitle("Personal data")
class Person:
    name: Annotated[str | None, Required(), Section("Identity")] = None
    age: int = 0
    subscribed: Annotated[bool, Section("Preferences")] = False
    role: Role = Role.GUEST

    @banner(BannerTheme.INFO, "Heads up")
    def note(self) -> str:
        return "Fields marked * are required"

    @button()
    def save(self) -> Message:
        return Message(f"Saved {self.name}")


class Reservation:
    id: str = ""
    locator: str = ""
    guest: str = ""


class _Store:
    items: dict[str, Reservation] = {}


def _seed() -> None:
    if _Store.items:
        return
    for i, (loc, guest) in enumerate([("ABC123", "Ada Lovelace"), ("XYZ789", "Alan Turing")], start=1):
        r = Reservation()
        r.id, r.locator, r.guest = str(i), loc, guest
        _Store.items[r.id] = r


@ui("reservations")
@title("Reservations")
class Reservations(Crud[Reservation]):
    def fetch(self, search):
        _seed()
        return [
            r for r in _Store.items.values()
            if not search or search.lower() in r.locator.lower() or search.lower() in r.guest.lower()
        ]

    def get(self, id):
        _seed()
        return _Store.items.get(id)

    def save(self, entity):
        if not entity.id:
            entity.id = str(max((int(k) for k in _Store.items), default=0) + 1)
        _Store.items[entity.id] = entity

    def delete(self, id):
        _Store.items.pop(id, None)


@ui("signup")
@title("Sign up")
class SignupWizard(Wizard):
    email: Annotated[str | None, Step(1)] = None
    company: Annotated[str | None, Step(1)] = None
    password: Annotated[str | None, Step(2), Password()] = None
    accept_terms: Annotated[bool, Step(2)] = False

    def complete(self) -> Message:
        return Message(f"Welcome {self.email}")


@ui("showcase")
@title("Showcase")
@subtitle("Tail features")
@compact
@confirm_on_navigation_if_dirty
class Showcase:
    name: Annotated[str | None, Tab("Identity")] = None
    secret: Annotated[str | None, Tab("Identity"), Password()] = None
    bio: Annotated[str | None, Tab("Profile"), Multiline()] = None
    salary: Annotated[float, Tab("Profile"), Money()] = 0.0
    member_since: Annotated[str | None, Tab("Profile"), PlainText()] = "2021-03-14"
    homepage: Annotated[
        str | None,
        Tab("Profile"),
        LinkTo("https://mateu.io/${state.name}", icon="vaadin:external-link", target="_blank"),
    ] = None

    @kpi("Open tickets")
    def open_tickets(self) -> str:
        return "42"

    @kpi("Revenue")
    def revenue(self) -> str:
        return "€ 1.2M"

    @fab("plus", "Add", 0)
    def add(self) -> Message:
        return Message("Added")

    @button()
    @shortcut("ctrl+s")
    def save(self) -> Message:
        return Message(f"Saved {self.name}")


@ui("dashboard")
@title("Sales dashboard")
class SalesDashboard(Dashboard):
    """Declarative dashboard: consecutive MetricCards form a Scoreboard band; Panel(...) fields
    become titled tiles; other component fields land on the grid as-is."""

    revenue: MetricCard = MetricCard(
        title="Revenue",
        value="1.2",
        unit="M€",
        trend=MetricTrend.up,
        trend_label="+12% vs last month",
        icon="chart",
        description="Total invoiced this quarter",
        action_id="openRevenue",
    )
    occupancy: MetricCard = MetricCard(
        title="Occupancy", value="87", unit="%", trend=MetricTrend.neutral
    )
    incidents: MetricCard = MetricCard(
        title="Incidents", value="3", trend=MetricTrend.down, trend_label="-2 this week"
    )
    plan: Annotated[Gantt, Panel("Rollout plan", subtitle="Q3 2026", col_span=2)] = Gantt(
        tasks=(
            GanttTask(id="t1", title="Design", start=date(2026, 7, 1), end=date(2026, 7, 20),
                      progress=80.0, color="#3366cc"),
            GanttTask(id="t2", title="Build", start=date(2026, 7, 15), end=date(2026, 8, 20),
                      progress=35.0),
            GanttTask(id="t3", title="Pilot", start=date(2026, 8, 15), end=date(2026, 9, 10)),
        )
    )
    inbox: Annotated[EmptyState, Panel("Inbox")] = EmptyState(
        icon="📭",
        title="Nothing here yet",
        description="New alerts will show up here",
    )
    loading: Annotated[Skeleton, Panel("Live feed")] = Skeleton(
        variant=SkeletonVariant.card, count=2
    )

    def open_revenue(self) -> Message:
        return Message("Drilling into revenue")


@ui("project-plan")
@title("Project plan")
class ProjectPlan(ComponentTreeSupplier):
    """A fluent component tree: emit any component (here a Gantt) directly."""

    def component(self) -> Gantt:
        return Gantt(
            id="plan",
            tasks=(
                GanttTask(id="a", title="Analysis", start=date(2026, 1, 7), end=date(2026, 2, 1),
                          progress=100.0, color="#2e7d32"),
                GanttTask(id="b", title="Build", start=date(2026, 2, 1), end=date(2026, 5, 1),
                          progress=45.0),
                GanttTask(id="c", title="Rollout", start=date(2026, 4, 15), end=date(2026, 6, 30)),
            ),
        )


@ui("booking-foldout")
@title("Booking")
class BookingFoldout(Foldout):
    """Redwood-style foldout: the first non-Panel component is the overview; Panel(...) fields
    are lateral fold-out panels."""

    overview: Text = Text(text="Booking ABC123 — Ada Lovelace, 2 nights")
    guests: Annotated[Text, Panel("Guests", subtitle="2 adults", icon="👥")] = Text(
        text="Ada Lovelace, Alan Turing"
    )
    payments: Annotated[Text, Panel("Payments", open=False)] = Text(text="Paid in full")


@ui("welcome")
@title("Welcome")
class WelcomeDemo(Welcome):
    """Welcome page: Button fields are hero CTAs; Panel(...) fields are highlight tiles."""

    cta: CtaButton = CtaButton(label="Get started", action_id="getStarted")
    metrics: Annotated[MetricCard, Panel("Today")] = MetricCard(
        title="Reservations", value="18", trend=MetricTrend.up
    )
    tips: Annotated[Text, Panel("Tip of the day")] = Text(
        text="Use the search bar to find any reservation"
    )

    def hero_title(self) -> str:
        return "Welcome to Mateu for Python"

    def hero_subtitle(self) -> str:
        return "Annotate plain Python classes — any Mateu renderer renders them"

    def get_started(self) -> Message:
        return Message("Off we go!")


@app("My Python Mateu app")
class DemoApp:
    @menu_item("Reservations")
    def reservations(self) -> Reservations:
        return Reservations()

    @menu_item("Simple form")
    def simple_form(self) -> SimpleForm:
        return SimpleForm()

    @menu_item("Person")
    def person(self) -> Person:
        return Person()

    @menu_item("Sign up")
    def signup(self) -> SignupWizard:
        return SignupWizard()

    @menu_item("Showcase")
    def showcase(self) -> Showcase:
        return Showcase()

    @menu_item("Dashboard")
    def dashboard(self) -> SalesDashboard:
        return SalesDashboard()

    @menu_item("Project plan")
    def project_plan(self) -> ProjectPlan:
        return ProjectPlan()

    @menu_item("Booking")
    def booking(self) -> BookingFoldout:
        return BookingFoldout()

    @menu_item("Welcome")
    def welcome(self) -> WelcomeDemo:
        return WelcomeDemo()
