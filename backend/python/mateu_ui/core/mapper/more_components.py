"""Mapping of the last components that used to be Java-only (3.0 port) — the same shapes as Java's
BoardLayoutMapper … WorkflowMapper (ids, what travels in the metadata and what as children)."""

from __future__ import annotations

import dataclasses
import re
import uuid
from datetime import date, datetime, time
from enum import Enum
from typing import Any

from mateu_ui.dtos import (
    BoardLayoutItemMetadata,
    BoardLayoutMetadata,
    BoardLayoutRowMetadata,
    CarouselLayoutMetadata,
    ChatMetadata,
    ClientSideComponent,
    ContainerMetadata,
    ContextMenuMetadata,
    CookieConsentMetadata,
    DataPageRecord,
    DirectoryMetadata,
    DivMetadata,
    FormEditorMetadata,
    FormItemMetadata,
    FormSubSectionMetadata,
    FullWidthMetadata,
    GridColumnMetadata,
    GridGroupColumnMetadata,
    GridMetadata,
    MasterDetailLayoutMetadata,
    MenuBarMetadata,
    MenuOptionRecord,
    MessageInputMetadata,
    MessageListItemRecord,
    MessageListMetadata,
    NotFoundMetadata,
    Option,
    ScrollerMetadata,
    VirtualListMetadata,
    WorkflowMetadata,
)
from mateu_ui.uidl import more_components as mc

from ._base import MixinBase


class MoreComponentsMapperMixin(MixinBase):
    def map_more_component(self, c) -> ClientSideComponent | None:
        """The wire component of one of the :mod:`mateu_ui.uidl.more_components` types; None for
        any other component."""
        if isinstance(c, mc.BoardLayout):
            return _client(BoardLayoutMetadata(), c.id, [self.map_component(r) for r in c.rows], c)
        if isinstance(c, mc.BoardLayoutRow):
            return _client(BoardLayoutRowMetadata(), None, [self.map_component(i) for i in c.content], c)
        if isinstance(c, mc.BoardLayoutItem):
            children = [self.map_component(c.content)] if c.content is not None else []
            return _client(BoardLayoutItemMetadata(board_cols=c.board_cols), None, children, c)
        if isinstance(c, mc.CarouselLayout):
            return _client(
                CarouselLayoutMetadata(
                    alt=c.alt, animating=c.animating, auto=c.auto,
                    direction=c.direction.value if c.direction is not None else None,
                    disabled=c.disabled, disable_swipe=c.disable_swipe, disable_keys=c.disable_keys,
                    duration=c.duration, dots=c.dots, end=c.end, loop=c.loop, nav=c.nav,
                    selected=c.selected, total=c.total,
                ),
                c.id, [self.map_component(x) for x in c.content], c,
            )
        if isinstance(c, mc.Container):
            return _client(ContainerMetadata(), None, [self._slot(c.content)], c)
        if isinstance(c, mc.FullWidth):
            return _client(FullWidthMetadata(), None, [self._slot(c.content)], c)
        if isinstance(c, mc.Scroller):
            return _client(ScrollerMetadata(), None, [self._slot(c.content)], c)
        if isinstance(c, mc.FormItem):
            return _client(FormItemMetadata(), c.id, [self.map_component(x) for x in c.content], c)
        if isinstance(c, mc.FormSubSection):
            return _client(
                FormSubSectionMetadata(title=c.title), "fieldId",
                [self.map_component(x) for x in c.content], c,
            )
        if isinstance(c, mc.MasterDetailLayout):
            children = [self.map_component(x) for x in (c.master, c.detail) if x is not None]
            return _client(MasterDetailLayoutMetadata(), c.id, children, c)
        if isinstance(c, mc.ContextMenu):
            return _client(
                ContextMenuMetadata(
                    menu=self._menu(c.menu),
                    wrapped=self.map_component(c.wrapped) if c.wrapped is not None else None,
                    activate_on_left_click=c.activate_on_left_click,
                ),
                "fieldId", [], c,
            )
        if isinstance(c, mc.Directory):
            return _client(DirectoryMetadata(menu=self._menu(c.menu)), "fieldId", [], c)
        if isinstance(c, mc.MenuBar):
            # Java: a fresh random id per render (MenuBarMapper)
            return _client(MenuBarMetadata(options=self._menu(c.options)), str(uuid.uuid4()), [], c)
        if isinstance(c, mc.GridColumn):
            return _client(self._grid_column(c), c.id, [], c)
        if isinstance(c, mc.GridGroupColumn):
            return _client(
                GridGroupColumnMetadata(
                    id=c.id, label=c.label, style=c.style, css_classes=c.css_classes,
                    columns=[self.map_component(x) for x in c.columns],
                ),
                c.id, [], c,
            )
        if isinstance(c, mc.Grid):
            page = None
            if c.page is not None:
                page = DataPageRecord(
                    content=[_jsonable(r) for r in (c.page.content or [])],
                    total_elements=c.page.total_elements,
                )
            return _client(
                GridMetadata(
                    content=[self.map_component(x) for x in c.content], page=page, tree=c.tree,
                    size=c.size, wrap_cell_content=c.wrap_cell_content, compact=c.compact,
                    no_border=c.no_border, no_row_border=c.no_row_border,
                    column_borders=c.column_borders, row_stripes=c.row_stripes,
                    vaadin_grid_cell_background=c.vaadin_grid_cell_background,
                    vaadin_grid_cell_padding=c.vaadin_grid_cell_padding,
                ),
                c.id, [], c,
            )
        if isinstance(c, mc.VirtualList):
            content: list = []
            total = 0
            if c.page is not None:
                # DataPageDto.content is a list of Object in Java, so its components travel WITHOUT
                # their "type" discriminator (Jackson only writes it for a declared ComponentDto).
                for item in c.page.content or []:
                    dumped = self.map_component(item).model_dump(by_alias=True)
                    dumped.pop("type", None)
                    content.append(dumped)
                total = c.page.total_elements
            return _client(
                VirtualListMetadata(page=DataPageRecord(content=content, total_elements=total)),
                "fieldId", [], c,
            )
        if isinstance(c, mc.Chat):
            return _client(ChatMetadata(sse_url=c.sse_url, upload_url=c.upload_url), "fieldId", [], c)
        if isinstance(c, mc.MessageList):
            items = [
                MessageListItemRecord(
                    text=i.text, user_name=i.user_name, time=i.time, user_img=i.user_img,
                    user_abbr=i.user_abbr, user_color_index=i.user_color_index,
                )
                for i in c.items
            ]
            return _client(MessageListMetadata(items=items), c.id or "messageList", [], c)
        if isinstance(c, mc.MessageInput):
            return _client(MessageInputMetadata(action_id=c.action_id), c.id or "messageInput", [], c)
        if isinstance(c, mc.NotFound):
            return _client(
                NotFoundMetadata(
                    title=c.title, message=c.message, back_route=c.back_route, back_label=c.back_label
                ),
                c.id, [], c,
            )
        if isinstance(c, mc.CookieConsent):
            return _client(
                CookieConsentMetadata(
                    position=c.position.value if c.position is not None else None,
                    cookie_name=c.cookie_name, message=c.message, theme=c.theme,
                    learn_more=c.learn_more, learn_more_link=c.learn_more_link, dismiss=c.dismiss,
                ),
                "fieldId", [], c,
            )
        if isinstance(c, mc.FormEditor):
            return _client(FormEditorMetadata(value=c.value), "fieldId", [], c)
        if isinstance(c, mc.Workflow):
            return _client(WorkflowMetadata(value=c.value), "fieldId", [], c)
        return None

    def _slot(self, content) -> ClientSideComponent:
        """A single-child slot: an absent child is an empty Div (Java's Children.orEmptySlot)."""
        if content is None:
            return ClientSideComponent(metadata=DivMetadata(content=""), id="fieldId", style="", css_classes="")
        return self.map_component(content)

    def _menu(self, entries) -> list[MenuOptionRecord]:
        """Java's ContextMenuMapper.buildMenu."""
        return [
            MenuOptionRecord(
                label=e.label,
                component=self.map_component(e.component) if e.component is not None else None,
                path=e.path if e.path is not None else java_camel_case(e.label),
                visible=True,
                selected=e.selected,
                disabled=e.disabled,
                disabled_on_click=e.disabled_on_click,
                class_name=e.class_name,
                item_data=e.item_data,
                submenus=self._menu(e.submenu),
                separator=e.separator,
            )
            for e in entries or ()
        ]

    def _grid_column(self, c) -> GridColumnMetadata:
        """Java's GridColumnMapper: defaults string/regular, numbers end-aligned, booleans centred,
        auto width unless a width is fixed."""
        data_type = c.data_type or "string"
        stereotype = c.stereotype or "regular"
        align = c.align
        if align is None:
            if data_type in ("integer", "number", "money") or stereotype == "money":
                align = "end"
            elif data_type == "bool":
                align = "center"
        options = None
        if c.editor_options is not None:
            options = [Option(value=str(o.value), label=str(o.label)) for o in c.editor_options]
        return GridColumnMetadata(
            id=c.id, label=c.label, data_type=data_type, stereotype=stereotype, style=c.style,
            css_classes=c.css_classes, align=align, sortable=c.sortable,
            sorting_property=c.sorting_property, filterable=c.filterable, frozen=c.frozen,
            frozen_to_end=c.frozen_to_end, auto_width=c.auto_width or c.width is None,
            flex_grow=c.flex_grow, resizable=c.resizable, width=c.width,
            tooltip_path=c.tooltip_path, action_id=c.action_id, text=c.text,
            caption_path=c.caption_path, leading_path=c.leading_path, priority=c.priority,
            identifier=c.identifier, editable=c.editable, editor_type=c.editor_type,
            editor_options=options, weight=c.weight, aggregate=c.aggregate,
            line=c.line if c.line is not None and c.line > 1 else None,
            tones=dict(c.tones) if c.tones else None,
            value_labels=dict(c.value_labels) if c.value_labels else None,
        )


def _client(meta, component_id, children, c) -> ClientSideComponent:
    return ClientSideComponent(
        metadata=meta, id=component_id, children=children, style=c.style, css_classes=c.css_classes
    )


def _camel(name: str) -> str:
    head, *rest = name.split("_")
    return head + "".join(p[:1].upper() + p[1:] for p in rest)


def _jsonable(value: Any) -> Any:
    """A grid row as JSON: dicts as they are, dataclasses / pydantic models by their (camelCase)
    fields, enums by value, dates as ISO strings."""
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(v) for v in value]
    if dataclasses.is_dataclass(value) and not isinstance(value, type):
        return {_camel(f.name): _jsonable(getattr(value, f.name)) for f in dataclasses.fields(value)}
    dump = getattr(value, "model_dump", None)
    if callable(dump):
        return dump(by_alias=True)
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    return value


_BOUNDARIES = re.compile(r"(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])")


def java_camel_case(s: str | None) -> str | None:
    """Java's ``Humanizer.toCamelCase`` ("Sales orders" -> "salesOrders"), the path of a menu entry
    that declares none."""
    if s is None or s == "":
        return s
    c = _BOUNDARIES.sub(" ", s.replace(".", " ")).lower()
    c = re.sub(" +", " ", c)
    if len(c) > 1:
        words = c.split(" ")
        while words and words[-1] == "":  # Java's split drops trailing empty strings
            words.pop()
        out = []
        for pos, z in enumerate(words):
            out.append(z[:1].upper() + z[1:] if pos > 0 and z.strip() else z)
        c = "".join(out)
    return c
