"""The audit hook — Python analogues of the Java uidl types ``io.mateu.uidl.audit.*``.

EXPERIMENTAL: may change in a minor release. Mateu ships UI only: it says what happened; where the
trail is kept is the application's.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from .security import Identity


class ActionOutcome(str, Enum):
    """How a Mateu request ended: the ``mateu.outcome`` of its span and metrics, and the outcome an
    :class:`ActionAuditListener` hears."""

    #: The request was answered as asked.
    OK = "ok"
    #: Refused with a message meant for the user (a ``UserFacingError`` or a validation error).
    USER_ERROR = "user_error"
    #: Refused (403): the caller may not see the route or run the action.
    FORBIDDEN = "forbidden"
    #: The route, or the record it names, does not exist.
    NOT_FOUND = "not_found"
    #: A bug: the user saw "Something went wrong" with a reference id.
    ERROR = "error"


@dataclass(frozen=True)
class ActionAuditEvent:
    """One Mateu request, as an audit trail needs it: who did what, on which records, when and how
    it ended. It never carries field values, component state or action parameters.

    ``caller`` is the identity the host framework authenticated (None = anonymous); ``view`` the
    view class the request resolved to (else the server-side type the client named);
    ``record_ids`` the ids of the records the action acted on when the CRUD knows them (save,
    create, delete, restore, update-row); ``error_reference`` the reference the user was shown for
    :attr:`ActionOutcome.ERROR`."""

    caller: Identity | None
    route: str
    action_id: str
    view: str | None
    record_ids: tuple[str, ...]
    at: datetime
    duration_millis: int
    outcome: ActionOutcome
    correlation_id: str | None
    error_reference: str | None = None

    @property
    def reserved_action(self) -> bool:
        """Whether the action is Mateu's own plumbing (its id starts with ``_``)."""
        return self.action_id.startswith("_")


class ActionAuditListener(ABC):
    """Hears every Mateu request once it has ended — the hook for an audit trail. Pass any number
    to ``add_mateu(audit_listeners=[...])``; each hears the same event. A listener that raises does
    not fail the request: Mateu logs it once per listener class and goes on. Keep it quick."""

    @abstractmethod
    def on_action(self, event: ActionAuditEvent) -> None:  # pragma: no cover
        ...


__all__ = ["ActionAuditEvent", "ActionAuditListener", "ActionOutcome"]
