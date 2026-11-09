"""HeroSearchListing[F, R]: the hero search page with its own FILTERS type (Java's
``HeroSearch<Filters, Row>``, .NET's ``HeroSearch<TFilters, TRow>``) — a centered hero over a
read-only listing whose facet bar is the filters type, results as cards, starting empty. The old
``HeroSearch[T]`` (a crud whose facets are the entity's fields) keeps working unchanged; the wire
itself is pinned by the conformance case ``hero-search-filters``."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.page_type_inference import page_type_of  # noqa: E402
from mateu_ui.uidl import HeroSearch, HeroSearchListing, title, ui  # noqa: E402

MODULE = sys.modules[__name__]


class Hotel:
    id: str = ""
    name: str = ""
    city: str = ""
    stars: int = 0

    def __init__(self, id="", name="", city="", stars=0):
        self.id, self.name, self.city, self.stars = id, name, city, stars


class HotelFilters:
    city: str | None = None
    pool: bool = False


HOTELS = [Hotel("h1", "Palace", "Palma", 5), Hotel("h2", "Inn", "Inca", 2)]


@ui("hsl-hotels")
@title("Hotels")
class HotelSearch(HeroSearchListing[HotelFilters, Hotel]):
    def hero_title(self):
        return "Find your stay"

    def search(self, request, http=None):
        city = getattr(request.filters, "city", None) if request.filters is not None else None
        return [h for h in HOTELS if not city or city.lower() in h.city.lower()]


@ui("hsl-legacy")
class LegacyHero(HeroSearch[Hotel]):
    def fetch(self, search):
        return list(HOTELS)


def handle(cls, **rq):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(cls), **rq))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def first_load(cls) -> dict:
    return handle(cls).model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def test_the_facet_bar_is_the_filters_type_not_the_row():
    crud = next(n for n in walk(first_load(HotelSearch)) if n.get("type") == "Crud")
    assert [f["fieldId"] for f in crud["filters"]] == ["city", "pool"]
    assert [c["metadata"]["id"] for c in crud["columns"]] == ["id", "name", "city", "stars"]
    assert crud["gridLayout"] == "cards" and crud["searchable"] is True


def test_the_hero_sits_over_the_listing_and_the_page_starts_empty():
    comp = first_load(HotelSearch)
    root = comp["children"][0]
    assert root["metadata"]["type"] == "VerticalLayout"
    hero, listing = root["children"]
    assert hero["metadata"]["type"] == "HeroSection"
    assert hero["metadata"]["title"] == "Find your stay" and hero["metadata"]["centered"] is True
    assert listing["metadata"]["type"] == "Crud"
    assert not comp.get("triggers")
    assert comp["pageType"] == "landing" and page_type_of(HotelSearch) == "landing"


def test_a_search_applies_the_typed_filters():
    inc = handle(HotelSearch, action_id="search", initiator_component_id="c1",
                 component_state={"city": "pal"})
    rows = [n for n in walk(inc.model_dump(by_alias=True, mode="json")) if n.get("name") == "Palace"]
    assert rows
    assert not [n for n in walk(inc.model_dump(by_alias=True, mode="json")) if n.get("name") == "Inn"]


def test_the_old_hero_search_keeps_its_entity_facets():
    crud = next(n for n in walk(first_load(LegacyHero)) if n.get("type") == "Crud")
    assert {f["fieldId"] for f in crud["filters"]} >= {"name", "city", "stars"}
    assert crud["crudlType"] == "cards"
