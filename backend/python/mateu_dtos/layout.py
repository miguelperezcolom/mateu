"""Page and layout metadata: page, card, div, vertical/horizontal/form layouts (Java's PageDto / *LayoutDto)."""

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
    from .records import (
        Badge,
        Banner,
        Button,
        Fab,
        Kpi,
        PeerNav,
    )


class PageMetadata(Wire):
    type: Literal["Page"] = "Page"
    title: str | None = None
    page_title: str | None = None
    subtitle: str | None = None
    toolbar: list["Button"] = Field(default_factory=list)
    buttons: list["Button"] = Field(default_factory=list)
    level: int = 0
    read_only: bool = False
    actions: Any | None = None
    #: Sticky sections index: None = renderer decides (auto), True = force, False = off.
    toc: bool | None = None
    badges: list["Badge"] = Field(default_factory=list)
    kpis: list["Kpi"] = Field(default_factory=list)
    banners: list["Banner"] = Field(default_factory=list)
    fabs: list["Fab"] = Field(default_factory=list)
    #: The coarse page type (the family of Redwood page templates; mirrors PageDto.pageType).
    page_type: str | None = None
    #: Previous/next peer-object arrows in the page header; None when the page supplies none.
    peer_nav: "PeerNav | None" = None
    #: The page's "last updated" timestamp shown in the header; None when the page declares none.
    timestamp: str | None = None
    #: The small line of text shown ABOVE the title (the Redwood overlineText header element);
    #: None when the page declares none.
    overline: str | None = None
    #: What the header shows while ``title`` is still empty (the Redwood pageTitlePlaceholder
    #: header element). A placeholder, NOT a default: renderers must ignore it once a title exists.
    title_placeholder: str | None = None


class FormMetadata(Wire):
    """A titled form panel with its own toolbar (header) and buttons (footer) — e.g. the row editor
    of a grid field (mirrors io.mateu.dtos.FormDto, wire type "Form")."""

    type: Literal["Form"] = "Form"
    title: str | None = None
    subtitle: str | None = None
    read_only: bool = False
    no_header: bool = False
    toolbar: list["Button"] = Field(default_factory=list)
    buttons: list["Button"] = Field(default_factory=list)
    header: list["Component"] = Field(default_factory=list)
    footer: list["Component"] = Field(default_factory=list)


class CardMetadata(Wire):
    type: Literal["Card"] = "Card"
    content: "Component"
    title: str | None = None
    variants: list[str] = Field(default_factory=lambda: ["outlined"])


class CustomFieldMetadata(Wire):
    """A form slot holding a COMPONENT instead of an input: a component-holder field of a reflected
    page (a fluent component, a business component reference, an adapted object, an embedded
    island). Mirrors io.mateu.dtos.CustomFieldDto."""

    type: Literal["CustomField"] = "CustomField"
    label: str | None = None
    content: "Component | None" = None
    colspan: int = 1


class DivMetadata(Wire):
    type: Literal["Div"] = "Div"
    content: Any | None = None


class VerticalLayoutMetadata(Wire):
    type: Literal["VerticalLayout"] = "VerticalLayout"
    spacing: bool = False
    #: Cross-axis alignment of the children (START/CENTER/END/STRETCH; mirrors
    #: VerticalLayoutDto.horizontalAlignment). None lets the renderer default.
    horizontal_alignment: str | None = None


class HorizontalLayoutMetadata(Wire):
    type: Literal["HorizontalLayout"] = "HorizontalLayout"
    spacing: bool = True
    #: Lets the row's items wrap to the next line (responsive zone stacking).
    wrap: bool = False


class FormLayoutMetadata(Wire):
    type: Literal["FormLayout"] = "FormLayout"
    max_columns: int = 2
    auto_responsive: bool = True
    #: Whether fields expand to fill the column width (Java's FormLayoutDto.expandColumns).
    expand_columns: bool = True
    #: The minimum responsive column width (Java's FormLayoutDto.columnWidth); "7em" in compact
    #: mode, None (renderer default) otherwise.
    column_width: str | None = None
    #: Where the field labels sit: True = a label column aside (left of) each field row instead
    #: of labels on top (mirrors FormLayoutDto.labelsAside). An explicit
    #: ``@form_layout(labels_aside=...)`` wins; otherwise inferred from the form's shape.
    labels_aside: bool = False


class FormRowMetadata(Wire):
    type: Literal["FormRow"] = "FormRow"


class FormSectionMetadata(Wire):
    type: Literal["FormSection"] = "FormSection"
    title: str
