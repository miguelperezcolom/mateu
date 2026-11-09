"""W-V-DELETE-FEEDBACK: a crud declaring Restorable deletes without asking, answers an undoable
toast and restores on Undo (Java UndoDeleteSyncTest, .NET UndoDeleteTests)."""

import sys

import pytest

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler
from mateu_ui.core.action_guard import MateuForbiddenException
from mateu_ui.uidl import Crud, Restorable, title, ui


class Note:
    id: str = ""
    text: str = ""


def _note(id_, text):
    n = Note()
    n.id, n.text = id_, text
    return n


NOTES: dict[str, Note] = {}
TRASH: dict[str, Note] = {}


@ui("undo-notes")
@title("Notes")
class UndoNotes(Crud[Note], Restorable[str]):
    def fetch(self, search):
        return list(NOTES.values())

    def get(self, id_):
        return NOTES.get(id_)

    def delete(self, id_):
        if id_ in NOTES:
            TRASH[id_] = NOTES.pop(id_)

    def restore_all_by_id(self, deleted_ids, http=None):
        for id_ in deleted_ids:
            if id_ in TRASH:
                NOTES[id_] = TRASH.pop(id_)


@ui("plain-undo-notes")
@title("Notes")
class PlainUndoNotes(Crud[Note]):
    def fetch(self, search):
        return list(NOTES.values())

    def delete(self, id_):
        NOTES.pop(id_, None)


MODULE = sys.modules[__name__]


@pytest.fixture(autouse=True)
def notes():
    NOTES.clear()
    TRASH.clear()
    for n in (_note("n1", "Buy milk"), _note("n2", "Call Ana"), _note("n3", "Pay rent")):
        NOTES[n.id] = n


def run(route, action_id="", state=None, parameters=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route=route, action_id=action_id,
        component_state=state or {}, parameters=parameters or {},
    ))


def selecting(*ids):
    return {"crud_selected_items": [{"id": i} for i in ids]}


def actions(inc):
    return inc.fragments[0].component.actions


def test_a_restorable_crud_deletes_without_asking_and_offers_undo():
    acts = actions(run("undo-notes"))
    delete = next(a for a in acts if a.id == "delete")
    assert delete.confirmation_required is False
    assert any(a.id == Restorable.RESTORE_ACTION for a in acts)

    answer = run("undo-notes", "delete", selecting("n1", "n3"))
    assert list(NOTES) == ["n2"]
    [message] = answer.messages
    assert message.text == "2 records deleted"
    assert message.undo_action_id == Restorable.RESTORE_ACTION
    assert message.undo_parameters == {Restorable.RESTORE_IDS: ["n1", "n3"]}


def test_undo_restores_the_rows_and_the_listing_searches_again():
    run("undo-notes", "delete", selecting("n2"))
    undo = run("undo-notes", Restorable.RESTORE_ACTION,
               parameters={Restorable.RESTORE_IDS: ["n2"]})
    assert "n2" in NOTES
    assert [m.text for m in undo.messages] == ["1 record restored"]
    assert undo.fragments


def test_a_crud_without_restorable_keeps_the_confirmation_and_refuses_restore():
    acts = actions(run("plain-undo-notes"))
    assert next(a for a in acts if a.id == "delete").confirmation_required is True
    assert not any(a.id == Restorable.RESTORE_ACTION for a in acts)
    answer = run("plain-undo-notes", "delete", selecting("n1"))
    assert [m.text for m in answer.messages] == ["Deleted"]
    with pytest.raises(MateuForbiddenException):
        run("plain-undo-notes", Restorable.RESTORE_ACTION,
            parameters={Restorable.RESTORE_IDS: ["n1"]})
