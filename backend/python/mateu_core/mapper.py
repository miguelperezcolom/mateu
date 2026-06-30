"""Turns an annotated Python view instance into the Mateu component tree (App->Page->Card->...->FormField).
The Python port of C#'s ReflectionMapper."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, get_args, get_origin, get_type_hints

from mateu_dtos import (
    Action,
    AppMetadata,
    Badge,
    Banner,
    Button,
    ButtonMetadata,
    CardMetadata,
    ClientSideComponent,
    CrudMetadata,
    CustomTrigger,
    DivMetadata,
    Fab,
    FormFieldMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    GridColumn,
    GridColumnMeta,
    HorizontalLayoutMetadata,
    Kpi,
    MenuItem,
    Option,
    PageMetadata,
    ProgressBarMetadata,
    ServerSideComponent,
    TabLayoutMetadata,
    TabMetadata,
    TextMetadata,
    Trigger,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    Crud,
    HeaderBadge,
    Label,
    Money,
    Multiline,
    Password,
    PlainText,
    Required,
    Section,
    Step,
    Stereotype,
    Tab,
    Translator,
)

from .naming import camel_case, humanize
from .reflection import class_flag, methods_with, view_fields
from .registry import normalize, type_name


def _id() -> str:
    return str(uuid.uuid4())


def is_enum(t) -> bool:
    return isinstance(t, type) and issubclass(t, Enum)


def crud_element_type(cls) -> type | None:
    """If ``cls`` derives from ``Crud[T]``, return ``T``; else ``None``."""
    if not (isinstance(cls, type) and issubclass(cls, Crud)):
        return None
    if getattr(cls, "element_type", None):
        return cls.element_type
    for c in cls.__mro__:
        for base in getattr(c, "__orig_bases__", ()):
            if get_origin(base) is Crud:
                args = get_args(base)
                if args and isinstance(args[0], type):
                    return args[0]
    return None


def format_value(value) -> Any:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.name
    return str(value)


class ReflectionMapper:
    def __init__(self, translator: Translator | None = None):
        self.translator = translator

    def T(self, s: str) -> str:
        return self.translator.translate(s) if self.translator else s

    def _opt_t(self, s: str | None) -> str | None:
        return None if s is None else self.T(s)

    # ── App shell ──────────────────────────────────────────────────────────────
    def map_app(self, cls) -> ClientSideComponent:
        app_title = getattr(cls, "__mateu_app__")
        items = [self.map_menu_item(n, f) for n, f in methods_with(cls, "__mateu_menu_item__")]
        variant = "HAMBURGUER_MENU" if len(items) > 7 else "MENU_ON_LEFT"
        home = items[0] if items else None
        meta = AppMetadata(
            title=self.T(app_title),
            variant=variant,
            menu=items,
            home_route=home.route if home else "",
            home_consumed_route=home.consumed_route if home else "",
            home_server_side_type=home.server_side_type if home else "",
            server_side_type=type_name(cls),
        )
        return ClientSideComponent(metadata=meta, id="ux_main_app", children=[])

    def map_menu_item(self, name: str, fn) -> MenuItem:
        try:
            view_type = get_type_hints(fn).get("return")
        except Exception:
            view_type = fn.__annotations__.get("return")
        route = "/" + normalize(getattr(view_type, "__mateu_ui__", "")) if view_type else "/"
        marker = getattr(fn, "__mateu_menu_item__")
        label = (
            marker
            if isinstance(marker, str)
            else (getattr(view_type, "__mateu_title__", None) or humanize(name))
        )
        ssn = type_name(view_type) if view_type else ""
        return MenuItem(label=self.T(label), route=route, server_side_type=ssn, consumed_route=route)

    # ── Plain view ─────────────────────────────────────────────────────────────
    def map_view(self, cls, instance, route: str) -> ServerSideComponent:
        element = crud_element_type(cls)
        if element is not None:
            return self.map_crud(cls, element, route)

        title = self.T(getattr(cls, "__mateu_title__", humanize(cls.__name__)))
        buttons = [self.map_button(n, f) for n, f in methods_with(cls, "__mateu_button__")]
        fabs = self.fabs(cls)
        actions = [Action(id=b.action_id) for b in buttons] + [Action(id=f.action_id) for f in fabs]

        compact = bool(class_flag(cls, "__mateu_compact__", False))
        page_meta = PageMetadata(
            title=title,
            page_title=title,
            subtitle=self._opt_t(class_flag(cls, "__mateu_subtitle__", None)),
            toolbar=[],
            buttons=buttons,
            banners=self.banners(cls, instance),
            badges=self.badges(cls, instance),
            kpis=self.kpis(cls, instance),
            fabs=fabs,
        )
        page = ClientSideComponent(
            metadata=page_meta,
            children=self.form_cards(cls, instance),
            style="--mateu-compact:1" if compact else None,
        )
        triggers, emits = self.events_of(cls)
        return ServerSideComponent(
            id=_id(),
            server_side_type=type_name(cls),
            route=route,
            children=[page],
            initial_data={},
            actions=actions,
            triggers=triggers,
            emits_name=emits,
            confirm_on_navigation_if_dirty=bool(class_flag(cls, "__mateu_confirm_dirty__", False)),
        )

    # ── Decorations ────────────────────────────────────────────────────────────
    def banners(self, cls, instance) -> list[Banner]:
        out = []
        for name, fn in methods_with(cls, "__mateu_banner__"):
            a = getattr(fn, "__mateu_banner__")
            ret = getattr(instance, name)()
            desc = ret if isinstance(ret, str) else None
            out.append(Banner(theme=a.theme.value, title=a.title, description=desc))
        return out

    def badges(self, cls, instance) -> list[Badge]:
        out = []
        for f in view_fields(cls):
            hb = f.marker(HeaderBadge)
            if hb is None:
                continue
            value = getattr(instance, f.name, None)
            text = None if value is None else str(value)
            if not text or not text.strip():
                continue
            out.append(Badge(text=text, color=hb.color))
        return out

    def kpis(self, cls, instance) -> list[Kpi]:
        out = []
        for name, fn in methods_with(cls, "__mateu_kpi__"):
            title = getattr(fn, "__mateu_kpi__")
            value = getattr(instance, name)()
            out.append(Kpi(title=title, value="" if value is None else str(value)))
        return out

    def fabs(self, cls) -> list[Fab]:
        out = []
        for name, fn in methods_with(cls, "__mateu_fab__"):
            a = getattr(fn, "__mateu_fab__")
            out.append(Fab(icon=a.icon, action_id=camel_case(name), label=a.label, order=a.order))
        out.sort(key=lambda f: f.order)
        return out

    def events_of(self, cls) -> tuple[list[Any], str | None]:
        triggers = [
            CustomTrigger(event=e, action_id=a)
            for (e, a) in getattr(cls, "__mateu_subscriptions__", ())
        ]
        return triggers, getattr(cls, "__mateu_emits__", None)

    # ── Wizard ─────────────────────────────────────────────────────────────────
    def map_wizard(self, cls, instance, route: str, step: int) -> ServerSideComponent:
        step_fields = [(f, (f.marker(Step).step if f.has(Step) else 1)) for f in view_fields(cls)]
        total = max((s for _, s in step_fields), default=1)
        total = max(total, 1)
        current = min(max(step, 1), total)
        fields = [self.map_field(f, instance) for f, s in step_fields if s == current]

        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        title_text = self.client(TextMetadata(text=title), None, [])
        progress = self.client(ProgressBarMetadata(value=current / total), "fieldId", [])
        card = self.client(
            CardMetadata(content=self.client(FormLayoutMetadata(), None, self.form_rows(fields))),
            "fieldId",
            [],
        )
        back = self.client(ButtonMetadata(label="Back", action_id="back", disabled=current == 1), None, [])
        nxt = self.client(
            ButtonMetadata(
                label="Finish" if current == total else "Next", action_id="next", button_style="Primary"
            ),
            None,
            [],
        )
        bar = self.client(HorizontalLayoutMetadata(), None, [back, nxt])
        layout = self.client(VerticalLayoutMetadata(spacing=True), None, [title_text, progress, card, bar])

        initial: dict[str, Any] = {"__step": current}
        for f, _ in step_fields:
            initial[camel_case(f.name)] = format_value(getattr(instance, f.name, None))
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[layout],
            initial_data=initial, actions=[], triggers=[],
        )

    # ── CRUD ───────────────────────────────────────────────────────────────────
    def map_crud(self, cls, element, route: str) -> ServerSideComponent:
        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        columns = [
            GridColumn(metadata=GridColumnMeta(
                id=camel_case(f.name),
                label=(f.marker(Label).value if f.has(Label) else humanize(f.name)),
            ))
            for f in view_fields(element)
        ]
        toolbar = [Button(label="New", action_id="new"), Button(label="Delete", action_id="delete")]
        crud = self.client(CrudMetadata(title=title, columns=columns, toolbar=toolbar), "crud", [])
        page = self.client(PageMetadata(), None, [crud])
        actions = [Action(id="search"), Action(id="new"), Action(id="delete")]
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions, triggers=[Trigger(type="OnLoad", action_id="search")],
        )

    def map_entity_form(self, crud_type, element, entity, mode: str, route: str) -> ServerSideComponent:
        title = getattr(crud_type, "__mateu_title__", humanize(element.__name__))
        if mode == "view":
            toolbar = [
                Button(label="Back to list", action_id="cancel-view"),
                Button(label="Edit", action_id="edit"),
                Button(label="Add another", action_id="new"),
            ]
        elif mode == "edit":
            toolbar = [
                Button(label="Cancel", action_id="cancel-edit"),
                Button(label="Save", action_id="create", button_style="Primary"),
            ]
        else:  # new
            toolbar = [
                Button(label="Cancel", action_id="cancel-new"),
                Button(label="Save", action_id="create", button_style="Primary"),
            ]
        page = self.client(
            PageMetadata(title=title, page_title=title, toolbar=toolbar),
            None,
            self.form_cards(element, entity, read_only=mode == "view"),
        )
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(crud_type), route=route, children=[page],
            initial_data={}, actions=[], triggers=[],
        )

    # ── Fields & layout ────────────────────────────────────────────────────────
    def form_cards(self, cls, instance, read_only: bool = False) -> list:
        fields = view_fields(cls)
        if any(f.has(Tab) for f in fields):
            return [self.tab_layout(fields, instance, read_only)]

        sections: list[tuple[str | None, list]] = []
        current: str | None = None
        for f in fields:
            sec = f.marker(Section)
            if sec is not None:
                current = sec.caption
            if not sections or sections[-1][0] != current:
                sections.append((current, []))
            sections[-1][1].append(self.map_field(f, instance, read_only))
        return [self.section_card(t, fs) for t, fs in sections]

    def tab_layout(self, fields, instance, read_only: bool) -> ClientSideComponent:
        tabs: list[tuple[str, list]] = []
        current = "Tab"
        for f in fields:
            tb = f.marker(Tab)
            if tb is not None:
                current = tb.name
            if not tabs or tabs[-1][0] != current:
                tabs.append((current, []))
            tabs[-1][1].append(self.map_field(f, instance, read_only))
        comps = []
        for i, (nm, fs) in enumerate(tabs):
            form_layout = self.client(FormLayoutMetadata(), None, self.form_rows(fs))
            comps.append(self.client(TabMetadata(label=self.T(nm), active=i == 0), None, [form_layout]))
        return self.client(TabLayoutMetadata(), None, comps)

    def section_card(self, title: str | None, fields) -> ClientSideComponent:
        form_layout = self.client(FormLayoutMetadata(), None, self.form_rows(fields))
        if title is not None:
            return self.client(FormSectionMetadata(title=title), None, [form_layout])
        vlayout = self.client(VerticalLayoutMetadata(), None, [form_layout])
        div = self.client(DivMetadata(), "fieldId", [vlayout])
        return self.client(CardMetadata(content=div), "fieldId", [])

    def form_rows(self, fields, max_columns: int = 2) -> list:
        rows = []
        for i in range(0, len(fields), max_columns):
            rows.append(self.client(FormRowMetadata(), None, fields[i : i + max_columns]))
        return rows

    def map_field(self, f, instance, read_only: bool = False) -> ClientSideComponent:
        field_id = camel_case(f.name)
        label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
        required = f.has(Required)
        t = f.type
        options = (
            [Option(value=m.name, label=humanize(m.name)) for m in t] if is_enum(t) else []
        )
        value = getattr(instance, f.name, None)

        plain = f.has(PlainText) or bool(class_flag(instance.__class__, "__mateu_plain_text__", False))
        multiline = f.has(Multiline)
        stereotype = self.stereotype_of(f, plain, multiline)

        meta = FormFieldMetadata(
            field_id=field_id,
            data_type=self.infer_data_type(t, f),
            label=label,
            stereotype=stereotype,
            required=required,
            read_only=read_only or plain,
            multiline=multiline,
            options=options,
            initial_value=format_value(value),
        )
        return self.client(meta, field_id, [])

    def stereotype_of(self, f, plain: bool, multiline: bool) -> str:
        s = f.marker(Stereotype)
        if s is not None:
            return s.value
        if f.has(Password):
            return "password"
        if f.has(Money):
            return "plainText" if plain else "money"
        if plain:
            return "plainText"
        if multiline:
            return "textarea"
        return "regular"

    def infer_data_type(self, t, f=None) -> str:
        if f is not None and f.has(Money):
            return "money"
        if is_enum(t):
            return "string"
        if t is bool:
            return "boolean"
        if t is int:
            return "integer"
        if t in (float, Decimal):
            return "number"
        if t in (date, datetime):
            return "date"
        return "string"

    def map_button(self, name: str, fn) -> Button:
        marker = getattr(fn, "__mateu_button__")
        label = marker if isinstance(marker, str) else humanize(name)
        return Button(
            label=self.T(label),
            action_id=camel_case(name),
            shortcut=getattr(fn, "__mateu_shortcut__", None),
        )

    @staticmethod
    def client(meta, id, children) -> ClientSideComponent:
        return ClientSideComponent(metadata=meta, id=id, children=children)
