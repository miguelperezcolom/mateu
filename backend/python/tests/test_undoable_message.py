"""Undoable toasts — the Python mirror of Java's ``UndoableMessageSyncTest``: an action returns
``Message.undoable`` and the toast carries the undo action id + parameters on the wire; the
frontend's Undo button dispatches that action on the initiator, which reverses the effect
(here: archive → restore)."""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Message, button, title, ui  # noqa: E402

ARCHIVED: list[str] = []


@ui("archive-demo")
@title("Archive")
class ArchivePage:
    name: str | None = "x"

    @button()
    def archive(self) -> Message:
        ARCHIVED.append("doc-7")
        return Message.undoable("Documento archivado", "restore", {"docId": "doc-7"})

    def restore(self, request: RunActionRq) -> Message:
        # the Undo button's undoParameters travel as ACTION PARAMETERS (not component state)
        ARCHIVED.remove(str((request.parameters or {}).get("docId")))
        return Message("Documento restaurado")


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def _run(action_id, parameters=None):
    return handler().handle(
        RunActionRq(
            route="/archive-demo",
            consumed_route="/archive-demo",
            server_side_type=type_name(ArchivePage),
            action_id=action_id,
            initiator_component_id="c1",
            component_state={},
            parameters=parameters or {},
        )
    )


def test_the_undoable_toast_carries_the_undo_action_and_parameters_on_the_wire():
    ARCHIVED.clear()

    inc = _run("archive")

    assert ARCHIVED == ["doc-7"]
    message = inc.messages[0]
    assert message.text == "Documento archivado"
    assert message.undo_label == "Deshacer"
    assert message.undo_action_id == "restore"
    assert message.undo_parameters == {"docId": "doc-7"}
    assert message.duration == 10000
    # the undo fields serialize with the camelCase wire names
    wire = json.loads(render(inc))["messages"][0]
    assert wire["undoLabel"] == "Deshacer"
    assert wire["undoActionId"] == "restore"
    assert wire["undoParameters"] == {"docId": "doc-7"}
    assert wire["variant"] == "contrast"


def test_dispatching_the_undo_action_reverses_the_effect():
    ARCHIVED.clear()
    _run("archive")

    inc = _run("restore", {"docId": "doc-7"})

    assert ARCHIVED == []
    assert any(m.text == "Documento restaurado" for m in inc.messages)


def test_plain_messages_carry_no_undo_fields():
    ARCHIVED.clear()
    _run("archive")

    inc = _run("restore", {"docId": "doc-7"})

    message = inc.messages[0]
    assert message.undo_action_id is None
    assert message.undo_label is None
