"""Global entity search on the command palette — the Python mirror of Java's
``GlobalSearchSyncTest``: an app class subclassing ``GlobalSearchSupplier`` advertises it
(``AppMetadata.globalSearchEnabled``) and answers the app-level ``_globalsearch`` action with
matching entities (label, description, route, category) under ``_globalsearch``."""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    GlobalSearchResult,
    GlobalSearchSupplier,
    Message,
    app,
    button,
    menu_item,
    title,
    ui,
)


@ui("search-home")
@title("Search home")
class SearchHome:
    name: str | None = None

    @button()
    def greet(self) -> Message:
        return Message("hi")


@app("Searchable")
class SearchableApp(GlobalSearchSupplier):
    @menu_item("Home")
    def home(self) -> "SearchHome":
        return SearchHome()

    def global_search(self, search_text: str) -> list[GlobalSearchResult]:
        hits = [
            GlobalSearchResult("Acme S.L.", "CIF B123", "/customers/1", "Clientes"),
            GlobalSearchResult("Reserva R-42 (Acme)", None, "/reservations/42", "Reservas"),
            GlobalSearchResult("Globex", "CIF B999", "/customers/2", "Clientes"),
        ]
        return [h for h in hits if search_text.lower() in h.label.lower()]


@app("Not searchable")
class NoSearchApp:
    @menu_item("Home")
    def home(self) -> "SearchHome":
        return SearchHome()


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def _search(text):
    inc = handler().handle(
        RunActionRq(
            route="/searchable-app",
            consumed_route="/searchable-app",
            server_side_type=type_name(SearchableApp),
            action_id="_globalsearch",
            initiator_component_id="_ux",
            component_state={},
            parameters={"searchText": text},
        )
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "_ux"
    assert inc.fragments[0].component is None
    return inc.fragments[0].data["_globalsearch"]


def test_the_app_advertises_global_search_when_the_supplier_is_implemented():
    with_search = json.loads(
        render(handler().handle(RunActionRq(server_side_type=type_name(SearchableApp))))
    )
    assert with_search["fragments"][0]["component"]["metadata"]["globalSearchEnabled"] is True
    without = json.loads(
        render(handler().handle(RunActionRq(server_side_type=type_name(NoSearchApp))))
    )
    assert without["fragments"][0]["component"]["metadata"]["globalSearchEnabled"] is False


def test_the_search_action_answers_matching_entities_with_route_and_category():
    hits = _search("acme")
    assert len(hits) == 2
    assert hits[0] == {
        "label": "Acme S.L.",
        "description": "CIF B123",
        "route": "/customers/1",
        "category": "Clientes",
    }
    assert hits[1]["route"] == "/reservations/42"


def test_an_empty_search_text_is_forwarded_as_is():
    assert len(_search("")) == 3
