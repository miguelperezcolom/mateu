"""The last fluent components that used to exist only in Java (3.0 port): layouts (``BoardLayout``,
``CarouselLayout``, ``Container``, ``FullWidth``, ``Scroller``, ``FormItem``, ``FormSubSection``,
``MasterDetailLayout``), navigation (``ContextMenu``, ``Directory``, ``MenuBar`` over
:class:`MenuEntry` items), the fluent data ``Grid`` (``GridColumn`` / ``GridGroupColumn``), chat
(``Chat``, ``MessageList``, ``MessageInput``), ``NotFound``, ``VirtualList``, ``CookieConsent``,
``FormEditor`` and ``Workflow``.

Each one is the Python analogue of the ``io.mateu.uidl.data`` record of the same name (``MenuBar``:
``io.mateu.uidl.fluent.MenuBar``) and maps to the same wire JSON — pinned by the
``more-components`` conformance case. They are re-exported by :mod:`mateu_ui.uidl.components`.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from .components import Component, Orientation, SplitLayoutVariant


def _tuple(obj, *names: str) -> None:
    for name in names:
        object.__setattr__(obj, name, tuple(getattr(obj, name) or ()))


# ── Layouts ──────────────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class BoardLayoutItem(Component):
    """One tile of a :class:`BoardLayoutRow`, spanning ``board_cols`` columns."""

    content: Component | None = None
    board_cols: int = 0
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class BoardLayoutRow(Component):
    """One row of a :class:`BoardLayout`: its items side by side."""

    content: tuple[Component, ...] = ()
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "content")


@dataclass(frozen=True)
class BoardLayout(Component):
    """A responsive board: rows of items, each spanning some columns (Java's ``BoardLayout``)."""

    rows: tuple[BoardLayoutRow, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "rows")


@dataclass(frozen=True)
class CarouselLayout(Component):
    """Slides shown one at a time. Defaults are those of Java's ``CarouselLayout.builder()`` (every
    flag off): set ``auto``/``duration`` to autoplay, ``dots``/``nav`` for the controls, ``loop``…"""

    content: tuple[Component, ...] = ()
    alt: bool = False
    animating: bool = False
    auto: bool = False
    direction: Orientation | None = None
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
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "content")


@dataclass(frozen=True)
class Container(Component):
    """A container around one component (an absent one is an empty slot)."""

    content: Component | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class FullWidth(Component):
    """Lets its content span the full page width."""

    content: Component | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Scroller(Component):
    """A scrollable area around one component (give it a height in ``style``)."""

    content: Component | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class FormItem(Component):
    """A form item: its components laid out as one labelled form entry."""

    content: tuple[Component, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "content")


@dataclass(frozen=True)
class FormSubSection(Component):
    """A titled sub-section of a form section."""

    title: str | None = None
    content: tuple[Component, ...] = ()
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "content")


@dataclass(frozen=True)
class MasterDetailLayout(Component):
    """A master pane and an optional detail pane (they travel as the component's children)."""

    master: Component | None = None
    detail: Component | None = None
    orientation: Orientation | None = Orientation.horizontal
    variant: SplitLayoutVariant | None = SplitLayoutVariant.minimal
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


# ── Menus ────────────────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class MenuEntry:
    """One entry of a :class:`ContextMenu` / :class:`Directory` / :class:`MenuBar` (Java's
    ``Actionable``: ``Menu`` when it has ``submenu`` entries, ``RouteLink`` otherwise). ``path``
    is where it leads; None = the camelCased label, as in Java. ``component`` replaces the label
    with a component."""

    label: str = ""
    path: str | None = None
    submenu: tuple["MenuEntry", ...] = ()
    selected: bool = False
    disabled: bool = False
    disabled_on_click: bool = False
    class_name: str | None = None
    item_data: Any = None
    component: Component | None = None
    separator: bool = False

    def __post_init__(self):
        _tuple(self, "submenu")


@dataclass(frozen=True)
class MenuSeparator(MenuEntry):
    """A separator line between menu entries (Java's ``MenuSeparator``)."""

    path: str | None = ""
    separator: bool = True


@dataclass(frozen=True)
class ContextMenu(Component):
    """A menu opened by right-clicking (or, with ``activate_on_left_click``, clicking) the
    ``wrapped`` component."""

    menu: tuple[MenuEntry, ...] = ()
    wrapped: Component | None = None
    activate_on_left_click: bool = False
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "menu")


@dataclass(frozen=True)
class Directory(Component):
    """A directory of links: a menu tree drawn as a page of entries."""

    menu: tuple[MenuEntry, ...] = ()
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "menu")


@dataclass(frozen=True)
class MenuBar(Component):
    """A horizontal menu bar (entries with ``submenu`` open as dropdowns). Like Java's, its wire id
    is a fresh random one per render."""

    options: tuple[MenuEntry, ...] = ()
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "options")


# ── Grid ─────────────────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class GridColumn(Component):
    """A column of a fluent :class:`Grid` (Java's ``data.GridColumn``). ``data_type``: string |
    integer | number | money | bool | date…; numbers align to the end and booleans centre unless
    ``align`` says otherwise. ``editor_options``: objects with ``value``/``label``."""

    id: str = ""
    label: str = ""
    data_type: str | None = None
    stereotype: str | None = None
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
    editor_options: tuple[Any, ...] | None = None
    weight: float | None = None
    aggregate: str | None = None
    line: int | None = None
    tones: dict[str, str] | None = None
    value_labels: dict[str, str] | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class GridGroupColumn(Component):
    """A header spanning several columns of a :class:`Grid`."""

    id: str | None = None
    label: str = ""
    columns: tuple[GridColumn, ...] = ()
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "columns")


@dataclass(frozen=True)
class Grid(Component):
    """A data grid: its ``content`` columns (:class:`GridColumn` / :class:`GridGroupColumn`) over
    a ``page`` of rows (a :class:`~mateu_ui.uidl.listing.PageResult` of dicts or dataclasses).
    Unlike a listing it holds its rows itself: no search, no server paging."""

    content: tuple[Component, ...] = ()
    page: Any = None
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
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "content")


@dataclass(frozen=True)
class VirtualList(Component):
    """A long list rendered lazily: a ``page`` (a :class:`~mateu_ui.uidl.listing.PageResult`)
    whose ``content`` are components."""

    page: Any = None
    style: str | None = None
    css_classes: str | None = None


# ── Chat and messages ────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class Chat(Component):
    """An AI chat panel streaming from ``sse_url`` (experimental, like Java's)."""

    sse_url: str | None = None
    upload_url: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class MessageListItem:
    """One message of a :class:`MessageList`."""

    text: str | None = None
    user_name: str | None = None
    time: str | None = None
    user_img: str | None = None
    user_abbr: str | None = None
    user_color_index: int | None = None


@dataclass(frozen=True)
class MessageList(Component):
    """A list of chat messages."""

    items: tuple[MessageListItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        _tuple(self, "items")


@dataclass(frozen=True)
class MessageInput(Component):
    """A message box: sending runs ``action_id`` (the typed text arrives in the action's
    parameters, as in Java)."""

    action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


# ── Pages and misc ───────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class NotFound(Component):
    """A not-found page: title, message and a way back."""

    title: str | None = None
    message: str | None = None
    back_route: str | None = None
    back_label: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


class CookieConsentPosition(Enum):
    Top = "Top"
    Bottom = "Bottom"
    TopLeft = "TopLeft"
    TopRight = "TopRight"
    BottomLeft = "BottomLeft"
    BottomRight = "BottomRight"


@dataclass(frozen=True)
class CookieConsent(Component):
    """A cookie consent banner."""

    message: str | None = None
    dismiss: str | None = None
    position: CookieConsentPosition | None = None
    cookie_name: str | None = None
    theme: str | None = None
    learn_more: str | None = None
    learn_more_link: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class FormEditor(Component):
    """A form designer editing the form definition in ``value``."""

    value: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Workflow(Component):
    """A workflow (BPMN) viewer of the definition in ``value``."""

    value: str | None = None
    style: str | None = None
    css_classes: str | None = None


__all__ = [
    "BoardLayout",
    "BoardLayoutItem",
    "BoardLayoutRow",
    "CarouselLayout",
    "Chat",
    "Container",
    "ContextMenu",
    "CookieConsent",
    "CookieConsentPosition",
    "Directory",
    "FormEditor",
    "FormItem",
    "FormSubSection",
    "FullWidth",
    "Grid",
    "GridColumn",
    "GridGroupColumn",
    "MasterDetailLayout",
    "MenuBar",
    "MenuEntry",
    "MenuSeparator",
    "MessageInput",
    "MessageList",
    "MessageListItem",
    "NotFound",
    "Scroller",
    "VirtualList",
    "Workflow",
]
