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
    from .components import Component
    from .records import Button


class ProgressBarMetadata(Wire):
    type: Literal["ProgressBar"] = "ProgressBar"
    value: float
    min: float = 0
    max: float = 1
    indeterminate: bool = False
    value_key: str | None = None
    text: str | None = None
    theme: str | None = None


class MarkdownMetadata(Wire):
    """Formatted text from Markdown (mirrors ``MarkdownDto``)."""

    type: Literal["Markdown"] = "Markdown"
    markdown: str | None = None


class ImageMetadata(Wire):
    """An image by url or data URI (mirrors ``ImageDto``)."""

    type: Literal["Image"] = "Image"
    src: str | None = None
    #: the text alternative assistive technology reads; None = none declared
    alt: str | None = None


class BadgeMetadata(Wire):
    """A small status chip (mirrors ``BadgeDto``)."""

    type: Literal["Badge"] = "Badge"
    text: str | None = None
    icon_on_left: str | None = None
    icon_on_right: str | None = None
    color: str | None = None
    primary: bool = False
    small: bool = False
    pill: bool = False


class AvatarMetadata(Wire):
    """A person's picture or initials (mirrors ``AvatarDto``)."""

    type: Literal["Avatar"] = "Avatar"
    name: str | None = None
    abbreviation: str | None = None
    image: str | None = None


class AvatarGroupMetadata(Wire):
    """Overlapping avatars, the rest as +N (mirrors ``AvatarGroupDto``)."""

    type: Literal["AvatarGroup"] = "AvatarGroup"
    avatars: list[AvatarMetadata] = Field(default_factory=list)
    max_items_visible: int = 0


class ChartDatasetRecord(Wire):
    label: str | None = None
    data: list[float] = Field(default_factory=list)


class ChartDataRecord(Wire):
    labels: list[str] = Field(default_factory=list)
    datasets: list[ChartDatasetRecord] = Field(default_factory=list)


class ChartMetadata(Wire):
    """A chart: bar, line, pie, doughnut, radar, polar area, scatter, bubble (mirrors ``ChartDto``)."""

    type: Literal["Chart"] = "Chart"
    chart_type: str | None = None
    chart_data: ChartDataRecord | None = None
    chart_options: dict | None = None


class BpmnMetadata(Wire):
    """A BPMN diagram from its XML (mirrors ``BpmnDto``)."""

    type: Literal["Bpmn"] = "Bpmn"
    xml: str | None = None


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
    #: The button size (e.g. "small"); None = the renderer's default (mirrors ButtonDto.size).
    size: str | None = None
    #: A route this button navigates to on the client instead of running an action (mirrors
    #: ButtonDto.route — a Button whose actionable is a RouteLink).
    route: str | None = None
    #: The button colour (normal/success/error/contrast; mirrors ButtonDto.color).
    color: str | None = None


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


# ── Generic building blocks ported from Java (M-A5): 1:1 mirrors of the Java wire DTOs ──


class ElementMetadata(Wire):
    """An arbitrary HTML element / web component (mirrors ``ElementDto``)."""

    type: Literal["Element"] = "Element"
    name: str | None = None
    attributes: dict[str, str] | None = None
    on: dict[str, str] | None = None
    content: str | None = None
    html: bool = False


class TooltipMetadata(Wire):
    """A tooltip over a wrapped component, which travels in the metadata (mirrors ``TooltipDto``)."""

    type: Literal["Tooltip"] = "Tooltip"
    text: str | None = None
    wrapped: "Component | None" = None


class ConfirmDialogMetadata(Wire):
    """A confirmation dialog; its content travels as the component's single child (mirrors
    ``ConfirmDialogDto``)."""

    type: Literal["ConfirmDialog"] = "ConfirmDialog"
    header: str | None = None
    can_cancel: bool = False
    can_reject: bool = False
    reject_text: str | None = None
    confirm_text: str | None = None
    opened_condition: str | None = None
    confirm_action_id: str | None = None
    reject_action_id: str | None = None
    cancel_action_id: str | None = None


class DetailsMetadata(Wire):
    """A disclosure; summary and content travel in the metadata (mirrors ``DetailsDto``)."""

    type: Literal["Details"] = "Details"
    summary: "Component | None" = None
    content: "Component | None" = None
    opened: bool = False


class SplitLayoutMetadata(Wire):
    """Two panes with a splitter; master and detail travel as the two children (mirrors
    ``SplitLayoutDto``). ``orientation``: horizontal | vertical; ``variant``: small | minimal."""

    type: Literal["SplitLayout"] = "SplitLayout"
    orientation: str | None = None
    variant: str | None = None
    full_width: bool = False


class BreadcrumbRecord(Wire):
    """One breadcrumb link (mirrors ``BreadcrumbDto``)."""

    text: str | None = None
    link: str | None = None


class BreadcrumbsMetadata(Wire):
    """A breadcrumb trail (mirrors ``BreadcrumbsDto``)."""

    type: Literal["Breadcrumbs"] = "Breadcrumbs"
    current_item_text: str | None = None
    breadcrumbs: list[BreadcrumbRecord] = Field(default_factory=list)


class IconMetadata(Wire):
    """An icon by name (mirrors ``IconDto``)."""

    type: Literal["Icon"] = "Icon"
    icon: str | None = None


class NotificationMetadata(Wire):
    """An inline notification (mirrors ``NotificationDto``)."""

    type: Literal["Notification"] = "Notification"
    title: str | None = None
    text: str | None = None
