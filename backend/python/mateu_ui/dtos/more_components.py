"""The last wire metadata types that used to be produced only by Java (3.0 port): 1:1 mirrors of
``BoardLayoutDto`` … ``WorkflowDto`` in ``io.mateu.dtos``."""

from __future__ import annotations

from typing import Any, Literal, TYPE_CHECKING

from pydantic import Field

from .base import Wire

if TYPE_CHECKING:
    from .components import Component
    from .records import Option


class BoardLayoutMetadata(Wire):
    """Mirrors ``BoardLayoutDto``; the rows travel as the component's children (``rows`` stays empty,
    as Java sends it)."""

    type: Literal["BoardLayout"] = "BoardLayout"
    rows: list[Any] = Field(default_factory=list)


class BoardLayoutRowMetadata(Wire):
    """Mirrors ``BoardLayoutRowDto``; the items travel as children."""

    type: Literal["BoardLayoutRow"] = "BoardLayoutRow"
    content: list[Any] | None = None


class BoardLayoutItemMetadata(Wire):
    """Mirrors ``BoardLayoutItemDto``; the item's content travels as its single child."""

    type: Literal["BoardLayoutItem"] = "BoardLayoutItem"
    content: list[Any] | None = None
    board_cols: int = 0


class CarouselLayoutMetadata(Wire):
    """Mirrors ``CarouselLayoutDto``; the slides travel as children."""

    type: Literal["CarouselLayout"] = "CarouselLayout"
    alt: bool = False
    animating: bool = False
    auto: bool = False
    direction: str | None = None
    disabled: bool = False
    disable_swipe: bool = False
    disable_keys: bool = False
    duration: int = 0
    dots: bool = False
    end: bool = False
    loop: bool = False
    nav: bool = False
    selected: int = 0
    total: int = 0


class ContainerMetadata(Wire):
    type: Literal["Container"] = "Container"
    id: str | None = None


class FullWidthMetadata(Wire):
    type: Literal["FullWidth"] = "FullWidth"
    id: str | None = None


class ScrollerMetadata(Wire):
    type: Literal["Scroller"] = "Scroller"


class FormItemMetadata(Wire):
    type: Literal["FormItem"] = "FormItem"


class FormSubSectionMetadata(Wire):
    type: Literal["FormSubSection"] = "FormSubSection"
    title: str | None = None


class MasterDetailLayoutMetadata(Wire):
    """Mirrors ``MasterDetailLayoutDto`` (no members: master and detail are the children)."""

    type: Literal["MasterDetailLayout"] = "MasterDetailLayout"


class MenuOptionRecord(Wire):
    """A menu entry of a ContextMenu / Directory / MenuBar — the members Java's
    ``ContextMenuMapper.buildMenu`` sets on a ``MenuOptionDto``."""

    label: str | None = None
    component: "Component | None" = None
    path: str | None = None
    visible: bool = True
    selected: bool = False
    disabled: bool = False
    disabled_on_click: bool = False
    class_name: str | None = None
    item_data: Any = None
    submenus: list["MenuOptionRecord"] = Field(default_factory=list)
    separator: bool = False


class ContextMenuMetadata(Wire):
    type: Literal["ContextMenu"] = "ContextMenu"
    menu: list[MenuOptionRecord] = Field(default_factory=list)
    wrapped: "Component | None" = None
    activate_on_left_click: bool = False


class DirectoryMetadata(Wire):
    type: Literal["Directory"] = "Directory"
    menu: list[MenuOptionRecord] = Field(default_factory=list)


class MenuBarMetadata(Wire):
    type: Literal["MenuBar"] = "MenuBar"
    options: list[MenuOptionRecord] = Field(default_factory=list)


class DataPageRecord(Wire):
    """Mirrors ``DataPageDto``: a page of raw values (rows, or untyped components)."""

    content: list[Any] = Field(default_factory=list)
    total_elements: int = 0


class GridColumnMetadata(Wire):
    """A column of a fluent Grid (mirrors ``GridColumnDto`` as Java's GridColumnMapper fills it)."""

    type: Literal["GridColumn"] = "GridColumn"
    id: str | None = None
    label: str | None = None
    data_type: str | None = None
    stereotype: str | None = None
    style: str | None = None
    css_classes: str | None = None
    align: str | None = None
    sortable: bool = False
    sorting_property: str | None = None
    filterable: bool = False
    frozen: bool = False
    frozen_to_end: bool = False
    auto_width: bool = False
    flex_grow: str | None = None
    resizable: bool = False
    width: str | None = None
    tooltip_path: str | None = None
    action_id: str | None = None
    text: str | None = None
    caption_path: str | None = None
    leading_path: str | None = None
    priority: int | None = None
    identifier: bool = False
    editable: bool = False
    editor_type: str | None = None
    editor_options: "list[Option] | None" = None
    weight: float | None = None
    aggregate: str | None = None
    line: int | None = None
    tones: dict[str, str] | None = None
    value_labels: dict[str, str] | None = None


class GridGroupColumnMetadata(Wire):
    type: Literal["GridGroupColumn"] = "GridGroupColumn"
    id: str | None = None
    label: str | None = None
    style: str | None = None
    css_classes: str | None = None
    columns: list["Component"] = Field(default_factory=list)


class GridMetadata(Wire):
    """Mirrors ``GridDto``: the columns in ``content``, the rows in ``page``."""

    type: Literal["Grid"] = "Grid"
    content: list["Component"] = Field(default_factory=list)
    page: DataPageRecord | None = None
    tree: bool = False
    size: int = 0
    wrap_cell_content: bool = False
    compact: bool = False
    no_border: bool = False
    no_row_border: bool = False
    column_borders: bool = False
    row_stripes: bool = False
    vaadin_grid_cell_background: str | None = None
    vaadin_grid_cell_padding: str | None = None


class VirtualListMetadata(Wire):
    type: Literal["VirtualList"] = "VirtualList"
    page: DataPageRecord | None = None


class ChatMetadata(Wire):
    type: Literal["Chat"] = "Chat"
    sse_url: str | None = None
    upload_url: str | None = None


class MessageListItemRecord(Wire):
    text: str | None = None
    user_name: str | None = None
    time: str | None = None
    user_img: str | None = None
    user_abbr: str | None = None
    user_color_index: int | None = None


class MessageListMetadata(Wire):
    type: Literal["MessageList"] = "MessageList"
    items: list[MessageListItemRecord] = Field(default_factory=list)


class MessageInputMetadata(Wire):
    type: Literal["MessageInput"] = "MessageInput"
    action_id: str | None = None


class NotFoundMetadata(Wire):
    type: Literal["NotFound"] = "NotFound"
    title: str | None = None
    message: str | None = None
    back_route: str | None = None
    back_label: str | None = None


class CookieConsentMetadata(Wire):
    type: Literal["CookieConsent"] = "CookieConsent"
    position: str | None = None
    cookie_name: str | None = None
    message: str | None = None
    theme: str | None = None
    learn_more: str | None = None
    learn_more_link: str | None = None
    dismiss: str | None = None


class FormEditorMetadata(Wire):
    type: Literal["FormEditor"] = "FormEditor"
    value: str | None = None


class WorkflowMetadata(Wire):
    type: Literal["Workflow"] = "Workflow"
    value: str | None = None


#: Every metadata type of this module, in the order the component union lists them.
MORE_COMPONENT_METADATA = (
    BoardLayoutMetadata,
    BoardLayoutRowMetadata,
    BoardLayoutItemMetadata,
    CarouselLayoutMetadata,
    ContainerMetadata,
    FullWidthMetadata,
    ScrollerMetadata,
    FormItemMetadata,
    FormSubSectionMetadata,
    MasterDetailLayoutMetadata,
    ContextMenuMetadata,
    DirectoryMetadata,
    MenuBarMetadata,
    GridColumnMetadata,
    GridGroupColumnMetadata,
    GridMetadata,
    VirtualListMetadata,
    ChatMetadata,
    MessageListMetadata,
    MessageInputMetadata,
    NotFoundMetadata,
    CookieConsentMetadata,
    FormEditorMetadata,
    WorkflowMetadata,
)
