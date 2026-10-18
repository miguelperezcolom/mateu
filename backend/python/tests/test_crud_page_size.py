"""The Crud metadata carries the members the renderer does NOT default (Java's CrudlDto always
sends them). Without ``pageSize`` the Vaadin grid painted every row of a Python CRUD EMPTY — the
right count ("4 items") and no cells — and showed no pager."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.uidl import Crud, ui  # noqa: E402


class Thing:
    id: str = ""
    name: str = ""


@ui("page-size-things")
class Things(Crud[Thing]):
    def fetch(self, search):
        return []

    def get(self, id):
        return None

    def save(self, entity):
        pass

    def delete(self, id):
        pass


MODULE = sys.modules[__name__]


def crud_metadata(node):
    if isinstance(node, dict):
        if node.get("type") == "Crud":
            return node
        for v in node.values():
            found = crud_metadata(v)
            if found is not None:
                return found
    elif isinstance(node, list):
        for v in node:
            found = crud_metadata(v)
            if found is not None:
                return found
    return None


def test_the_crud_metadata_carries_the_load_bearing_defaults():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(route="/page-size-things"))
    wire = json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))
    meta = crud_metadata(wire)
    assert meta is not None
    assert meta["pageSize"] == 10
    assert meta["searchOnEnter"] is True
    assert meta["autoFocusOnSearchText"] is True
    assert meta["filtersLayout"] == "auto"
