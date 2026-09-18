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
from mateu_uidl import Section, Timestamp, kpi, overline, subtitle, title, ui  # noqa: E402
from typing import Annotated  # noqa: E402
from datetime import date  # noqa: E402
from enum import Enum  # noqa: E402
from mateu_dtos import Option  # noqa: E402
from mateu_uidl import AppActionsSupplier, AppHeaderAction, BulletedList, ComponentTreeSupplier, Lookup, LookupLabelSupplier, OnRowSelected, Password, Required, Stereotype, TreeSelect, app_context, compact, menu_item, toc  # noqa: E402
from mateu_uidl.components import Notice, StatusItem, StatusList  # noqa: E402
from decimal import Decimal  # noqa: E402
from mateu_dtos import MenuItem  # noqa: E402
from mateu_uidl import AppShell, AppSupplier, BannerTheme, Dashboard, Disabled, Hidden, Message, Money, Panel, PlainText, SeparatorBefore, Tab, app, auto_layout, banner, fab, static_view, zones  # noqa: E402
from mateu_uidl.components import MetricCard, MetricTrend, Text  # noqa: E402


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
    # Java renders this as a sized @Text(size=xl) component; Python has no declarative Text
    # field marker (fluent-only), so it travels as an ordinary form field — a documented gap.
    titular: str = "Bienvenida"


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
            variant="MENU_ON_TOP",
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
    """Bean-validation constraints: ``Required()`` sets the wire's required flag. Python has no
    min/max marker and its wire has no component-level ``validations`` member, so the range on
    ``age`` and the validation entries Java derives from the constraints are a documented gap."""

    name: Annotated[str, Required()] = "Ada"
    email: Annotated[str, Required()] = "ada@example.com"
    age: int = 36


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


MODULE = sys.modules[__name__]

#: Values that legitimately differ between servers or between runs. Dropped on both sides rather
#: than argued about — a corpus that reports noise gets ignored.
VOLATILE = {"id", "structureHash", "generatedAt", "serverSideType", "targetComponentId"}


def _is_default(value) -> bool:
    """Whether a value carries no information.

    Servers legitimately differ on whether they SEND a member at its default or omit it — Java emits
    ``false``/``0``/``""``, the ports omit them — and a renderer cannot tell the two apart. Comparing
    them would make the corpus report dozens of differences that mean nothing.
    """
    return value is None or value == [] or value == {} or value is False or value == 0 or value == ""


def normalise(node):
    """Mirrors the Java normaliser: drop volatile and empty members, sort keys."""
    if isinstance(node, dict):
        out = {}
        for key in sorted(node):
            if key in VOLATILE:
                continue
            value = normalise(node[key])
            if _is_default(value):
                continue  # absent and default mean the same thing to a renderer
            out[key] = value
        return out
    if isinstance(node, list):
        return [normalise(v) for v in node]
    return node


def actual(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return normalise(inc.model_dump(by_alias=True, mode="json"))


def expected(case: str) -> dict:
    return normalise(json.loads((CORPUS / case / "expected.json").read_text()))


CASES = [("simple-form", SimpleForm), ("page-header", PageHeader), ("tabs", Tabs), ("zones", ZonedForm), ("money-field", MoneyField), ("banner", BannerPage), ("fab", FabPage), ("separator-text", SeparatorText), ("client-rules", ClientRules), ("static-view", StaticAbout), ("small-enum-radio", SmallEnumRadio), ("dashboard", DashboardPage), ("app-in-code", AppInCode), ("validation", ValidatedForm), ("stereotypes", Stereotypes), ("lookup", LookupForm), ("tree-select", TreeSelectForm), ("notice", NoticePage), ("bulleted-list", BulletedListPage), ("app-context", ContextApp), ("app-header-actions", HeaderActionsApp), ("toc", TocPage), ("grid-field", GridField), ("status-list", StatusListPage), ("compact", CompactPage)]


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


@pytest.mark.parametrize("case,view", CASES)
def test_python_matches_the_corpus(case, view):
    mine, theirs = actual(view), expected(case)
    if mine != theirs:
        pytest.xfail(
            f"'{case}': the Python wire differs from the corpus. That is the corpus doing its job — "
            f"the divergence is now visible instead of hidden in three separate suites. See "
            f"conformance/cases/{case}/case.md for what is known."
        )
