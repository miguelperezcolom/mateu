"""User-facing data types: messages, banner themes, user-facing errors."""

from __future__ import annotations

from enum import Enum
from typing import Any, TypeVar


T = TypeVar("T")

# ── User-facing data types ─────────────────────────────────────────────────────
class UserFacingException(Exception):
    """An error whose message is MEANT for the user (mirrors Java's ``io.mateu.uidl.UserFacingException``):
    raise it from an action and its message is shown in the error toast as written, with its
    optional title. Every other exception is treated as a bug — the user sees a generic "Something
    went wrong" with a reference id and the exception is logged at ERROR under that id. Set
    ``MATEU_ERRORS_DETAILED=true`` (or ``add_mateu(..., dev=True)``) in development to see the raw
    exception in the toast."""

    def __init__(self, message: str, title: str | None = None):
        super().__init__(message)
        self.message = message
        self.title = title


#: The earlier name of :class:`UserFacingException`, kept as an alias.
UserFacingError = UserFacingException


class MessageVariant(Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CONTRAST = "contrast"


class MessagePersistence(Enum):
    """How long a :class:`Message` stays (EXPERIMENTAL; mirrors Java's ``MessagePersistence``):
    ``TOAST`` goes away on its own, ``STICKY`` stays until dismissed, ``INBOX`` is a toast that also
    lands in the notification inbox. An error is sticky unless it says otherwise."""

    TOAST = "toast"
    STICKY = "sticky"
    INBOX = "inbox"


class MessageAction:
    """An action of a :class:`Message`, a finished ``LongTask`` or an inbox ``AppNotification``
    (EXPERIMENTAL; mirrors Java's ``MessageAction``): ``route`` navigates, else ``action_id`` (with
    ``parameters``) runs; ``style`` is a hint — primary | secondary | danger | undo."""

    def __init__(
        self,
        label: str | None = None,
        action_id: str | None = None,
        parameters: dict | None = None,
        route: str | None = None,
        style: str | None = None,
    ):
        self.label = label
        self.action_id = action_id
        self.parameters = parameters
        self.route = route
        self.style = style

    @staticmethod
    def run(label: str, action_id: str, parameters: dict | None = None) -> "MessageAction":
        """An action that runs ``action_id`` (with ``parameters``)."""
        return MessageAction(label=label, action_id=action_id, parameters=parameters)

    @staticmethod
    def open(label: str, route: str) -> "MessageAction":
        """An action that navigates to ``route``."""
        return MessageAction(label=label, route=route)

    def with_style(self, style: str) -> "MessageAction":
        """The same action with a style hint (primary, secondary, danger, undo)."""
        return MessageAction(self.label, self.action_id, self.parameters, self.route, style)

    def to_wire(self):
        from mateu_ui.dtos import MessageActionDto

        return MessageActionDto(
            label=self.label, action_id=self.action_id, parameters=self.parameters,
            route=self.route, style=self.style,
        )


#: The style hint of an undo action (labelled by the renderer's own "Undo" when unlabelled).
STYLE_UNDO = "undo"


class Message:
    """Returned from an action method to show a message (a toast, a balloon, a snackbar — each
    renderer draws it its own way). What it means is semantic: the ``variant`` (severity), the
    ``persistence`` (:class:`MessagePersistence`), the ``actions`` it offers and an optional ``key``
    (a message with the same key replaces the one on screen).

    A message can carry an UNDO action (:meth:`undoable`): the toast renders an Undo button that
    dispatches ``undo_action_id`` (with ``undo_parameters`` as action parameters) on the initiator
    component — the standard recoverability affordance after destructive or bulk actions. The undo
    method is a plain action of the same class (it must reverse the effect itself, e.g. restore a
    soft-deleted row). The Python analogue of ``io.mateu.uidl.data.Message``."""

    def __init__(
        self,
        text: str,
        variant: MessageVariant = MessageVariant.SUCCESS,
        title: str = "",
        duration: int = 5000,
        undo_label: str | None = None,
        undo_action_id: str | None = None,
        undo_parameters: dict | None = None,
        persistence: MessagePersistence | None = None,
        actions: list[MessageAction] | None = None,
        key: str | None = None,
    ):
        self.text = text
        self.variant = variant
        self.title = title
        self.duration = duration
        self.undo_label = undo_label
        self.undo_action_id = undo_action_id
        self.undo_parameters = undo_parameters
        self.persistence = persistence
        self.actions = list(actions or [])
        self.key = key

    def _copy(self, **changes) -> "Message":
        values: dict[str, Any] = dict(
            text=self.text, variant=self.variant, title=self.title, duration=self.duration,
            undo_label=self.undo_label, undo_action_id=self.undo_action_id,
            undo_parameters=self.undo_parameters, persistence=self.persistence,
            actions=list(self.actions), key=self.key,
        )
        values.update(changes)
        return Message(**values)

    def with_action(self, action: MessageAction) -> "Message":
        """The same message offering one more action (EXPERIMENTAL)."""
        return self._copy(actions=[*self.actions, action])

    def with_persistence(self, persistence: MessagePersistence) -> "Message":
        """The same message with another persistence (EXPERIMENTAL)."""
        return self._copy(persistence=persistence)

    def with_key(self, key: str) -> "Message":
        """The same message with a deduplication key (EXPERIMENTAL)."""
        return self._copy(key=key)

    def to_wire(self):
        """The message on the wire (``mateu_ui.dtos.Message``)."""
        from mateu_ui.dtos import Message as MessageDto

        return MessageDto(
            variant=self.variant.value,
            position="middle",
            title=self.title,
            text=self.text,
            duration=self.duration,
            undo_label=self.undo_label,
            undo_action_id=self.undo_action_id,
            undo_parameters=self.undo_parameters,
            persistence=self.persistence.value if self.persistence is not None else None,
            actions=[a.to_wire() for a in self.actions],
            key=self.key,
        )

    @staticmethod
    def undoable(text: str, undo_action_id: str, undo_parameters: dict | None = None) -> "Message":
        """A toast with an Undo button dispatching the given action (10 s so there is time to
        react). The undo travels both as the legacy ``undo_*`` fields and as one of the actions
        (style ``undo``)."""
        return Message(
            text,
            variant=MessageVariant.CONTRAST,
            duration=10000,
            undo_action_id=undo_action_id,
            undo_parameters=undo_parameters,
            actions=[MessageAction(None, undo_action_id, undo_parameters, None, STYLE_UNDO)],
        )


class BannerTheme(Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    DANGER = "DANGER"
