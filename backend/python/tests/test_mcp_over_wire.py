"""The Python MCP host over REAL wire (a SyncHandler, as the FastAPI endpoint runs it), not a
hand-written fixture: a listing is projected (its metadata travels as "Crud"), a search reads its
text from the component state, and the rows of the answer reach the agent."""

import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.mcp import dispatch_tool  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Deletable,
    Identity,
    Listing,
    Searchable,
    button,
    eyes_only,
    fab,
    list_toolbar_button,
    title,
    ui,
)


@dataclass
class McpBook:
    id: str
    title: str


@ui("mcp-books")
@title("Books")
class McpBooks(Listing[McpBook], Searchable):
    def search(self, request, http=None):
        text = request.search_text or ""
        return [b for b in (McpBook("b1", "El Quijote"), McpBook("b2", "Rayuela")) if text in b.title]


@ui("mcp-restricted")
@title("Restricted")
class McpRestrictedForm:
    name: str = "Ada"

    @button
    def greet(self):
        return "done"

    @button("Purge everything")
    @eyes_only(roles=["admin"])
    def purge(self):
        return "purged"

    @fab("vaadin:bomb")
    @eyes_only(roles=["admin"])
    def detonate(self):
        return "boom"


@ui("mcp-restricted-books")
@title("Restricted books")
class McpRestrictedBooks(Listing[McpBook], Deletable):
    def search(self, request, http=None):
        return [McpBook("b1", "El Quijote")]

    def delete_all_by_id(self, selected_ids, http=None):
        pass

    @list_toolbar_button("Archive selected")
    @eyes_only(roles=["admin"])
    def archive(self, selection):
        pass


MODULE = sys.modules[__name__]


def sync_as(identity):
    def sync(route, action_id, component_state, parameters):
        handler = SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: identity)
        rq = RunActionRq(
            route=route or "",
            action_id=action_id or "",
            component_state=component_state or {},
            parameters=parameters or {},
        )
        return handler.handle(rq).model_dump(by_alias=True, mode="json")

    return sync


def sync_fn(route, action_id, component_state, parameters):
    """What the FastAPI endpoint hands dispatch_tool."""
    handler = SyncHandler(MateuRegistry(MODULE))
    rq = RunActionRq(
        route=route or "",
        action_id=action_id or "",
        component_state=component_state or {},
        parameters=parameters or {},
    )
    return handler.handle(rq).model_dump(by_alias=True, mode="json")


def test_a_listing_is_projected_with_its_search_box():
    screen = dispatch_tool("mateu_describe_screen", {"route": "mcp-books"}, sync_fn)
    assert screen["listing"]["searchable"] is True
    assert [c["id"] for c in screen["listing"]["columns"]] == ["id", "title"]


def test_a_search_filters_by_the_text_and_answers_its_rows():
    screen = dispatch_tool("mateu_search", {"route": "mcp-books", "searchText": "Ray"}, sync_fn)
    rows = screen["listing"]["rows"]
    assert [r["title"] for r in rows] == ["Rayuela"]
    assert "_rowNumber" not in rows[0]
    assert screen["listing"]["totalElements"] == 1


def test_a_search_without_text_answers_every_row():
    screen = dispatch_tool("mateu_search", {"route": "mcp-books"}, sync_fn)
    assert [r["id"] for r in screen["listing"]["rows"]] == ["b1", "b2"]


def test_an_eyes_only_action_is_not_advertised_to_a_caller_who_may_not_run_it():
    import json

    def described(route, identity):
        return json.dumps(dispatch_tool("mateu_describe_screen", {"route": route}, sync_as(identity)))

    anonymous = described("mcp-restricted", None)
    assert "greet" in anonymous
    for leaked in ("purge", "Purge everything", "detonate"):
        assert leaked not in anonymous
    listing = described("mcp-restricted-books", None)
    assert "archive" not in listing and "Archive selected" not in listing

    admin = Identity(roles=("admin",))
    assert "Purge everything" in described("mcp-restricted", admin)
    assert "Archive selected" in described("mcp-restricted-books", admin)
