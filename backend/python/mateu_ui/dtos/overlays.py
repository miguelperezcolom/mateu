"""Overlays and islands: Popover, Drawer, MicroFrontend, Dialog."""

from __future__ import annotations

from typing import (
    Any,
    Literal,
    TYPE_CHECKING,
)

from pydantic import PrivateAttr, model_serializer

from .base import Wire

if TYPE_CHECKING:
    from .components import Component
    from .records import PeerNav


class PopoverMetadata(Wire):
    """A popover (mirrors ``io.mateu.dtos.PopoverDto``): the wrapped component and the content of
    its floating panel, opened on ``click`` (default) or ``hover``."""

    type: Literal["Popover"] = "Popover"
    content: "Component | None" = None
    wrapped: "Component | None" = None
    trigger: str = "click"


class DrawerMetadata(Wire):
    """A drawer overlay (mirrors ``io.mateu.dtos.DrawerDto``): a panel sliding in from a viewport
    edge whose content travels in the ``content`` field. Emitted as an Add fragment so it stacks
    on the page instead of replacing it."""

    type: Literal["Drawer"] = "Drawer"
    id: str | None = None
    header_title: str | None = None
    subtitle: str | None = None
    header: "Component | None" = None
    content: "Component | None" = None
    footer: "Component | None" = None
    #: start|end (the viewport edge the drawer slides from).
    position: str = "end"
    width: str | None = None
    #: Standard drawer size ("s"|"m"|"l"|"xl"); width overrides it.
    size: str | None = None
    #: When true, the header shows a maximize button that bumps the drawer a size up.
    maximizable: bool = False
    #: Bottom drawer only: a handle collapses the drawer to its header strip and back.
    collapsible: bool = False
    #: Push (layout) mode: the drawer docks to its edge and pushes page content aside instead of
    #: overlaying it (implies non-modal). Mirrors ``io.mateu.dtos.DrawerDto.layout``.
    layout: bool = False
    #: Previous/next peer-object arrows in the drawer header; None when none.
    peer_nav: "PeerNav | None" = None
    no_padding: bool = False
    modeless: bool = False
    initial_data: Any | None = None


class MicroFrontendMetadata(Wire):
    """A remote Mateu UI embedded as an island inside this page (mirrors
    ``io.mateu.dtos.MicroFrontendDto``): the renderer mounts a mateu-ux against
    ``base_url``/``route`` and the island runs its own sync loop against the remote backend."""

    type: Literal["MicroFrontend"] = "MicroFrontend"
    base_url: str
    route: str = ""
    consumed_route: str = "_empty"
    style: str | None = None
    css_classes: str | None = None
    server_side_type: str = ""
    app_state: Any | None = None
    action_id: str | None = None
    #: The remote's answer to the load (its UIIncrement JSON), when the HOST resolved it while
    #: building this response (``Resolve.SERVER``): the renderer paints it instead of asking the
    #: remote, and everything after the first paint still goes to ``base_url``. Omitted when the
    #: renderer has to ask — the shape every micro frontend had before (mirrors
    #: ``MicroFrontendDto.resolved``).
    resolved: Any | None = None
    #: What the host needs to resolve it (a ``mateu_ui.core.microfrontends.ServerResolution``);
    #: server side only, never serialised (mirrors ``MicroFrontendDto.server``).
    _server: Any = PrivateAttr(default=None)

    @model_serializer(mode="wrap")
    def _omit_unresolved(self, handler):
        data = handler(self)
        if data.get("resolved", 0) is None:
            del data["resolved"]
        return data


class DialogMetadata(Wire):
    """A modal dialog overlay (mirrors ``io.mateu.dtos.DialogDto``)."""

    type: Literal["Dialog"] = "Dialog"
    id: str | None = None
    header_title: str | None = None
    header: "Component | None" = None
    content: "Component | None" = None
    footer: "Component | None" = None
    no_padding: bool = False
    modeless: bool = False
    width: str | None = None
    height: str | None = None
    close_button_on_header: bool = True
    initial_data: Any | None = None
