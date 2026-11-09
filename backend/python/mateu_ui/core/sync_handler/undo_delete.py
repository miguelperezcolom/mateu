"""W-V-DELETE-FEEDBACK: a deletable listing that declares :class:`Restorable` deletes without
asking, answers an undoable toast and restores on its Undo (Java's DeleteEditActionHandler +
RestoreDeletedActionHandler, .NET's SyncHandler.UndoDelete)."""

from __future__ import annotations

from mateu_ui.dtos import Message as MessageDto
from mateu_ui.uidl import Restorable


def is_restorable(target) -> bool:
    return isinstance(target, Restorable) or (isinstance(target, type) and issubclass(target, Restorable))


def deleted_message(ids: list[str]) -> MessageDto:
    """"1 record deleted" / "N records deleted" with an Undo running restore-deleted."""
    text = "1 record deleted" if len(ids) == 1 else f"{len(ids)} records deleted"
    return MessageDto(
        variant="contrast", position="middle", title="", text=text, duration=10000,
        undo_action_id=Restorable.RESTORE_ACTION,
        undo_parameters={Restorable.RESTORE_IDS: list(ids)},
    )


def restored_message(count: int) -> MessageDto:
    text = "1 record restored" if count == 1 else f"{count} records restored"
    return MessageDto(variant="success", position="middle", title="", text=text, duration=3000)


def restore_ids(rq) -> list[str]:
    """The ids an Undo carries (parameter ``_restoreIds``), as text."""
    raw = (rq.parameters or {}).get(Restorable.RESTORE_IDS)
    return [str(i) for i in (raw if isinstance(raw, list) else []) if i is not None]
