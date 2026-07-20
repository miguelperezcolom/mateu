"""The coarse page type (the ``pageType`` wire field — which family of Oracle Redwood page
templates a view belongs to) — the Python mirror of Java's ``PageTypeResolver`` and
``@PageTemplate``: archetype base classes map to their template family, a MetricCard field on
the view means dashboard, a plain reflected form is the "form" default (never None), and the
explicit ``@page_template(PageType.X)`` always wins over the inference.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import (  # noqa: E402
    ImportWizard,
    MateuRegistry,
    RunActionRq,
    SyncHandler,
    type_name,
)
from mateu_core.page_type_inference import page_type_of  # noqa: E402
from mateu_uidl import (  # noqa: E402
    CalendarPage,
    CollectionDetail,
    ComponentTreeSupplier,
    Crud,
    Dashboard,
    Foldout,
    GeneralOverview,
    HeroSearch,
    ItemOverview,
    Listing,
    PageType,
    SmartSearchPage,
    TodoList,
    Welcome,
    Wizard,
    page_template,
    title,
    ui,
)
from mateu_uidl.components import MetricCard  # noqa: E402


# ── (a) Minimal archetype subclasses — one per mapped base class ──────────────
class ADashboard(Dashboard):
    pass


class AWelcome(Welcome):
    pass


class AHeroSearch(HeroSearch):
    pass


class ASmartSearch(SmartSearchPage):
    pass


class ATodoList(TodoList):
    pass


class ACalendarPage(CalendarPage):
    pass


class ACollectionDetail(CollectionDetail):
    pass


class ACrud(Crud):
    pass


class AListing(Listing):
    pass


class AWizard(Wizard):
    pass


class ImportRow:
    name: str = ""


class AnImportWizard(ImportWizard[ImportRow]):
    pass


class AFoldout(Foldout):
    pass


class AnItemOverview(ItemOverview):
    pass


class AGeneralOverview(GeneralOverview):
    pass


# ── (b) A plain reflected form ────────────────────────────────────────────────
@ui("plain-form")
@title("Plain form")
class PlainForm:
    name: str = "n"
    email: str = "e"


# ── (c) A view carrying a MetricCard field ────────────────────────────────────
@ui("metrics-board")
@title("Metrics")
class MetricsBoard(ComponentTreeSupplier):
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2", unit="M€")

    def component(self):
        return self.revenue


# ── (d) The explicit page template wins ───────────────────────────────────────
@ui("explicit-process")
@title("Explicit process")
@page_template(PageType.PROCESS)
class ExplicitProcessForm:
    name: str = "n"


# ── (e) A declarative listing ─────────────────────────────────────────────────
class BookingFilters:
    guest: str | None = None


class BookingRow:
    locator: str = ""
    guest: str = ""


@ui("bookings")
@title("Bookings")
class BookingsListing(Listing[BookingFilters, BookingRow]):
    def search(self, search_text, filters):
        return []


MODULE = sys.modules[__name__]


# ── Helpers ─────────────────────────────────────────────────────────────────────
def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def walk(node):
    """Every component dict in the tree, descending children AND metadata content (Card/Div nest
    their content inside the metadata record, like the Java wire)."""
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def pages(root) -> list[dict]:
    return [
        c["metadata"]
        for c in walk(root)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == "Page"
    ]


# ── (a) Archetype subclasses resolve to their template family ─────────────────
def test_archetype_subclasses_resolve_to_their_template_family():
    cases = {
        ADashboard: "dashboard",
        AWelcome: "landing",
        AHeroSearch: "landing",  # a HeroSearch IS a Crud but resolves to landing
        ASmartSearch: "collection",
        ATodoList: "collection",
        ACalendarPage: "collection",
        ACollectionDetail: "collection",
        ACrud: "collection",
        AListing: "collection",
        AWizard: "process",
        AnImportWizard: "process",  # an ImportWizard IS a Wizard
        AFoldout: "detail",
        AnItemOverview: "detail",
        AGeneralOverview: "detail",
    }
    for cls, expected in cases.items():
        assert page_type_of(cls) == expected, cls.__name__


# ── (b) A plain form is the "form" default, on the envelope AND the page metadata ──
def test_a_plain_form_resolves_to_form_and_is_never_none():
    component = component_tree(PlainForm)
    assert component["pageType"] == "form"
    (page,) = pages(component)
    assert page["pageType"] == "form"


# ── (c) A MetricCard field means dashboard ────────────────────────────────────
def test_a_view_with_a_metric_card_field_resolves_to_dashboard():
    assert page_type_of(MetricsBoard) == "dashboard"
    assert component_tree(MetricsBoard)["pageType"] == "dashboard"


# ── (d) The explicit @page_template wins over the inference ───────────────────
def test_the_explicit_page_template_wins_over_the_inference():
    component = component_tree(ExplicitProcessForm)
    assert component["pageType"] == "process"
    (page,) = pages(component)
    assert page["pageType"] == "process"


# ── (e) A Listing resolves to collection ──────────────────────────────────────
def test_a_listing_resolves_to_collection():
    component = component_tree(BookingsListing)
    assert component["pageType"] == "collection"
    (page,) = pages(component)
    assert page["pageType"] == "collection"
