"""Turns an annotated Python view instance into the Mateu component tree (App->Page->Card->...->FormField).
The Python port of C#'s ReflectionMapper."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, get_args, get_origin, get_type_hints

from mateu_dtos import (
    AccordionLayoutMetadata,
    AppContextSelector,
    AccordionPanelMetadata,
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
    DashboardLayoutMetadata,
    DashboardPanelMetadata,
    DialogMetadata,
    DivMetadata,
    DrawerMetadata,
    EmptyStateMetadata,
    Fab,
    FoldoutLayoutMetadata,
    FoldoutPanelInfo,
    FormFieldMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    GanttMetadata,
    GanttTaskRecord,
    GridColumn,
    GridColumnMeta,
    HeroSectionMetadata,
    HorizontalLayoutMetadata,
    Kpi,
    MenuItem,
    MetricCardMetadata,
    NavLinkRecord,
    Option,
    PageMetadata,
    ProgressBarMetadata,
    RemoteCoordinates,
    ScoreboardMetadata,
    ServerSideComponent,
    SkeletonMetadata,
    TabLayoutMetadata,
    TabMetadata,
    TextMetadata,
    Trigger,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    ComponentTreeSupplier,
    Crud,
    Dashboard,
    Foldout,
    HeaderBadge,
    ItemOverview,
    Label,
    LinkSupplier,
    LinkTo,
    Lookup,
    Money,
    Multiline,
    Panel,
    Password,
    PhotoCapture,
    PlainText,
    RangeFilter,
    ReadOnly,
    Signature,
    TreeSelect,
    Required,
    Section,
    Step,
    Stereotype,
    Tab,
    Translator,
    UseRadioButtons,
    Welcome,
)
from mateu_uidl import components as fluent

from . import layout_inference
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
            context_selectors=self.map_context_selectors(cls),
        )
        return ClientSideComponent(metadata=meta, id="ux_main_app", children=[])

    def map_context_selectors(self, cls) -> list[AppContextSelector]:
        """@app_context methods of the app class become header context selectors: the method's
        return annotation may be an Enum (its members are the options), or the method is called
        (zero args, on a fresh instance) and must return Option-likes or (value, label) pairs."""
        selectors: list[AppContextSelector] = []
        for name, fn in methods_with(cls, "__mateu_app_context__"):
            marker = getattr(fn, "__mateu_app_context__")
            label = self.T(marker) if marker else humanize(name)
            options: list[Option] = []
            try:
                return_type = get_type_hints(fn).get("return")
            except Exception:
                return_type = None
            if isinstance(return_type, type) and issubclass(return_type, Enum):
                options = [
                    Option(value=member.name, label=humanize(member.name))
                    for member in return_type
                ]
            else:
                try:
                    for item in fn(cls()) or []:
                        if isinstance(item, Option):
                            options.append(item)
                        elif isinstance(item, (tuple, list)) and len(item) == 2:
                            options.append(Option(value=str(item[0]), label=str(item[1])))
                        elif hasattr(item, "value") and hasattr(item, "label"):
                            options.append(Option(value=str(item.value), label=str(item.label)))
                except Exception:
                    options = []
            selectors.append(
                AppContextSelector(field_name=name, label=label, options=options)
            )
        return selectors

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

        tree = self.component_tree(instance)
        if tree is not None:
            children = [self.map_component(tree)]
            known = {a.id for a in actions}
            actions += [
                Action(id=a) for a in self.collect_action_ids(tree) if a not in known
            ]
        else:
            children = self.form_cards(cls, instance)

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
            children=children,
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

    # ── Fluent component trees & declarative archetypes ───────────────────────
    def component_tree(self, instance):
        """The component tree of an archetype / ``ComponentTreeSupplier`` view (a fluent
        component or an already-mapped ``ClientSideComponent``), or ``None`` for form views."""
        if isinstance(instance, Dashboard):
            return self.compose_dashboard(instance)
        if isinstance(instance, Foldout):
            return self.compose_foldout(instance)
        if isinstance(instance, ItemOverview):
            return self.compose_item_overview(instance)
        if isinstance(instance, Welcome):
            return self.compose_welcome(instance)
        if isinstance(instance, ComponentTreeSupplier):
            return instance.component()
        return None

    def _component_fields(self, instance):
        """``(field, value)`` for every declared field holding a fluent component value."""
        out = []
        for f in view_fields(type(instance)):
            value = getattr(instance, f.name, None)
            if isinstance(value, fluent.Component):
                out.append((f, value))
        return out

    def _panel_title(self, f, panel: Panel) -> str:
        if panel.title:
            return panel.title
        return self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))

    def compose_dashboard(self, instance: Dashboard) -> fluent.DashboardLayout:
        items: list[fluent.Component] = []
        pending: list[fluent.MetricCard] = []

        def flush():
            if pending:
                items.append(fluent.Scoreboard(metrics=tuple(pending)))
                pending.clear()

        for f, value in self._component_fields(instance):
            if isinstance(value, fluent.MetricCard):
                pending.append(value)
                continue
            flush()
            panel = f.marker(Panel)
            if panel is not None:
                items.append(
                    fluent.DashboardPanel(
                        id=camel_case(f.name),
                        title=self._panel_title(f, panel),
                        subtitle=panel.subtitle or None,
                        col_span=panel.col_span,
                        row_span=panel.row_span,
                        content=value,
                    )
                )
            else:
                items.append(value)
        flush()
        return fluent.DashboardLayout(columns=instance.columns(), items=tuple(items))

    def compose_foldout(self, instance: Foldout) -> fluent.FoldoutLayout:
        overview: fluent.Component | None = None
        panels: list[fluent.FoldoutPanel] = []
        for f, value in self._component_fields(instance):
            panel = f.marker(Panel)
            if panel is None:
                if overview is None:
                    overview = value
                continue
            panels.append(
                fluent.FoldoutPanel(
                    id=camel_case(f.name),
                    title=self._panel_title(f, panel),
                    subtitle=panel.subtitle or None,
                    icon=panel.icon or None,
                    open=panel.open,
                    content=value,
                )
            )
        return fluent.FoldoutLayout(overview=overview, panels=tuple(panels))

    def compose_item_overview(self, instance: ItemOverview) -> ClientSideComponent:
        key_info: fluent.Component | None = None
        tabs: list[tuple[str, fluent.Component]] = []
        for f, value in self._component_fields(instance):
            panel = f.marker(Panel)
            if panel is None:
                if key_info is None:
                    key_info = value
                continue
            tabs.append((self._panel_title(f, panel), value))
        content = []
        if key_info is not None:
            card = self.client(CardMetadata(content=self.map_component(key_info)), "key-info", [])
            card.style = (
                f"flex: 0 0 {instance.panel_width()}; align-self: flex-start; "
                "position: sticky; top: 1rem;"
            )
            content.append(card)
        tab_comps = [
            self.client(TabMetadata(label=label, active=i == 0), None, [self.map_component(c)])
            for i, (label, c) in enumerate(tabs)
        ]
        tab_layout = self.client(TabLayoutMetadata(), "item-tabs", tab_comps)
        tab_layout.style = "flex: 1; min-width: 0;"
        content.append(tab_layout)
        return self.client(HorizontalLayoutMetadata(spacing=True), None, content)

    def compose_welcome(self, instance: Welcome) -> ClientSideComponent:
        ctas: list[fluent.Component] = []
        tiles: list[fluent.Component] = []
        for f, value in self._component_fields(instance):
            if isinstance(value, fluent.Button):
                ctas.append(value)
                continue
            panel = f.marker(Panel)
            if panel is not None:
                tiles.append(
                    fluent.DashboardPanel(
                        id=camel_case(f.name),
                        title=self._panel_title(f, panel),
                        subtitle=panel.subtitle or None,
                        col_span=panel.col_span,
                        row_span=panel.row_span,
                        content=value,
                    )
                )
            else:
                tiles.append(value)
        content = [
            self.map_component(
                fluent.HeroSection(
                    id="hero",
                    title=instance.hero_title(),
                    subtitle=instance.hero_subtitle(),
                    image=instance.hero_image(),
                    centered=True,
                    content=tuple(ctas),
                )
            )
        ]
        if tiles:
            content.append(
                self.map_component(fluent.DashboardLayout(id="highlights", items=tuple(tiles)))
            )
        return self.client(VerticalLayoutMetadata(spacing=True), None, content)

    def map_component(self, c) -> ClientSideComponent:
        """A fluent component (``mateu_uidl.components``) -> its wire ClientSide component.
        The Python port of the Java Metric/Scoreboard/Dashboard/Foldout/Hero/… mappers."""
        if isinstance(c, ClientSideComponent):  # pre-composed (archetype wrappers)
            return c
        if isinstance(c, fluent.MetricCard):
            meta = MetricCardMetadata(
                title=c.title,
                value=c.value,
                unit=c.unit,
                trend=c.trend.value if c.trend is not None else None,
                trend_label=c.trend_label,
                icon=c.icon,
                description=c.description,
                action_id=c.action_id,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Scoreboard):
            return self._fluent_client(
                ScoreboardMetadata(), c, [self.map_component(m) for m in c.metrics]
            )
        if isinstance(c, fluent.DashboardPanel):
            meta = DashboardPanelMetadata(
                title=c.title, subtitle=c.subtitle, col_span=c.col_span, row_span=c.row_span
            )
            children = [self.map_component(c.content)] if c.content is not None else []
            return self._fluent_client(meta, c, children)
        if isinstance(c, fluent.DashboardLayout):
            return self._fluent_client(
                DashboardLayoutMetadata(columns=c.columns),
                c,
                [self.map_component(i) for i in c.items],
            )
        if isinstance(c, fluent.FoldoutLayout):
            children = []
            if c.overview is not None:
                overview = self.map_component(c.overview)
                overview.slot = "overview"
                children.append(overview)
            infos = []
            for i, panel in enumerate(c.panels):
                infos.append(
                    FoldoutPanelInfo(
                        title=panel.title, subtitle=panel.subtitle, icon=panel.icon, open=panel.open
                    )
                )
                if panel.content is not None:
                    child = self.map_component(panel.content)
                    child.slot = f"panel-{i}"
                    children.append(child)
            return self._fluent_client(FoldoutLayoutMetadata(panels=infos), c, children)
        if isinstance(c, fluent.HeroSection):
            meta = HeroSectionMetadata(
                title=c.title, subtitle=c.subtitle, image=c.image, height=c.height, centered=c.centered
            )
            return self._fluent_client(meta, c, [self.map_component(i) for i in c.content])
        if isinstance(c, fluent.EmptyState):
            meta = EmptyStateMetadata(
                icon=c.icon,
                title=c.title,
                description=c.description,
                action_id=c.action_id,
                action_label=c.action_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Skeleton):
            variant = c.variant.value if c.variant is not None else "text"
            return self._fluent_client(SkeletonMetadata(variant=variant, count=c.count), c)
        if isinstance(c, fluent.Gantt):
            tasks = [
                GanttTaskRecord(
                    id=t.id,
                    title=t.title,
                    start=t.start.isoformat() if t.start is not None else None,
                    end=t.end.isoformat() if t.end is not None else None,
                    progress=t.progress,
                    color=t.color,
                )
                for t in c.tasks
            ]
            return self._fluent_client(GanttMetadata(tasks=tasks), c)
        if isinstance(c, fluent.Button):
            meta = ButtonMetadata(
                label=self.T(c.label), action_id=c.action_id, disabled=c.disabled,
                button_style=c.button_style,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Text):
            return self._fluent_client(TextMetadata(text=self.T(c.text)), c)
        # Overlays — returned from actions; the sync handler emits them as Add fragments.
        if isinstance(c, fluent.Drawer):
            meta = DrawerMetadata(
                id=c.id,
                header_title=c.header_title,
                header=self.map_component(c.header) if c.header is not None else None,
                content=self.map_component(c.content) if c.content is not None else None,
                footer=self.map_component(c.footer) if c.footer is not None else None,
                position=c.position.value,
                width=c.width,
                no_padding=c.no_padding,
                modeless=c.modeless,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Dialog):
            meta = DialogMetadata(
                id=c.id,
                header_title=c.header_title,
                header=self.map_component(c.header) if c.header is not None else None,
                content=self.map_component(c.content) if c.content is not None else None,
                footer=self.map_component(c.footer) if c.footer is not None else None,
                width=c.width,
                height=c.height,
                no_padding=c.no_padding,
                modeless=c.modeless,
                close_button_on_header=c.close_button_on_header,
            )
            return self._fluent_client(meta, c)
        raise TypeError(f"Unsupported fluent component: {type(c).__name__}")

    def _fluent_client(self, meta, c, children=None) -> ClientSideComponent:
        return ClientSideComponent(
            metadata=meta,
            id=c.id,
            children=children or [],
            style=c.style,
            css_classes=c.css_classes,
        )

    def collect_action_ids(self, c) -> list[str]:
        """Action ids referenced anywhere in a fluent tree (for the component's actions list)."""
        out: list[str] = []

        def walk(node):
            if node is None:
                return
            if isinstance(node, ClientSideComponent):
                aid = getattr(node.metadata, "action_id", None)
                if aid:
                    out.append(aid)
                walk(getattr(node.metadata, "content", None))
                for child in node.children:
                    walk(child)
                return
            if not isinstance(node, fluent.Component):
                return
            aid = getattr(node, "action_id", None)
            if aid:
                out.append(aid)
            for attr in ("content", "overview", "items", "metrics", "panels"):
                v = getattr(node, attr, None)
                if isinstance(v, (fluent.Component, ClientSideComponent)):
                    walk(v)
                elif isinstance(v, (list, tuple)):
                    for i in v:
                        walk(i)

        walk(c)
        return list(dict.fromkeys(out))

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
        # Class-level @inline_editing: every data column (except ReadOnly() ones) is edited in
        # place; each committed cell dispatches the crud's update-row action (Java parity).
        inline = getattr(cls, "__mateu_inline_editing__", False)
        columns = []
        for f in view_fields(element):
            editable = inline and not f.has(ReadOnly)
            columns.append(GridColumn(metadata=GridColumnMeta(
                id=camel_case(f.name),
                label=(f.marker(Label).value if f.has(Label) else humanize(f.name)),
                editable=editable,
                editor_type=self.editor_type_of(f) if editable else None,
                editor_options=(
                    [Option(value=m.name, label=str(m.name)) for m in f.type]
                    if editable and is_enum(f.type) else None
                ),
            )))
        toolbar = [Button(label="New", action_id="new"), Button(label="Delete", action_id="delete")]
        crud = self.client(
            CrudMetadata(title=title, columns=columns, toolbar=toolbar, filters=self.crud_filters(element)),
            "crud",
            [],
        )
        page = self.client(PageMetadata(), None, [crud])
        actions = [Action(id="search"), Action(id="new"), Action(id="delete")]
        if inline:
            actions.append(Action(id="update-row"))
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions, triggers=[Trigger(type="OnLoad", action_id="search")],
        )

    @staticmethod
    def editor_type_of(f) -> str:
        """The in-place editor widget for an @inline_editing column (mirrors Java's
        GridColumnBuilder.getEditorType): enums edit as a select, Money() as a number, the rest
        by data type."""
        t = f.type
        if f.has(Lookup):
            return "lookup"
        if is_enum(t):
            return "select"
        if f.has(Money):
            return "number"
        if t is bool:
            return "boolean"
        if t is int:
            return "integer"
        if t in (float, Decimal):
            return "number"
        if t is date:
            return "date"
        if t is datetime:
            return "datetime"
        return "text"

    def crud_filters(self, element) -> list[FormFieldMetadata]:
        """The smart search bar's filters for a Crud entity (mirrors the Java AutoCrud
        semantics): every basic field and every enum becomes a filter — enums upgrade to
        multi-selects (IN) with their members as options, temporals to from-to date ranges,
        RangeFilter numerics to min-max ranges."""
        out: list[FormFieldMetadata] = []
        for f in view_fields(element):
            t = f.type
            if not (is_enum(t) or t in (str, bool, int, float, Decimal, date, datetime)):
                continue
            label = f.marker(Label).value if f.has(Label) else humanize(f.name)
            options: list[Option] = []
            if is_enum(t):
                stereotype = "multiSelect"
                options = [Option(value=m.name, label=humanize(m.name)) for m in t]
            elif t in (date, datetime):
                stereotype = "dateRange"
            elif t in (int, float, Decimal) and f.has(RangeFilter):
                stereotype = "numberRange"
            else:
                stereotype = "regular"
            out.append(
                FormFieldMetadata(
                    field_id=camel_case(f.name),
                    data_type=self.infer_data_type(t, f),
                    label=label,
                    stereotype=stereotype,
                    options=options,
                )
            )
        return out

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
        read_only = read_only or bool(class_flag(cls, "__mateu_read_only__", False))
        fields = view_fields(cls)
        if any(f.has(Tab) for f in fields):
            return [self.tab_layout(cls, fields, instance, read_only)]

        # Group the declared fields into sections (title None = synthetic/unnamed section).
        sections: list[tuple[str | None, list]] = []
        current: str | None = None
        for f in fields:
            sec = f.marker(Section)
            if sec is not None:
                current = sec.caption
            if not sections or sections[-1][0] != current:
                sections.append((current, []))
            sections[-1][1].append(f)

        if self.prefer_tabs(cls, sections, read_only):
            return [self.tabs_from_sections(sections, instance, read_only)]

        plan = self.fold_plan(cls, sections, read_only)
        if plan is not None:
            return [self.folded_card(plan[0], plan[1], instance, read_only)]

        return [
            self.section_card(t, [self.map_field(f, instance, read_only) for f in fs])
            for t, fs in sections
        ]

    def tab_layout(self, cls, fields, instance, read_only: bool) -> ClientSideComponent:
        tabs: list[tuple[str, bool, list]] = []
        current = "Tab"
        for f in fields:
            tb = f.marker(Tab)
            if tb is not None:
                current = tb.name
            if not tabs or tabs[-1][0] != current:
                # The field that opens a group carries its Tab.open flag (mirrors the Java
                # pair.first().open() rule); fields before any Tab fall into the default group.
                tabs.append((current, tb.open if tb is not None else False, []))
            tabs[-1][2].append(self.map_field(f, instance, read_only))
        # The tab selected on first render is the first one flagged open, else the first tab.
        active_index = next((i for i, t in enumerate(tabs) if t[1]), 0)
        comps = []
        for i, (nm, _open, fs) in enumerate(tabs):
            form_layout = self.client(FormLayoutMetadata(), None, self.form_rows(fs))
            comps.append(
                self.client(
                    TabMetadata(label=self.T(nm), active=i == active_index), None, [form_layout]
                )
            )
        # Developer-declared tabs always carry the group semantics; they are adaptable (renderers
        # may degrade them, e.g. to an accordion) only when the class opted into auto-layout.
        return self.client(
            TabLayoutMetadata(
                group_relationship="alternative",
                adaptable=layout_inference.enabled(cls),
            ),
            None,
            comps,
        )

    # ── Layout inference (the @auto_layout decision table, see layout_inference) ─
    def field_weight(self, cls, f) -> int:
        """Estimated visual weight of a declared field, from its effective stereotype."""
        plain = f.has(PlainText) or bool(class_flag(cls, "__mateu_plain_text__", False))
        return layout_inference.estimated_weight(
            self.stereotype_of(f, plain, f.has(Multiline), cls)
        )

    def fold_plan(self, cls, sections, read_only: bool):
        """Fold-optionals rule (Java ``LayoutInference.foldPlan``): on an editable form where the
        developer declared no grouping at all (one unnamed section, no tabs) and the estimated
        weight exceeds one screen, keep the required fields visible and fold the optional ones
        into a collapsed "More options" panel. ``None`` when the rule does not apply."""
        if not layout_inference.enabled(cls) or read_only:
            return None
        # Only when the developer declared no grouping: a single synthetic (unnamed) section.
        # (Java also skips forms with @Tab/@Inline/@Composition/component fields — tabs are
        # handled before this path and the Python backend has no other embedded form fields.)
        if len(sections) != 1 or sections[0][0]:
            return None
        fields = sections[0][1]
        total = sum(self.field_weight(cls, f) for f in fields)
        if total <= layout_inference.FOLD_WEIGHT_THRESHOLD:
            return None
        main = [f for f in fields if f.has(Required)]
        folded = [f for f in fields if not f.has(Required)]
        if not main or len(folded) < layout_inference.FOLD_MIN_OPTIONAL:
            return None
        return main, folded

    def prefer_tabs(self, cls, sections, read_only: bool) -> bool:
        """Sections-to-tabs rule (Java ``LayoutInference.preferTabs``): a read-only view with many
        substantial sections reads better with random access (tabs) than as a long vertical stack
        — and unlike an editable form, hiding groups cannot hide invalid required fields. (Java
        also bails on sticky sections and explicit @Toc/@Zones/@FoldedLayout — the Python backend
        has none of those layout features yet.)"""
        if not layout_inference.enabled(cls) or not read_only:
            return False
        if len(sections) < layout_inference.TABS_MIN_SECTIONS:
            return False
        total = sum(self.field_weight(cls, f) for _, fs in sections for f in fs)
        return total >= layout_inference.TABS_WEIGHT_THRESHOLD

    def folded_card(self, main, folded, instance, read_only: bool) -> ClientSideComponent:
        """The fold-optionals presentation (Java ``SectionFormRenderer.buildSectionBody``): the
        required fields' form layout, then a collapsed "More options" accordion panel hosting the
        optional fields — all inside the usual unnamed-section card."""
        main_layout = self.client(
            FormLayoutMetadata(),
            None,
            self.form_rows([self.map_field(f, instance, read_only) for f in main]),
        )
        folded_layout = self.client(
            FormLayoutMetadata(),
            None,
            self.form_rows([self.map_field(f, instance, read_only) for f in folded]),
        )
        panel = self.client(
            AccordionPanelMetadata(label=layout_inference.MORE_OPTIONS_LABEL),
            None,
            [folded_layout],
        )
        accordion = self.client(AccordionLayoutMetadata(), None, [panel])
        vlayout = self.client(VerticalLayoutMetadata(), None, [main_layout, accordion])
        div = self.client(DivMetadata(), "fieldId", [vlayout])
        return self.client(CardMetadata(content=div), "fieldId", [])

    def tabs_from_sections(self, sections, instance, read_only: bool) -> ClientSideComponent:
        """Sections-as-tabs presentation (Java ``SectionFormRenderer.tabsFromSections``): one tab
        per section (label = section title). The tab layout carries the group semantics and is
        marked adaptable so renderers may degrade it to an accordion on narrow viewports."""
        comps = []
        for i, (title_, fs) in enumerate(sections):
            form_layout = self.client(
                FormLayoutMetadata(),
                None,
                self.form_rows([self.map_field(f, instance, read_only) for f in fs]),
            )
            comps.append(
                self.client(
                    TabMetadata(label=self.T(title_) if title_ else "", active=i == 0),
                    None,
                    [form_layout],
                )
            )
        return self.client(
            TabLayoutMetadata(group_relationship="alternative", adaptable=True), "_tabs", comps
        )

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
        # the view's options(field_name) method wins (its options may carry children → tree
        # selects); enums keep contributing their constants
        options = self._supplied_options(instance, field_id)
        if not options:
            options = (
                [Option(value=m.name, label=humanize(m.name)) for m in t] if is_enum(t) else []
            )
        value = getattr(instance, f.name, None)

        plain = f.has(PlainText) or bool(class_flag(instance.__class__, "__mateu_plain_text__", False))
        multiline = f.has(Multiline)
        stereotype = self.stereotype_of(f, plain, multiline, instance.__class__)

        meta = FormFieldMetadata(
            field_id=field_id,
            data_type=self.infer_data_type(t, f),
            label=label,
            stereotype=stereotype,
            required=required,
            read_only=read_only or plain,
            multiline=multiline,
            options=options,
            tree_leaves_only=bool(getattr(f.marker(TreeSelect), "leaves_only", False)) if f.has(TreeSelect) else False,
            initial_value=format_value(value),
            link=self.link_of(f, instance),
            # Lookup(): the combo box loads its options remotely through the field's
            # search-<fieldId> action (answered from the view's options(field_name) method).
            remote_coordinates=(
                RemoteCoordinates(action=f"search-{field_id}") if f.has(Lookup) else None
            ),
        )
        return self.client(meta, field_id, [])

    def link_of(self, f, instance) -> NavLinkRecord | None:
        """The field's nav link: a :class:`LinkSupplier` on the view wins; when it returns ``None``
        the ``LinkTo`` marker applies; no link -> ``None``. href/title travel verbatim — ``${...}``
        templates are interpolated client-side, never on the server."""
        if isinstance(instance, LinkSupplier):
            supplied = instance.link(f.name)
            if supplied is not None:
                return NavLinkRecord(
                    href=supplied.href, icon=supplied.icon, title=supplied.title, target=supplied.target
                )
        link_to = f.marker(LinkTo)
        if link_to is None:
            return None
        return NavLinkRecord(
            href=link_to.href, icon=link_to.icon, title=link_to.title, target=link_to.target
        )

    def _supplied_options(self, instance, field_id: str) -> list:
        """Options from the view's ``options(field_name)`` method, mapped recursively (children
        survive) — Option objects or (value, label) pairs; anything else is ignored."""
        supplier = getattr(instance, "options", None)
        if not callable(supplier):
            return []
        try:
            raw = supplier(field_id) or []
        except Exception:
            return []
        return [o for o in (self._as_option(item) for item in raw) if o is not None]

    def _as_option(self, item):
        if isinstance(item, Option):
            return item
        if isinstance(item, (tuple, list)) and len(item) == 2:
            return Option(value=str(item[0]), label=str(item[1]))
        if hasattr(item, "value") and hasattr(item, "label"):
            children = [
                o for o in (self._as_option(c) for c in getattr(item, "children", []) or []) if o
            ]
            return Option(value=str(item.value), label=str(item.label), children=children)
        return None

    def stereotype_of(self, f, plain: bool, multiline: bool, owner=None) -> str:
        s = f.marker(Stereotype)
        if s is not None:
            return s.value
        if f.has(Signature):
            return "signature"
        if f.has(PhotoCapture):
            return "camera"
        if f.has(TreeSelect):
            return "treeSelect"
        if f.has(Password):
            return "password"
        if f.has(Money):
            return "plainText" if plain else "money"
        if f.has(Lookup):
            return "combobox"
        if plain:
            return "plainText"
        if is_enum(f.type):
            # Small-enum rule (Java FieldTypeMapper's enum branch): UseRadioButtons forces radio
            # always; under @auto_layout enums with <= RADIO_MAX_OPTIONS members are radio.
            # Otherwise "select" — Java parity, matching what Mateu.NET emits since its port.
            if f.has(UseRadioButtons) or layout_inference.prefer_radio(owner, f.type):
                return "radio"
            return "select"
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
