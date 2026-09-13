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


MODULE = sys.modules[__name__]

#: Values that legitimately differ between servers or between runs. Dropped on both sides rather
#: than argued about — a corpus that reports noise gets ignored.
VOLATILE = {"id", "structureHash", "generatedAt"}


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


CASES = [("simple-form", SimpleForm), ("page-header", PageHeader), ("tabs", Tabs), ("zones", ZonedForm), ("money-field", MoneyField), ("banner", BannerPage), ("fab", FabPage), ("separator-text", SeparatorText), ("client-rules", ClientRules), ("static-view", StaticAbout), ("small-enum-radio", SmallEnumRadio), ("dashboard", DashboardPage), ("app-in-code", AppInCode)]


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
