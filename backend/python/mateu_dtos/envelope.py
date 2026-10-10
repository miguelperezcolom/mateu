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
    def dispatch_event(event_name: str, detail: Any | None = None) -> "UICommand":
        """Emits a named custom event from the current component (mirrors Java's
        UICommand.dispatchEvent) — @subscribe_to counterparts react to it."""
        return UICommand(
            target_component_id="ux_main",
            type="DispatchEvent",
            data=CustomEventRecord(event_name=event_name, detail=detail),
        )


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
