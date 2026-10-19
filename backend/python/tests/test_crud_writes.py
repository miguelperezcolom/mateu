"""A Crud that only says how to READ must not pretend its writes succeeded: ``Crud.save`` and
``Crud.delete`` used to be ``...`` — a crud implementing only ``fetch`` rendered New/Edit/Delete,
answered "Saved"/"Deleted" and discarded every write. The defaults now refuse with a user-facing
error naming the override to write (.NET's ``Crud<T>.Save``/``Delete``; Java's ``AutoCrud.store()``
is abstract for the same reason)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.error_boundary import describe  # noqa: E402
from mateu_ui.uidl import Crud, UserFacingException, ui  # noqa: E402


class StoredNote:
    id: str = ""
    text: str = ""

    def __init__(self, id="", text=""):
        self.id, self.text = id, text


@ui("notes-readonly-store")
class FetchOnlyNotes(Crud[StoredNote]):
    def fetch(self, search):
        return [StoredNote("n1", "Hello")]


MODULE = sys.modules[__name__]


def run(route: str, action_id: str, state: dict):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route="/notes-readonly-store",
        server_side_type=type_name(FetchOnlyNotes), action_id=action_id,
        initiator_component_id="c1", component_state=state,
    ))


def shown(error: BaseException) -> dict:
    return describe(error, detailed=False)


def test_the_default_save_refuses_with_a_user_facing_error_naming_the_override():
    with pytest.raises(UserFacingException) as e:
        FetchOnlyNotes().save(StoredNote())
    assert e.value.title == "Not implemented"
    assert "override save" in e.value.message
    assert "FetchOnlyNotes" in e.value.message


def test_the_default_delete_refuses_with_a_user_facing_error_naming_the_override():
    with pytest.raises(UserFacingException) as e:
        FetchOnlyNotes().delete("n1")
    assert "override delete" in e.value.message


def _toast(fn) -> dict:
    """The error toast a request answers: raised and described by the adapter's boundary, or
    already mapped onto the increment by the handler."""
    try:
        inc = fn()
    except Exception as error:  # noqa: BLE001
        return shown(error)
    messages = [m for m in inc.messages if m.variant == "error"]
    assert messages, f"expected an error, got {inc.model_dump_json()}"
    return {"title": messages[0].title, "text": messages[0].text}


def test_saving_through_the_crud_reports_the_error_instead_of_saved():
    toast = _toast(lambda: run("/notes-readonly-store/n1/edit", "save", {"id": "n1", "text": "Bye"}))
    assert toast["title"] == "Not implemented"
    assert "override save" in toast["text"]


def test_deleting_selected_rows_reports_the_error_instead_of_deleted():
    toast = _toast(lambda: run("/notes-readonly-store", "delete",
                               {"crud_selected_items": [{"id": "n1"}]}))
    assert "override delete" in toast["text"]
