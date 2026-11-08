"""The top-level envelope: commands, messages, fragments and the UIIncrement."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from pydantic import Field, model_serializer, model_validator

from .base import (
    Wire,
    WIRE_VERSION,
)
from .app import HeaderValue
from .components import Component

if TYPE_CHECKING:
    from .fields import RestSourceEntryRecord


# ── Top-level envelope ─────────────────────────────────────────────────────────
class UICommand(Wire):
    #: None for a command aimed at no component (a ``Progress``, a ``NotificationsChanged``).
    target_component_id: str | None = None
    type: str
    data: Any | None = None

    @staticmethod
    def close_modal(event_name: str | None = None, detail: Any | None = None) -> "UICommand":
        """Closes the topmost open overlay (dialog or drawer). With ``event_name`` it also emits
        that event (carrying ``detail``) through the custom-event bus so the host page can react —
        refresh itself or receive the overlay's result (mirrors Java's UICommand.closeModal)."""
        data = None if event_name is None else CustomEventRecord(event_name=event_name, detail=detail)
        return UICommand(target_component_id="ux_main", type="CloseModal", data=data)

    @staticmethod
    def announce(text: str) -> "UICommand":
        """Announces ``text`` to screen readers through the page's POLITE live region — tells a
        non-sighted user what happened when nothing on screen takes focus. Nothing is drawn
        (mirrors Java's UICommand.announce)."""
        return UICommand(
            target_component_id="ux_main", type="Announce",
            data=Announcement(text=text, assertive=False),
        )

    @staticmethod
    def announce_assertive(text: str) -> "UICommand":
        """Like :meth:`announce`, through the ASSERTIVE region (interrupts — errors only)."""
        return UICommand(
            target_component_id="ux_main", type="Announce",
            data=Announcement(text=text, assertive=True),
        )

    @staticmethod
    def print() -> "UICommand":
        """Prints the current page with the browser's print dialog, leaving the app chrome out
        (EXPERIMENTAL; mirrors Java's UICommand.print)."""
        return UICommand(target_component_id="ux_main", type="Print")

    @staticmethod
    def update_header_value(id: str, value: str | None) -> "UICommand":
        """Changes the live header value ``id`` (the business date…) to ``value`` — in this tab and
        the other tabs of the same browser. To reach every OTHER session, publish it with
        ``LiveHeaderValues.publish`` (EXPERIMENTAL; mirrors Java's UICommand.updateHeaderValue)."""
        return UICommand(
            target_component_id="ux_main", type="UpdateHeaderValue",
            data=HeaderValue(id=id, label=None, value=value),
        )

    @staticmethod
    def dispatch_event(event_name: str, detail: Any | None = None) -> "UICommand":
        """Emits a named custom event from the current component (mirrors Java's
        UICommand.dispatchEvent) — @subscribe_to counterparts react to it."""
        return UICommand(
            target_component_id="ux_main",
            type="DispatchEvent",
            data=CustomEventRecord(event_name=event_name, detail=detail),
        )

    @staticmethod
    def agent_push(kind: str, event: str, detail: Any) -> "UICommand":
        """One message of a live UI session's agent channel (``_agent-channel``): ``kind`` is
        status | render | navigate | event, ``event`` the UI event it maps to and ``detail`` its
        payload (mirrors Java's AgentPush command; see conformance/mcp/README.md "Live UI push")."""
        return UICommand(
            target_component_id="ux_main",
            type="AgentPush",
            data=AgentPushMessage(kind=kind, event=event, detail=detail),
        )


class AgentPushMessage(Wire):
    """The payload of an ``AgentPush`` command: ``{kind, event, detail}``."""

    kind: str
    event: str
    detail: Any | None = None


class Announcement(Wire):
    """The payload of an ``Announce`` command (mirrors ``io.mateu.uidl.data.Announcement``): a
    text for assistive technology, read through the polite live region, or the assertive one
    when ``assertive``."""

    text: str
    assertive: bool = False


class CustomEventRecord(Wire):
    """A named custom event riding on a CloseModal/DispatchEvent command (mirrors
    ``io.mateu.uidl.fluent.CustomEvent``)."""

    event_name: str
    detail: Any | None = None


class Message(Wire):
    variant: str
    position: str
    title: str
    text: str
    duration: int
    #: The undoable-toast fields (mirrors MessageDto.undoLabel/undoActionId/undoParameters):
    #: when set, the toast renders an Undo button dispatching undo_action_id with
    #: undo_parameters as action parameters on the initiator component.
    undo_label: str | None = None
    undo_action_id: str | None = None
    undo_parameters: dict[str, Any] | None = None
    #: toast | sticky | inbox (mirrors MessageDto.persistence): declared, else an error is sticky
    #: and anything else a toast (EXPERIMENTAL).
    persistence: str | None = None
    #: What the user can do from the message — the undo is one of them (style "undo").
    actions: "list[MessageActionDto]" = Field(default_factory=list)
    #: A message with the same key replaces the one on screen (and the inbox entry).
    key: str | None = None

    @model_validator(mode="after")
    def _errors_stay(self) -> "Message":
        # An ERROR stays until dismissed (duration 0) in every backend and renderer (Java's
        # MessageMapper, .NET's MessageDto); the rest keep the duration they were given. Same rule
        # as Java's MessageMapper for the persistence and the undo listed among the actions.
        if self.persistence is None:
            object.__setattr__(self, "persistence", "sticky" if self.variant == "error" else "toast")
        if self.persistence == "sticky" and self.duration != 0:
            object.__setattr__(self, "duration", 0)
        if self.undo_action_id and not any(
            a.action_id == self.undo_action_id for a in self.actions
        ):
            object.__setattr__(self, "actions", [*self.actions, MessageActionDto(
                label=self.undo_label, action_id=self.undo_action_id,
                parameters=self.undo_parameters, route=None, style="undo",
            )])
        return self

    @model_serializer(mode="wrap")
    def _omit_absent(self, handler):
        # like Java's NON-default members: an empty action list / no key is not on the wire
        data = handler(self)
        for key in ("key",):
            if key in data and data[key] is None:
                del data[key]
        if "actions" in data and not data["actions"]:
            del data["actions"]
        return data


class MessageActionDto(Wire):
    """An action of a message, a finished task or an inbox entry (mirrors
    ``io.mateu.dtos.MessageActionDto``): ``route`` navigates, else ``action_id`` (with
    ``parameters``) runs; ``style`` is a hint — primary | secondary | danger | undo."""

    label: str | None = None
    action_id: str | None = None
    parameters: dict[str, Any] | None = None
    route: str | None = None
    style: str | None = None


class ProgressDto(Wire):
    """The whole current state of one long-running task — the data of a ``Progress`` command
    (mirrors ``io.mateu.dtos.ProgressDto``). Each command is self-contained: renderers upsert by
    ``task_id``. ``fraction`` None = indeterminate; ``state`` running | done | failed | cancelled."""

    task_id: str
    title: str | None = None
    text: str | None = None
    fraction: float | None = None
    done: int | None = None
    total: int | None = None
    state: str = "running"
    blocking: bool = True
    backgroundable: bool = False
    cancellable: bool = False
    retryable: bool = False
    started_at: int | None = None
    close_after_seconds: int | None = None
    error: str | None = None
    result_actions: list[MessageActionDto] = Field(default_factory=list)


class AppNotificationDto(Wire):
    """One inbox entry as pushed by ``NotificationsChanged`` (mirrors
    ``io.mateu.dtos.AppNotificationDto``)."""

    id: str
    title: str | None = None
    text: str | None = None
    route: str | None = None
    unread: bool = True
    when: str | None = None
    category: str | None = None
    variant: str | None = None
    resolved: bool = False
    actions: list[MessageActionDto] = Field(default_factory=list)
    has_detail: bool = False


class NotificationsChangedDto(Wire):
    """The data of a ``NotificationsChanged`` command: an entry added or changed, one removed, or
    — both None — "fetch the list again" (mirrors ``io.mateu.dtos.NotificationsChangedDto``)."""

    notification: AppNotificationDto | None = None
    removed_id: str | None = None


class UIFragment(Wire):
    target_component_id: str
    component: Component | None = None
    state: Any | None = None
    data: Any | None = None
    action: str
    container_id: str | None = None


class FragmentCache(Wire):
    """What a remote allows the hosts that embed its answer to do with it (mirrors
    ``io.mateu.dtos.FragmentCacheDto``): reuse it for ``max_age_seconds``, keyed by ``vary_by``
    (``none`` | ``shared`` | ``user`` | ``key``, with the opaque ``key``). ``not_modified``: the host
    said it holds ``key`` and the remote answers "use yours" — the response carries no fragments."""

    max_age_seconds: int = 0
    vary_by: str = "none"
    key: str | None = None
    not_modified: bool = False

    @model_serializer(mode="wrap")
    def _omit_defaults(self, handler):
        data = handler(self)
        for key in ("key",):
            if key in data and data[key] is None:
                del data[key]
        for key in ("not_modified", "notModified"):
            if key in data and not data[key]:
                del data[key]
        return data


class UIIncrement(Wire):
    commands: list[UICommand] = Field(default_factory=list)
    messages: list[Message] = Field(default_factory=list)
    fragments: list[UIFragment] = Field(default_factory=list)
    banners: list[Any] = Field(default_factory=list)
    append_banners: bool = False
    app_data: Any | None = None
    app_state: Any | None = None
    # Version of the wire protocol this payload conforms to (e.g. "3.0"). Additive within a major
    # version; a consumer may read it to guard against a mismatched producer. Defaults so every
    # response carries it (serialized as "wireVersion" by the camelCase alias generator).
    wire_version: str = WIRE_VERSION
    # The REST source catalogue entries this response's components name by ``ref``: the whole
    # catalogue rides the app metadata, which a page served with no app shell never receives.
    # Omitted from the JSON when there are none (mirrors UIIncrementDto.restSources).
    rest_sources: "list[RestSourceEntryRecord] | None" = None
    #: What a REMOTE allows the hosts that embed this answer to do with it (EXPERIMENTAL; mirrors
    #: ``UIIncrementDto.fragmentCache``). Omitted when None.
    fragment_cache: "FragmentCache | None" = None

    @model_serializer(mode="wrap")
    def _omit_absent_rest_sources(self, handler):
        data = handler(self)
        for key in ("rest_sources", "restSources"):
            if key in data and not data[key]:
                del data[key]
        for key in ("fragment_cache", "fragmentCache"):
            if key in data and data[key] is None:
                del data[key]
        return data

    @staticmethod
    def of(commands=None, messages=None, fragments=None, banners=None, append_banners=False) -> "UIIncrement":
        return UIIncrement(
            commands=commands or [],
            messages=messages or [],
            fragments=fragments or [],
            banners=banners or [],
            append_banners=append_banners,
        )
