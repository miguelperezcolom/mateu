"""The agent tools against a real handler: ``mateu_search`` must FILTER (a listing reads its search
text from the component state — sending it only as a parameter answered every search unfiltered),
and ``mateu_list_routes`` must not report a menu folder as the home."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, mcp, type_name  # noqa: E402
from mateu_uidl import Listing, Searchable, ui  # noqa: E402

MODULE = sys.modules[__name__]


class Book:
    id: str = ""
    title: str = ""

    def __init__(self, id="", title=""):
        self.id, self.title = id, title


@ui("mcp-books")
class McpBooks(Listing[Book], Searchable):
    def search(self, request, http=None):
        text = (request.search_text or "").lower()
        return [b for b in (Book("1", "El Quijote"), Book("2", "Rayuela")) if text in b.title.lower()]


def sync_fn(route, action_id, component_state, parameters):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route or "", action_id=action_id or "", server_side_type=type_name(McpBooks),
        component_state=component_state or {}, parameters=parameters or {},
    )).model_dump(by_alias=True, mode="json")


def rows(increment):
    return [r["title"] for r in increment["fragments"][0]["data"]["crud"]["page"]["content"]]


def test_the_search_text_reaches_the_listing():
    captured = []

    def spy(route, action_id, state, params):
        out = sync_fn(route, action_id, state, params)
        captured.append(out)
        return out

    mcp.dispatch_tool("mateu_search", {"route": "mcp-books", "searchText": "quij"}, spy)
    assert rows(captured[0]) == ["El Quijote"]


def test_a_menu_folder_is_not_reported_as_the_home():
    app = {"fragments": [{"component": {"metadata": {"type": "App", "menu": [
        {"label": "Catalogue", "path": "/", "submenus": [{"label": "Books", "path": "/books"}]},
    ]}}}]}
    routes = mcp.list_routes_from(app)
    assert {"route": "books", "caption": "Books"} in routes
    assert {"route": "", "caption": "Home"} in routes
    assert all(r["caption"] != "Catalogue" for r in routes)
