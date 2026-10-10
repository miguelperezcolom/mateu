"""The top-level envelope: commands, messages, fragments and the UIIncrement."""

from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import (
    Wire,
    WIRE_VERSION,
)
from .components import Component


# ── Top-level envelope ─────────────────────────────────────────────────────────
class UICommand(Wire):
    target_component_id: str
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
    def dispatch_event(event_name: str, detail: Any | None = None) -> "UICommand":
        """Emits a named custom event from the current component (mirrors Java's
        UICommand.dispatchEvent) — @subscribe_to counterparts react to it."""
        return UICommand(
            target_component_id="ux_main",
            type="DispatchEvent",
            data=CustomEventRecord(event_name=event_name, detail=detail),
        )


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


class UIFragment(Wire):
    target_component_id: str
    component: Component | None = None
    state: Any | None = None
    data: Any | None = None
    action: str
    container_id: str | None = None


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

    @staticmethod
    def of(commands=None, messages=None, fragments=None, banners=None, append_banners=False) -> "UIIncrement":
        return UIIncrement(
            commands=commands or [],
            messages=messages or [],
            fragments=fragments or [],
            banners=banners or [],
            append_banners=append_banners,
        )
