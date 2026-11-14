"""The actions a crud's record pages list (the creation form's Create, the editor's Save) run when
an agent presses them through ``mateu_run_action``. In Java they are the CRUD's (the page lists them
as ``bubble``) and the tool sent them to the entity — "no such action"; this port has no mediator
above the form, so the form's own route answers them. Pinned here so the two stay equivalent: the
agent creates a product on products/new and finds it with ``mateu_search``; it saves an edit on
products/P-001/edit."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, mcp  # noqa: E402
from mateu_ui.uidl import Crud, EditableOnlyWhenCreating, ui  # noqa: E402

MODULE = sys.modules[__name__]

STORE: dict = {}


class McpProduct:
    id: Annotated[str, EditableOnlyWhenCreating()] = ""
    name: str = ""

    def __init__(self, id="", name=""):
        self.id, self.name = id, name


@ui("mcp-products")
class McpProducts(Crud[McpProduct]):
    def fetch(self, search):
        return [p for p in STORE.values() if not search or search.lower() in p.name.lower()]

    def save(self, entity):
        STORE[entity.id] = McpProduct(entity.id, entity.name)

    def delete(self, id):
        STORE.pop(id, None)


def sync_fn(route, action_id, component_state, parameters):
    # what the FastAPI MCP endpoint does: the route alone, as the tool names it
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route or "", action_id=action_id or "",
        component_state=component_state or {}, parameters=parameters or {},
    )).model_dump(by_alias=True, mode="json")


def errors(screen):
    return [m.get("text") for m in screen.get("messages", []) if m.get("variant") == "error"]


def setup_function():
    STORE.clear()
    STORE["P-001"] = McpProduct("P-001", "Espresso machine")


def test_the_creation_forms_create_creates_the_record():
    form = mcp.dispatch_tool("mateu_describe_screen", {"route": "mcp-products/new"}, sync_fn)
    assert "create" in [a["id"] for a in form["actions"]]

    created = mcp.dispatch_tool(
        "mateu_run_action",
        {"route": "mcp-products/new", "actionId": "create", "componentState": {"id": "P-100", "name": "Tamper"}},
        sync_fn,
    )

    assert errors(created) == []
    assert STORE["P-100"].name == "Tamper"
    found = mcp.dispatch_tool("mateu_search", {"route": "mcp-products", "searchText": "Tamper"}, sync_fn)
    assert [r["name"] for r in found["listing"]["rows"]] == ["Tamper"]


def test_the_editors_save_saves_the_record_it_was_opened_for():
    editor = mcp.dispatch_tool("mateu_describe_screen", {"route": "mcp-products/P-001/edit"}, sync_fn)
    assert "save" in [a["id"] for a in editor["actions"]]

    saved = mcp.dispatch_tool(
        "mateu_run_action",
        {"route": "mcp-products/P-001/edit", "actionId": "save",
         "componentState": {"id": "P-001", "name": "Espresso machine X"}},
        sync_fn,
    )

    assert errors(saved) == []
    assert STORE["P-001"].name == "Espresso machine X"
