"""The Python MCP host over REAL wire (a SyncHandler, as the FastAPI endpoint runs it), not a
hand-written fixture: a listing is projected (its metadata travels as "Crud"), a search reads its
text from the component state, and the rows of the answer reach the agent."""

import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.mcp import dispatch_tool  # noqa: E402
from mateu_uidl import Listing, Searchable, title, ui  # noqa: E402


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


MODULE = sys.modules[__name__]


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
