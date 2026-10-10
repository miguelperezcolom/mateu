"""User-facing data types: messages, banner themes, user-facing errors."""

from __future__ import annotations

from enum import Enum
from typing import TypeVar


T = TypeVar("T")

# ── User-facing data types ─────────────────────────────────────────────────────
class UserFacingError(Exception):
    """An error whose message is written FOR the user. Raised from an action, its text is shown
    in the error toast as is — unlike any other exception, which the error boundary answers with a
    generic text and a correlation id (the detail goes to the log). ``title`` heads the toast."""

    def __init__(self, message: str, title: str = "Error"):
        super().__init__(message)
        self.title = title


class MessageVariant(Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CONTRAST = "contrast"


class Message:
    """Returned from an action method to show a toast. A message can carry an UNDO action
    (:meth:`undoable`): the toast renders an Undo button that dispatches ``undo_action_id``
    (with ``undo_parameters`` as action parameters) on the initiator component — the standard
    recoverability affordance after destructive or bulk actions. The undo method is a plain
    action of the same class (it must reverse the effect itself, e.g. restore a soft-deleted
    row). The Python analogue of ``io.mateu.uidl.data.Message``."""

    def __init__(
        self,
        text: str,
        variant: MessageVariant = MessageVariant.SUCCESS,
        title: str = "",
        duration: int = 5000,
        undo_label: str | None = None,
        undo_action_id: str | None = None,
        undo_parameters: dict | None = None,
    ):
        self.text = text
        self.variant = variant
        self.title = title
        self.duration = duration
        self.undo_label = undo_label
        self.undo_action_id = undo_action_id
        self.undo_parameters = undo_parameters

    @staticmethod
    def undoable(text: str, undo_action_id: str, undo_parameters: dict | None = None) -> "Message":
        """A toast with an Undo button dispatching the given action (10 s so there is time to
        react)."""
        return Message(
            text,
            variant=MessageVariant.CONTRAST,
            duration=10000,
            undo_label="Deshacer",
            undo_action_id=undo_action_id,
            undo_parameters=undo_parameters,
        )


class BannerTheme(Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    DANGER = "DANGER"
