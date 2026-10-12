"""The Python half of the shared wire conformance corpus (see ``conformance/README.md``).

This is the point of the corpus: the expectation lives in a file **outside this port**, generated
from the Java reference. Python does not assert what Python does — it asserts that Python meets the
spec. When it does not, the gap is visible here rather than discovered by whoever happens to know
all three codebases.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

CORPUS = Path(__file__).resolve().parents[3] / "conformance" / "cases"

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.rest_source_registry import RestSourceRegistry  # noqa: E402
from mateu_uidl import Section, Timestamp, kpi, overline, subtitle, title, ui  # noqa: E402
from typing import Annotated  # noqa: E402
from datetime import date, datetime  # noqa: E402
from enum import Enum  # noqa: E402
from mateu_dtos import Option  # noqa: E402
from mateu_uidl import AppActionsSupplier, AppHeaderAction, BulletedList, ComponentTreeSupplier, Lookup, LookupLabelSupplier, OnRowSelected, Password, Required, Stereotype, TreeSelect, app_context, compact, menu_item, toc  # noqa: E402
from mateu_uidl.components import Notice, StatusItem, StatusList  # noqa: E402
from decimal import Decimal  # noqa: E402
from mateu_dtos import MenuItem  # noqa: E402
from mateu_uidl import AppShell, AppSupplier, AppVariant, BannerTheme, Dashboard, Disabled, Hidden, Message, Money, Panel, PlainText, SeparatorBefore, Tab, app, auto_layout, banner, fab, static_view, zones  # noqa: E402
from mateu_uidl.components import MetricCard, MetricTrend, Text  # noqa: E402
from mateu_uidl import Text as TextField  # noqa: E402
from mateu_uidl import Max, Min  # noqa: E402
from mateu_uidl import EyesOnly, ReadOnlyUnless, button, disabled_unless  # noqa: E402


class Colour(str, Enum):
    red = "red"
    green = "green"
    blue = "blue"


@ui("/conformance/simple-form")
@title("Simple form")
@subtitle("Every basic field kind")
class SimpleForm:
    name: Annotated[str, Section("Identity")] = "Ada"
    age: int = 36
    active: bool = True
    birth_date: date = date(1815, 12, 10)
    colour: Colour = Colour.green


@ui("/conformance/page-header")
@title("Requisition 4471")
@subtitle("Pending approval")
@overline("Requisitions")
class PageHeader:
    amount: Annotated[str, kpi("Amount")] = "1,240 €"
    updated_at: Annotated[str, Timestamp("Last updated")] = "2026-07-20 12:00"
    notes: str = ""


@ui("/conformance/tabs")
@title("Tabs")
class Tabs:
    name: Annotated[str, Tab("General")] = "Ada"
    email: Annotated[str, Tab("General")] = "ada@example.com"
    role: Annotated[str, Tab("Details")] = "Analyst"
    city: Annotated[str, Tab("Details")] = "London"


@ui("/conformance/zones")
@title("Zoned form")
@zones(("left", "64%"), ("right", "36%"))
class ZonedForm:
    name: Annotated[str, Section("Main", zone="left")] = "Ada"
    notes: Annotated[str, Section("Side", zone="right")] = "Quiet"


@ui("/conformance/money-field")
@title("Money field")
class MoneyField:
    price: Annotated[Decimal, Money()] = Decimal("1250.5")
    total: Annotated[Decimal, Money(), PlainText()] = Decimal("99.5")


@ui("/conformance/banner")
@title("Banner page")
class BannerPage:
    name: str = "Ada"

    @banner(BannerTheme.INFO, "Heads up")
    def info(self) -> str:
        return "Something to note"


@ui("/conformance/fab")
@title("Fab page")
class FabPage:
    name: str = "Ada"

    @fab("vaadin:plus", "Add")
    def add(self) -> Message:
        return Message("Added")


@ui("/conformance/separator-text")
@title("Guest file")
class SeparatorText:
    """Section decorations: property-list rows, a separator above a field, a sized text."""

    documento: Annotated[str, Section("Documento", property_list=True)] = "12345678X"
    nombre: str = "María"
    telefono: Annotated[str, Section("Contacto")] = "+34 600 000 000"
    email: Annotated[str, SeparatorBefore()] = "maria@example.com"
    titular: Annotated[str, TextField(size="xl")] = "Bienvenida"


@ui("/conformance/client-rules")
@title("Client rules")
class ClientRules:
    # Declared before the Hidden field on purpose: Java emits all disabled rules before the
    # hidden ones, the ports emit per field in declaration order — this order makes them agree.
    code: Annotated[str, Disabled()] = "X-1"
    special: bool = False
    nickname: Annotated[str, Hidden("!state.special")] = ""


@ui("/conformance/static-view")
@title("About")
@static_view
class StaticAbout:
    heading: str = "This page never changes"


class Size(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3


@ui("/conformance/small-enum-radio")
@title("Small enum radio")
@auto_layout
class SmallEnumRadio:
    size: Size = Size.MEDIUM


@ui("/conformance/dashboard")
@title("Ops dashboard")
class DashboardPage(Dashboard):
    revenue: MetricCard = MetricCard(
        title="Revenue", value="1.2", unit="M€", trend=MetricTrend.up, trend_label="+8%"
    )
    occupancy: MetricCard = MetricCard(title="Occupancy", value="87%")
    notes: Annotated[Text, Panel("Notes", subtitle="Today")] = Text(text="All systems nominal")


@ui("/conformance/app-in-code")
@app("App in code")
class AppInCode(AppSupplier):
    """An app whose shell and its whole menu are composed IN CODE via AppSupplier."""

    def get_app(self) -> AppShell:
        return AppShell(
            title="App in code",
            variant=AppVariant.HAMBURGER_MENU,
            home_route="/a",
            menu=[
                MenuItem(label="A", route="/a", server_side_type=""),
                MenuItem(
                    label="G",
                    route="/g",
                    server_side_type="",
                    submenus=[MenuItem(label="X", route="/g/x", server_side_type="")],
                ),
            ],
        )


@ui("/conformance/validation")
@title("Validated form")
class ValidatedForm:
    """Bean-validation constraints: ``Required()`` sets the wire's required flag and, like
    ``Min``/``Max``, a component-level ``validations`` entry."""

    name: Annotated[str, Required()] = "Ada"
    email: Annotated[str, Required()] = "ada@example.com"
    age: Annotated[int, Min(18), Max(99)] = 36


@ui("/conformance/stereotypes")
@title("Stereotypes")
class Stereotypes:
    """The stereotype vocabulary: slider/stars on ints, password/textarea on strings."""

    volume: Annotated[int, Stereotype("slider")] = 50
    rating: Annotated[int, Stereotype("stars")] = 4
    secret: Annotated[str, Password()] = "hunter2"
    notes: Annotated[str, Stereotype("textarea")] = "Some longer text"


@ui("/conformance/lookup")
@title("Lookup")
class LookupForm(LookupLabelSupplier):
    """A remote reference field: Lookup() renders a combobox whose options come from the field's
    search-<fieldId> action (stereotype combobox + remoteCoordinates on the wire); the pre-set
    value's display label rides in the fragment data as <fieldId>-label, resolved through the
    view's own LookupLabelSupplier."""

    supplier: Annotated[str, Lookup()] = "a2"

    def label(self, field_name: str, id) -> str | None:
        return "Acme" if id == "a2" else None


@ui("/conformance/tree-select")
@title("Tree select")
class TreeSelectForm:
    """A TreeSelect field: stereotype treeSelect, the leavesOnly flag, and nested options."""

    zone: Annotated[str, TreeSelect(leaves_only=True)] = ""

    def options(self, field_name):
        if field_name == "zone":
            return [
                Option(
                    value="es",
                    label="Spain",
                    children=[
                        Option(value="mca", label="Mallorca"),
                        Option(value="men", label="Menorca"),
                    ],
                ),
                Option(value="pt", label="Portugal"),
            ]
        return []


@ui("/conformance/notice")
@title("Notice")
class NoticePage(ComponentTreeSupplier):
    """The fluent Notice: a compact themed inline banner, composed as a component tree — the one
    shape all three servers share (the declarative @Notice String-field marker is Java-only)."""

    def style(self) -> str | None:
        # Mirrors the Java NoticePage, which overrides style() to null: no container envelope,
        # the case is about the Notice, not the default "max-width:900px;margin: auto;".
        return None

    def component(self):
        return Notice(
            text="2 complaints pending",
            theme="warning",
            action_label="Review",
            action_id="review",
            slim=True,
        )


@ui("/conformance/bulleted-list")
@title("Bulleted list")
class BulletedListPage:
    """A BulletedList() collection field renders as a plain read-only <ul> (stereotype bulletedList)."""

    preferences: Annotated[list[str], BulletedList()] = ["Extra pillow", "High floor", "Sea view"]


class Hotel(str, Enum):
    palma = "palma"
    madrid = "madrid"


@ui("/conformance/app-context")
@app("Context app")
class ContextApp:
    """An @app_context member of the app class becomes a header context selector
    (contextSelectors): fieldName from the method, label from the decorator, options from the
    Enum return annotation (value = member name, label = humanized). A reflected (@menu_item-method)
    app, mirroring Java's ContextApp whose `@Menu String home` leaf makes it an app: its menu leaf's
    path derives from the method name ("/home") and its home route is "_no_home_route"."""

    @app_context("Hotel")
    def hotel(self) -> Hotel:
        return Hotel.palma

    @menu_item("Home")
    def home(self):
        return None


@ui("/conformance/app-header-actions")
@app("Header actions")
class HeaderActionsApp(AppActionsSupplier):
    """App header actions: contextActions on the app metadata — a plain button and a dropdown
    (null action_id, children) whose children are the only dispatching leaves."""

    # No return annotation on purpose: the entry maps to route "/" with label "Home", mirroring
    # Java's `@Menu String home = "/"`.
    @menu_item("Home")
    def home(self):
        return None

    def app_actions(self) -> list[AppHeaderAction]:
        return [
            AppHeaderAction("sync", "Sync now", "vaadin:refresh"),
            AppHeaderAction.menu(
                "Export",
                "vaadin:download",
                [
                    AppHeaderAction("exportPdf", "As PDF"),
                    AppHeaderAction("exportExcel", "As Excel"),
                ],
            ),
        ]

    def sync(self) -> Message:
        return Message("Synced")


@ui("/conformance/toc")
@title("Long document")
@toc
class TocPage:
    """@toc forces the sticky sections index: the page carries toc=true."""

    summary: Annotated[str, Section("Overview")] = "All good"
    detail: Annotated[str, Section("Details")] = "Everything"
    phone: Annotated[str, Section("Contact")] = "+34 600 000 000"
    history: Annotated[str, Section("History")] = "Created 2026"
    notes: Annotated[str, Section("Notes")] = "None"


class GuestRow:
    name: str = ""
    age: int = 0


@ui("/conformance/grid-field")
@title("Guest grid")
class GridField:
    """A list of nested rows becomes a grid: columns from the row type, OnRowSelected the click."""

    guests: Annotated[list[GuestRow], OnRowSelected("onSel")] = None  # type: ignore[assignment]

    def __init__(self):
        a = GuestRow()
        a.name, a.age = "Alice", 34
        b = GuestRow()
        b.name, b.age = "Bob", 29
        self.guests = [a, b]

    def on_sel(self, row: GuestRow):
        pass


@ui("/conformance/status-list")
@title("Status list")
class StatusListPage(ComponentTreeSupplier):
    """The StatusList front-office component: labelled status rows — a chip row and an action row."""

    def component(self):
        return StatusList(
            id="statusList",
            items=(
                StatusItem(
                    id="ses",
                    icon="✓",
                    title="Traveller report",
                    description="Sent automatically on check-in",
                    status="Automatic",
                    status_color="success",
                ),
                StatusItem(
                    id="key",
                    icon="🔑",
                    title="Encode key card",
                    description="Digital key add-on",
                    action_label="Encode",
                    action_id="encodeKey",
                ),
            ),
        )


@ui("/conformance/compact")
@title("Compact page")
@compact
class CompactPage:
    name: str = "Ada"
    email: str = "ada@example.com"


@ui("/conformance/access-annotations")
@title("Access annotations")
class AccessAnnotations:
    name: str = "Ada"
    salary: Annotated[str, EyesOnly(roles=("hr",))] = "100k"
    notes: Annotated[str, ReadOnlyUnless(roles=("manager",))] = "n/a"

    @button()
    @disabled_unless(roles=("manager",))
    def approve(self):
        return None



# ── Listings and CRUDs ──────────────────────────────────────────────────────────────────────────

from mateu_uidl import Aggregate, AggregateFunction, Crud, Filterable, GroupBy, Listing, Navigable, Searchable  # noqa: E402


class ProductStatus(Enum):
    Available = "Available"
    OutOfStock = "OutOfStock"
    Discontinued = "Discontinued"


class Product:
    """The starters' Product: an id, a text, a number and an enum."""

    id: str = ""
    name: str = ""
    price: float = 0.0
    status: ProductStatus = ProductStatus.Available

    def __init__(self, id="", name="", price=0.0, status=ProductStatus.Available):
        self.id, self.name, self.price, self.status = id, name, price, status


PRODUCTS = [
    Product("P-001", "Espresso machine", 249.0, ProductStatus.Available),
    Product("P-002", "Coffee grinder", 89.5, ProductStatus.Available),
    Product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock),
]


@ui("/conformance/crud")
@title("Products")
class ProductsCrud(Crud[Product]):
    def fetch(self, search):
        return list(PRODUCTS)

    def get(self, id):
        return next((p for p in PRODUCTS if p.id == id), None)

    def save(self, entity):
        pass

    def delete(self, id):
        pass


class Book:
    id: str = ""
    title: str = ""
    pages: int = 0

    def __init__(self, id="", title="", pages=0):
        self.id, self.title, self.pages = id, title, pages


class BookFilters:
    title: str | None = None
    classic: bool = False


BOOKS = [Book("b1", "El Quijote", 863), Book("b2", "Rayuela", 600)]


@ui("/conformance/listing-filters")
@title("Books")
class FilteredBooks(Listing[Book], Searchable, Filterable[BookFilters]):
    def search(self, request, http=None):
        return list(BOOKS)


@ui("/conformance/listing-navigable")
@title("Books")
class NavigableBooks(Listing[Book], Navigable[Book, str]):
    def search(self, request, http=None):
        return list(BOOKS)

    def view(self, id, http=None):
        return BOOKS[0]


class Sale:
    id: str = ""
    region: Annotated[str, GroupBy()] = ""
    amount: Annotated[float, Aggregate(AggregateFunction.sum)] = 0.0
    invoice: Annotated[str | None, Aggregate(AggregateFunction.count)] = None

    def __init__(self, id="", region="", amount=0.0, invoice=None):
        self.id, self.region, self.amount, self.invoice = id, region, amount, invoice


class Tone(Enum):
    calm = "calm"
    loud = "loud"


class Measurement:
    """One column per basic type: what each becomes on a listing."""

    label: str = ""
    count: int = 0
    amount: float = 0.0
    active: bool = False
    day: date | None = None
    at: datetime | None = None
    tone: Tone = Tone.calm


@ui("/conformance/listing-columns")
@title("Measurements")
class MeasurementsListing(Listing[Measurement]):
    def search(self, request, http=None):
        return []


@ui("/conformance/crud-grouped")
@title("Sales")
class SalesCrud(Crud[Sale]):
    def fetch(self, search):
        return [Sale("1", "North", 100.0, "F-1"), Sale("2", "South", 50.0, "F-2"), Sale("3", "North", 25.0, "F-3")]

    def get(self, id):
        return None

    def save(self, entity):
        pass

    def delete(self, id):
        pass

from mateu_uidl import PeerNav, PeerNavigationSupplier  # noqa: E402


@ui("/conformance/peer-nav")
@title("Record 2")
class PeerNavPage(PeerNavigationSupplier):
    """The canonical header's previous/next record links (PageMetadata.peer_nav)."""

    name: str = "Two"

    def peers(self) -> PeerNav | None:
        return PeerNav("Record 1", "/records/1", "Record 3", "/records/3")


MODULE = sys.modules[__name__]

#: Values that legitimately differ between servers or between runs. Dropped on both sides rather
#: than argued about — a corpus that reports noise gets ignored. ``homeServerSideType`` is
#: ``serverSideType``'s twin on the app metadata: a server's own type name for the home class
#: (``io.mateu…WireConformanceTest$AppInCode`` vs ``test_wire_conformance.AppInCode``) — the Java
#: normaliser drops it too.
VOLATILE = {
    "id",
    "structureHash",
    "generatedAt",
    "serverSideType",
    "homeServerSideType",
    "targetComponentId",
}

def _is_default(value) -> bool:
    """Whether a value carries no information.

    Servers legitimately differ on whether they SEND a member at its default or omit it — Java emits
    ``false``/``0``/``""``, the ports omit them — and a renderer cannot tell the two apart. Comparing
    them would make the corpus report dozens of differences that mean nothing.
    """
    return value is None or value == [] or value == {} or value is False or value == 0 or value == ""


def normalise(node, in_actions: bool = False):
    """Mirrors the Java normaliser: drop volatile and empty members, sort keys. An ACTION's id is
    not volatile: it is the name the client sends, so a missing or renamed action is a contract
    break (the corpus used to drop it with every generated id, which is how the ports' CRUD forms
    shipped with dead Save/Edit buttons unnoticed)."""
    if isinstance(node, dict):
        out = {}
        for key in sorted(node):
            if key in VOLATILE and not (key == "id" and in_actions):
                continue
            value = normalise(node[key], key == "actions")
            if _is_default(value):
                continue  # absent and default mean the same thing to a renderer
            out[key] = value
        return out
    if isinstance(node, list):
        return [normalise(v, in_actions) for v in node]
    return node


#: Cases whose Java reference answers the first load with a MEDIATOR shell and the listing on the
#: content load (a CRUD, or a listing promoted to one). The corpus pins that content; what it
#: leaves out on every side is the mediator PROTOCOL around it — the content's ``actions`` (Java
#: lets New/View/Delete bubble to its mediator, this port answers them in place) and the mediator's
#: private routing state (``initialData``/``state``). Mirrors Java's ``MEDIATED`` and .NET's.
MEDIATED = {"crud", "crud-grouped", "listing-navigable"}


def without_mediator_protocol(increment: dict) -> dict:
    for fragment in increment.get("fragments", []):
        fragment.pop("state", None)
        component = fragment.get("component")
        if isinstance(component, dict):
            component.pop("actions", None)
            component.pop("initialData", None)
    return increment


def actual(view_cls, case: str | None = None) -> dict:
    handler = SyncHandler(
        MateuRegistry(MODULE), rest_sources=RestSourceRegistry(file=None)
    )
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    out = normalise(inc.model_dump(by_alias=True, mode="json"))
    return without_mediator_protocol(out) if case in MEDIATED else out


def expected(case: str) -> dict:
    return normalise(json.loads((CORPUS / case / "expected.json").read_text()))


CASES = [("simple-form", SimpleForm), ("page-header", PageHeader), ("tabs", Tabs), ("zones", ZonedForm), ("money-field", MoneyField), ("banner", BannerPage), ("fab", FabPage), ("separator-text", SeparatorText), ("client-rules", ClientRules), ("static-view", StaticAbout), ("small-enum-radio", SmallEnumRadio), ("dashboard", DashboardPage), ("app-in-code", AppInCode), ("validation", ValidatedForm), ("stereotypes", Stereotypes), ("lookup", LookupForm), ("tree-select", TreeSelectForm), ("notice", NoticePage), ("bulleted-list", BulletedListPage), ("app-context", ContextApp), ("app-header-actions", HeaderActionsApp), ("toc", TocPage), ("grid-field", GridField), ("status-list", StatusListPage), ("compact", CompactPage), ("access-annotations", AccessAnnotations), ("crud", ProductsCrud), ("listing-filters", FilteredBooks), ("listing-navigable", NavigableBooks), ("crud-grouped", SalesCrud), ("listing-columns", MeasurementsListing), ("peer-nav", PeerNavPage)]


def test_every_case_of_the_corpus_is_wired():
    # a case directory missing here would be a spec this port silently never checks
    assert {d.name for d in CORPUS.iterdir() if d.is_dir()} == {case for case, _ in CASES}


@pytest.mark.parametrize("case,view", CASES)
def test_the_corpus_exists_for_every_case(case, view):
    assert (CORPUS / case / "expected.json").is_file(), (
        f"no golden for '{case}' — generate it from the Java reference "
        f"(see conformance/README.md)"
    )


@pytest.mark.parametrize("case,view", CASES)
def test_python_renders_a_page_for_every_case(case, view):
    # The floor: whatever the shape differences, the port must answer each case with a page.
    rendered = actual(view)
    assert rendered.get("fragments"), f"'{case}' produced no fragments"


#: The ONLY cases allowed to differ from the corpus, each with the precise reason. A case listed
#: here is xfail(strict=True): the day it starts matching, the suite fails until it is removed from
#: this list — so the list can only shrink. Any case NOT listed must match, or the suite fails.
#: Every reason here is a defect of the Java GOLDEN, not of the port (the goldens are regenerated
#: from Java by another stream; this port does not edit them).
KNOWN_DIVERGENCES: dict[str, str] = {}


def _cases_with_known_divergences():
    out = []
    for case, view in CASES:
        reason = KNOWN_DIVERGENCES.get(case)
        marks = [pytest.mark.xfail(strict=True, reason=reason)] if reason else []
        out.append(pytest.param(case, view, marks=marks, id=case))
    return out


def test_the_allow_list_names_only_real_cases():
    assert set(KNOWN_DIVERGENCES) <= {case for case, _ in CASES}


@pytest.mark.parametrize("case,view", _cases_with_known_divergences())
def test_python_matches_the_corpus(case, view):
    mine, theirs = actual(view, case), expected(case)
    assert mine == theirs, (
        f"'{case}': the Python wire differs from the corpus (conformance/cases/{case}). Close the "
        f"divergence in the port — or, if the Java golden itself is wrong, add the case to "
        f"KNOWN_DIVERGENCES with the precise reason. Never regenerate a golden to match a port."
    )
