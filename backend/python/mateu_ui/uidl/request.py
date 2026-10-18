"""The action request, as a UI module sees it."""

from __future__ import annotations

from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class ActionRequest(Protocol):
    """The request an action runs for — what a UI module can type an action parameter as, with
    no import from the runtime package: ``def undo(self, request: ActionRequest)``. Mateu injects
    it into any action parameter annotated ``ActionRequest`` (or the runtime's ``RunActionRq``, or
    an unannotated parameter named ``request``). The Python analogue of Java's ``HttpRequest``
    parameter injection; the headers of the request in flight are
    ``mateu_ui.core.current_request()``."""

    #: The action being run (the method name, or a framework action id).
    action_id: str | None
    #: The route the request is for, and the part of it the mount consumed.
    route: str | None
    consumed_route: str | None
    #: Parameters of the action (a clicked row, an undo payload, an event's detail…).
    parameters: dict[str, Any]
    #: The component's state and the app-wide state, as the client sent them.
    component_state: dict[str, Any]
    app_state: dict[str, Any]
    #: The id of the component that started the action.
    initiator_component_id: str | None
    #: The server-side type the component names.
    server_side_type: str | None
