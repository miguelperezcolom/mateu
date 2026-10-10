"""Basic display components and tabs/accordions (Java's TextDto / NoticeDto / ButtonDto / TabLayoutDto ...)."""

from __future__ import annotations

from typing import (
    Any,
    Literal,
    TYPE_CHECKING,
)

from pydantic import Field

from .base import Wire

if TYPE_CHECKING:
    from .records import Button


class ProgressBarMetadata(Wire):
    type: Literal["ProgressBar"] = "ProgressBar"
    value: float
    min: float = 0
    max: float = 1


class TextMetadata(Wire):
    type: Literal["Text"] = "Text"
    text: str
    #: The HTML container element the text renders in (e.g. "h3" for a section title, "p" for a
    #: paragraph); None lets the renderer pick (mirrors TextDto.container).
    container: str | None = None
    #: Font size: xl | l | m | s | xs. m (or None) applies nothing.
    size: str | None = None
    #: Drops the container's block margins (margin-block-start/end: 0).
    no_margins: bool = False


class NoticeMetadata(Wire):
    """A compact inline banner: theme-tinted strip with a severity icon, one line of text and an
    optional right-aligned action (mirrors ``NoticeDto``)."""

    type: Literal["Notice"] = "Notice"
    text: str | None = None
    theme: str | None = None
    icon: str | None = None
    no_icon: bool = False
    action_label: str | None = None
    action_id: str | None = None
    status: str | None = None
    slim: bool = False
    full_width: bool = False
    inline_content: bool = False


class SeparatorMetadata(Wire):
    """A horizontal divider line (``<hr>``); ``data-colspan`` in attributes makes it span the
    full form row (mirrors ``SeparatorDto``)."""

    type: Literal["Separator"] = "Separator"
    attributes: dict[str, str] = Field(default_factory=dict)


class CustomComponentMetadata(Wire):
    """A custom component (coherence-plan #14): a type ``name`` a renderer registers against + a
    ``props`` bag it reads. Slotted children ride on the client-side component's children (mirrors
    ``CustomComponentDto``)."""

    type: Literal["CustomComponent"] = "CustomComponent"
    name: str = ""
    props: dict[str, object] = Field(default_factory=dict)


class AnchorMetadata(Wire):
    """A hyperlink (mirrors ``AnchorDto``); target "_blank" is rendered with rel=noopener."""

    type: Literal["Anchor"] = "Anchor"
    text: str
    url: str
    target: str | None = None


class ButtonMetadata(Wire):
    type: Literal["Button"] = "Button"
    label: str
    action_id: str
    disabled: bool = False
    button_style: str | None = None
    #: Extra parameters merged into the dispatched action request (e.g. the optimistic-lock
    #: conflict dialog's _forceOverwrite; mirrors ButtonDto.parameters).
    parameters: Any | None = None


class TabLayoutMetadata(Wire):
    """Mirrors ``TabLayoutDto``: ``group_relationship`` carries the semantic relationship between
    the tabbed groups ("alternative" | "sequential" | "simultaneous"); ``adaptable`` tells
    renderers they may swap the concrete widget (e.g. degrade tabs to an accordion on narrow
    viewports) as long as the disclosure semantics are preserved."""

    type: Literal["TabLayout"] = "TabLayout"
    group_relationship: str | None = None
    adaptable: bool = False


class TabMetadata(Wire):
    type: Literal["Tab"] = "Tab"
    label: str
    active: bool = False
    shortcut: str | None = None


class AccordionLayoutMetadata(Wire):
    """Mirrors ``AccordionLayoutDto``. Like the Java wire, ``panels`` is empty on the wire — the
    panels travel as component children carrying :class:`AccordionPanelMetadata`."""

    type: Literal["AccordionLayout"] = "AccordionLayout"
    panels: list[Any] = Field(default_factory=list)
    variant: str | None = None


class AccordionPanelMetadata(Wire):
    """Mirrors ``AccordionPanelDto``; the panel content travels as the component's children."""

    type: Literal["AccordionPanel"] = "AccordionPanel"
    id: str | None = None
    active: bool = False
    disabled: bool = False
    label: str
