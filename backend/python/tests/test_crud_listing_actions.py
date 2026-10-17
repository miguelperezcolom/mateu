"""The two listing actions a plain Crud advertises but used to drop: the id column is a link to the
record (``view`` → its route), and Delete on the LISTING deletes the rows selected in the grid (it
used to answer nothing unless the route named a record). The wire of the listing itself is pinned
by the conformance corpus (``conformance/cases/crud``)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, ui  # noqa: E402


class Gadget:
    id: str = ""
    name: str = ""

    def __init__(self, id="", name=""):
        self.id, self.name = id, name


_STORE: dict[str, Gadget] = {}


@ui("gadgets")
class Gadgets(Crud[Gadget]):
    def fetch(self, search):
        return list(_STORE.values())

    def get(self, id):
        return _STORE.get(id)

    def save(self, entity):
        _STORE[entity.id] = entity

    def delete(self, id):
        _STORE.pop(id, None)


MODULE = sys.modules[__name__]


def run(action_id: str, **kw):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="/gadgets", consumed_route="/gadgets", server_side_type=type_name(Gadgets),
        action_id=action_id, initiator_component_id="c1", **kw,
    ))


def test_the_id_link_opens_the_record():
    inc = run("view", parameters={"id": "g1", "name": "Gear"})
    # a server-driven navigation clears the unsaved-changes flag first
    clean, command = inc.commands
    assert clean.type == "MarkAsClean"
    assert command.type == "NavigateTo"
    assert command.data == "/gadgets/g1"


def test_delete_on_the_listing_deletes_the_selected_rows_and_searches_again():
    _STORE.clear()
    for g in (Gadget("g1", "Gear"), Gadget("g2", "Cog"), Gadget("g3", "Sprocket")):
        _STORE[g.id] = g
    inc = run("delete", component_state={
        "crud_selected_items": [{"id": "g1", "name": "Gear"}, {"id": "g3", "name": "Sprocket"}],
    })
    assert set(_STORE) == {"g2"}
    assert [m.text for m in inc.messages] == ["Deleted"]
    assert "Cog" in inc.model_dump_json() and "Sprocket" not in inc.model_dump_json()
