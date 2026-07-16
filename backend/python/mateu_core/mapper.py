"""Turns an annotated Python view instance into the Mateu component tree (App->Page->Card->...->FormField).
The Python port of C#'s ReflectionMapper."""

from __future__ import annotations

import uuid
from contextvars import ContextVar
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
    KanbanMetadata,
    KanbanColumnRecord,
    KanbanCardRecord,
    TimelineMetadata,
    TimelineItemRecord,
    ProgressStepsMetadata,
    StepRecord,
    StatMetadata,
    CalendarMetadata,
    CalendarEventRecord,
    PricingTableMetadata,
    PricingPlanRecord,
    OrgChartMetadata,
    OrgNodeRecord,
    HeatmapMetadata,
    HeatCellRecord,
    FunnelMetadata,
    FunnelStageRecord,
    TrendChartMetadata,
    FeatureGridMetadata,
    FeatureRecord,
    TestimonialsMetadata,
    TestimonialRecord,
    FaqMetadata,
    FaqItemRecord,
    CalloutCardMetadata,
    CommentThreadMetadata,
    CommentRecord,
    FileListMetadata,
    FileItemRecord,
    ChecklistMetadata,
    ChecklistItemRecord,
    ComparisonCardMetadata,
    ChipRecord,
    FactRecord,
    EntityHeaderMetadata,
    MeterMetadata,
    TaskProgressMetadata,
    StatusItemRecord,
    StatusListMetadata,
    BulletedListMetadata,
    SeparatorMetadata,
    NoticeMetadata,
    QueueItemRecord,
    QueueGroupRecord,
    TaskQueueMetadata,
    ResourceItemRecord,
    ResourceGridMetadata,
    OfferCardMetadata,
    AddOnRecord,
    AddOnPickerMetadata,
    LedgerLineRecord,
    LedgerMetadata,
    PaymentMethodRecord,
    PaymentPickerMetadata,
    ProcessItemRecord,
    ProcessMonitorMetadata,
    GridColumn,
    GridColumnMeta,
    HeroSectionMetadata,
    HorizontalLayoutMetadata,
    Kpi,
    MenuItem,
    MetricCardMetadata,
    MicroFrontendMetadata,
    NavLinkRecord,
    Option,
    PageMetadata,
    ProgressBarMetadata,
    ProgressStepsMetadata,
    StepRecord,
    RemoteCoordinates,
    RuleRecord,
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
    Audience,
    BulletedList,
    ComponentTreeSupplier,
    Crud,
    Dashboard,
    DateRange,
    Disabled,
    DisabledUnless,
    EyesOnly,
    Foldout,
    HeaderBadge,
    HeroSearch,
    Hidden,
    InlineEditing,
    ItemOverview,
    Label,
    LinkSupplier,
    LinkTo,
    Listing,
    Lookup,
    Money,
    Multiline,
    NumberRange,
    OnRowSelected,
    Panel,
    Password,
    PhotoCapture,
    PlainText,
    RangeFilter,
    ReadOnly,
    ReadOnlyUnless,
    RuleSupplier,
    Searchable,
    SeparatorBefore,
    Selector,
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

# The audience projection active for the request being handled (the appState value under
# "audience", i.e. the @app_context selector named audience); None → no projection. A ContextVar
# because the mapper instance is shared by the SyncHandler across (possibly concurrent) requests.
_current_audience: ContextVar[str | None] = ContextVar("mateu_current_audience", default=None)


def set_current_audience(value) -> None:
    """Activates (or clears) the audience projection for the current request flow."""
    text = "" if value is None else str(value)
    _current_audience.set(text if text.strip() else None)


def for_current_audience(gate: Audience | None) -> bool:
    """``Audience(...)``: shown when no audience is set (full view) or when the declared values
    contain the current one. A UX projection, NOT security (that's ``EyesOnly()``)."""
    if gate is None:
        return True
    current = _current_audience.get()
    return current is None or current in gate.audiences


def _id() -> str:
    return str(uuid.uuid4())


def is_enum(t) -> bool:
    return isinstance(t, type) and issubclass(t, Enum)


def listing_types(cls) -> tuple[type, type] | None:
    """If ``cls`` derives from ``Listing[Filters, Row]``, return ``(Filters, Row)``; else None."""
    if not (isinstance(cls, type) and issubclass(cls, Listing)):
        return None
    for c in cls.__mro__:
        for base in getattr(c, "__orig_bases__", ()):
            origin = get_origin(base)
            if isinstance(origin, type) and issubclass(origin, Listing):
                args = get_args(base)
                if len(args) == 2 and all(isinstance(a, type) for a in args):
                    return args[0], args[1]
    return None


def enum_set_element_type(t) -> type | None:
    """The enum element of a ``set[SomeEnum]`` annotation; None otherwise."""
    if get_origin(t) is not set:
        return None
    args = get_args(t)
    arg = args[0] if args else None
    return arg if isinstance(arg, type) and is_enum(arg) else None


def crud_element_type(cls) -> type | None:
    """If ``cls`` derives from ``Crud[T]``, return ``T``; else ``None``."""
    if not (isinstance(cls, type) and issubclass(cls, Crud)):
        return None
    if getattr(cls, "element_type", None):
        return cls.element_type
    for c in cls.__mro__:
        for base in getattr(c, "__orig_bases__", ()):
            origin = get_origin(base)
            # Any Crud[T] subscription counts — including subclasses like HeroSearch[T].
            if isinstance(origin, type) and issubclass(origin, Crud):
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


def _row_cell(value) -> Any:
    """A grid row cell for the wire: dates ISO, enums by name, scalars as-is (numbers and
    booleans keep their JSON type, unlike format_value's strings)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.name
    return value


class ReflectionMapper:
    def __init__(self, translator: Translator | None = None, identity_provider=None):
        self.translator = translator
        self.identity_provider = identity_provider

    def authorized(self, gate) -> bool:
        """Whether the caller passes ``gate`` (mirrors Java's Authorizer): AND across declared
        dimensions, OR within each; nothing declared → unrestricted; no identity → unauthorized."""
        if gate is None:
            return True
        declared = (gate.roles, gate.groups, gate.scopes, gate.permissions)
        if not any(declared):
            return True
        identity = self.identity_provider() if self.identity_provider else None
        if identity is None:
            return False
        held = (identity.roles, identity.groups, identity.scopes, identity.permissions)
        return all(
            not wanted or any(v in have for v in wanted)
            for wanted, have in zip(declared, held)
        )

    def visible(self, f) -> bool:
        """``EyesOnly()``: the field is visible only to authorized callers; an unmatched
        ``Audience()`` projects it out as well."""
        return self.authorized(f.marker(EyesOnly)) and for_current_audience(f.marker(Audience))

    def T(self, s: str) -> str:
        return self.translator.translate(s) if self.translator else s

    def _opt_t(self, s: str | None) -> str | None:
        return None if s is None else self.T(s)

    # ── App shell ──────────────────────────────────────────────────────────────
    def map_app(self, cls, request_base_url: str | None = None) -> ClientSideComponent:
        app_title = getattr(cls, "__mateu_app__")
        # menu_item(group=...) entries sharing a group nest as that folder's submenu (the
        # folder appears where its first entry was declared); ungrouped entries stay leaves.
        items = []
        folders: dict[str, MenuItem] = {}
        for n, f in methods_with(cls, "__mateu_menu_item__"):
            if not for_current_audience(getattr(f, "__mateu_audience__", None)):
                continue
            entry = self.map_menu_item(n, f)
            group = getattr(f, "__mateu_menu_group__", "")
            if not group:
                items.append(entry)
            elif group in folders:
                folders[group].submenus.append(entry)
            else:
                folder = MenuItem(label=self.T(group), route="", server_side_type="", submenus=[entry])
                folders[group] = folder
                items.append(folder)
        # @remote_menu entries: federated options — the frontend fetches the remote backend's
        # menu itself and mounts its views (no server-side proxying).
        for label, base_url, route, explode in getattr(cls, "__mateu_remote_menus__", []):
            items.append(MenuItem(
                label=self.T(label), route=route, server_side_type="",
                consumed_route="_empty", remote=True, base_url=base_url, explode=explode,
            ))
        variant = self.variant_of(cls, items)
        home = items[0] if items else None
        meta = AppMetadata(
            title=self.T(app_title),
            variant=variant,
            menu=items,
            home_route=home.route if home else "",
            home_consumed_route=home.consumed_route if home else "",
            home_base_url=request_base_url or "",
            home_server_side_type=home.server_side_type if home else "",
            server_side_type=type_name(cls),
            sse_url=getattr(cls, "__mateu_ai_sse__", None),
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

    @staticmethod
    def variant_of(cls, items) -> str:
        """The navigation chrome (mirrors Java's AppMetadataExtractor.getVariant): an explicit
        @app(variant=...) always wins; a menu with folders → TILES when a folder nests another
        folder, HAMBURGUER_MENU past 7 top-level entries, else MENU_ON_TOP; a flat menu of leaf
        entries → TABS."""
        explicit = getattr(cls, "__mateu_app_variant__", "")
        if explicit:
            return explicit
        if any(i.submenus for i in items):
            if any(s.submenus for i in items for s in i.submenus):
                return "TILES"
            return "HAMBURGUER_MENU" if len(items) > 7 else "MENU_ON_TOP"
        return "TABS"

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
            return self.map_crud(cls, element, route, instance)
        listing = listing_types(cls)
        if listing is not None:
            return self.map_listing(cls, listing[0], listing[1], route)

        title = self.T(getattr(cls, "__mateu_title__", humanize(cls.__name__)))
        buttons = [
            self.map_button(n, f)
            for n, f in methods_with(cls, "__mateu_button__")
            if for_current_audience(getattr(f, "__mateu_audience__", None))
        ]
        fabs = self.fabs(cls)
        actions = [Action(id=b.action_id) for b in buttons] + [Action(id=f.action_id) for f in fabs]
        # OnRowSelected() grid actions must be advertised or the renderer drops the row click.
        for f in view_fields(cls):
            on_row = f.marker(OnRowSelected)
            if on_row is not None and all(a.id != camel_case(on_row.value) for a in actions):
                actions.append(Action(id=camel_case(on_row.value), validation_required=False))

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
            toc=getattr(cls, "__mateu_toc__", None),
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
            rules=self.map_rules(cls, instance),
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
        if isinstance(c, fluent.Kanban):
            columns = [
                KanbanColumnRecord(
                    id=col.id,
                    title=col.title,
                    color=col.color,
                    cards=[
                        KanbanCardRecord(
                            id=card.id,
                            title=card.title,
                            description=card.description,
                            badge=card.badge,
                            color=card.color,
                            action_id=card.action_id,
                        )
                        for card in col.cards
                    ],
                )
                for col in c.columns
            ]
            return self._fluent_client(KanbanMetadata(columns=columns), c)
        if isinstance(c, fluent.Timeline):
            items = [
                TimelineItemRecord(
                    id=it.id,
                    title=it.title,
                    description=it.description,
                    timestamp=it.timestamp,
                    icon=it.icon,
                    color=it.color,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(TimelineMetadata(items=items), c)
        if isinstance(c, fluent.ProgressSteps):
            steps = [
                StepRecord(id=s.id, title=s.title, description=s.description, status=s.status)
                for s in c.steps
            ]
            return self._fluent_client(ProgressStepsMetadata(steps=steps), c)
        if isinstance(c, fluent.Stat):
            return self._fluent_client(
                StatMetadata(
                    label=c.label,
                    value=c.value,
                    unit=c.unit,
                    delta=c.delta,
                    trend=c.trend,
                    spark=list(c.spark),
                    action_id=c.action_id,
                ),
                c,
            )
        if isinstance(c, fluent.Calendar):
            events = [
                CalendarEventRecord(
                    id=e.id,
                    title=e.title,
                    date=e.date.isoformat() if e.date is not None else None,
                    color=e.color,
                    action_id=e.action_id,
                )
                for e in c.events
            ]
            return self._fluent_client(
                CalendarMetadata(
                    month=c.month.isoformat() if c.month is not None else None, events=events
                ),
                c,
            )
        if isinstance(c, fluent.PricingTable):
            plans = [
                PricingPlanRecord(
                    id=p.id,
                    name=p.name,
                    price=p.price,
                    period=p.period,
                    featured=p.featured,
                    features=list(p.features),
                    cta_label=p.cta_label,
                    action_id=p.action_id,
                )
                for p in c.plans
            ]
            return self._fluent_client(PricingTableMetadata(plans=plans), c)
        if isinstance(c, fluent.OrgChart):
            return self._fluent_client(
                OrgChartMetadata(root=self._org_node(c.root) if c.root is not None else None), c
            )
        if isinstance(c, fluent.Heatmap):
            cells = [
                HeatCellRecord(
                    date=cl.date.isoformat() if cl.date is not None else None,
                    value=cl.value,
                    label=cl.label,
                )
                for cl in c.cells
            ]
            return self._fluent_client(HeatmapMetadata(cells=cells), c)
        if isinstance(c, fluent.Funnel):
            stages = [
                FunnelStageRecord(label=s.label, value=s.value, color=s.color) for s in c.stages
            ]
            return self._fluent_client(FunnelMetadata(stages=stages), c)
        if isinstance(c, fluent.TrendChart):
            return self._fluent_client(
                TrendChartMetadata(
                    title=c.title,
                    values=list(c.values),
                    labels=list(c.labels),
                    color=c.color,
                    area=c.area,
                ),
                c,
            )
        if isinstance(c, fluent.FeatureGrid):
            features = [
                FeatureRecord(
                    icon=f.icon, title=f.title, description=f.description, action_id=f.action_id
                )
                for f in c.features
            ]
            return self._fluent_client(
                FeatureGridMetadata(features=features, columns=c.columns), c
            )
        if isinstance(c, fluent.Testimonials):
            items = [
                TestimonialRecord(
                    quote=t.quote, author=t.author, role=t.role, avatar=t.avatar, rating=t.rating
                )
                for t in c.items
            ]
            return self._fluent_client(TestimonialsMetadata(items=items), c)
        if isinstance(c, fluent.Faq):
            items = [
                FaqItemRecord(question=i.question, answer=i.answer, open=i.open) for i in c.items
            ]
            return self._fluent_client(FaqMetadata(items=items), c)
        if isinstance(c, fluent.CalloutCard):
            return self._fluent_client(
                CalloutCardMetadata(
                    title=c.title,
                    description=c.description,
                    icon=c.icon,
                    cta_label=c.cta_label,
                    action_id=c.action_id,
                    theme=c.theme,
                ),
                c,
            )
        if isinstance(c, fluent.CommentThread):
            comments = [self._comment(cm) for cm in c.comments]
            return self._fluent_client(CommentThreadMetadata(comments=comments), c)
        if isinstance(c, fluent.FileList):
            files = [
                FileItemRecord(
                    name=f.name, size=f.size, type=f.type, url=f.url, action_id=f.action_id
                )
                for f in c.files
            ]
            return self._fluent_client(FileListMetadata(files=files), c)
        if isinstance(c, fluent.Checklist):
            items = [
                ChecklistItemRecord(
                    id=i.id, label=i.label, done=i.done, action_id=i.action_id
                )
                for i in c.items
            ]
            return self._fluent_client(ChecklistMetadata(title=c.title, items=items), c)
        if isinstance(c, fluent.ComparisonCard):
            return self._fluent_client(
                ComparisonCardMetadata(
                    title=c.title,
                    left_label=c.left_label,
                    left_value=c.left_value,
                    right_label=c.right_label,
                    right_value=c.right_value,
                    delta=c.delta,
                    trend=c.trend,
                ),
                c,
            )
        if isinstance(c, fluent.EntityHeader):
            meta = EntityHeaderMetadata(
                title=c.title,
                badges=[ChipRecord(label=b.label, color=b.color) for b in c.badges],
                subtitle=c.subtitle,
                facts=[FactRecord(label=f.label, value=f.value) for f in c.facts],
                metric_label=c.metric_label,
                metric_value=c.metric_value,
                metric_caption=c.metric_caption,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Meter):
            meta = MeterMetadata(
                label=c.label,
                value=c.value,
                max=c.max,
                unit=c.unit,
                caption=c.caption,
                warn_at=c.warn_at,
                danger_at=c.danger_at,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.TaskProgress):
            meta = TaskProgressMetadata(
                label=c.label,
                total=c.total,
                done=c.done,
                action_label=c.action_label,
                action_id=c.action_id,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.StatusList):
            items = [
                StatusItemRecord(
                    id=it.id,
                    icon=it.icon,
                    avatar=it.avatar,
                    title=it.title,
                    description=it.description,
                    status=it.status,
                    status_color=it.status_color,
                    action_label=it.action_label,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(
                StatusListMetadata(items=items, compact=c.compact, frameless=c.frameless), c
            )
        if isinstance(c, fluent.BulletedList):
            return self._fluent_client(BulletedListMetadata(items=list(c.items)), c)
        if isinstance(c, fluent.Notice):
            return self._fluent_client(
                NoticeMetadata(
                    text=self.T(c.text), theme=c.theme, icon=c.icon, no_icon=c.no_icon,
                    action_label=c.action_label, action_id=c.action_id, status=c.status,
                    slim=c.slim, full_width=c.full_width,
                ), c, [self.map_component(child) for child in c.content])
        if isinstance(c, fluent.TaskQueue):
            groups = [
                QueueGroupRecord(
                    label=g.label,
                    items=[
                        QueueItemRecord(
                            id=it.id,
                            title=it.title,
                            caption=it.caption,
                            badges=[
                                ChipRecord(label=b.label, color=b.color) for b in it.badges
                            ],
                            selected=it.selected,
                        )
                        for it in g.items
                    ],
                )
                for g in c.groups
            ]
            return self._fluent_client(
                TaskQueueMetadata(action_id=c.action_id, groups=groups), c
            )
        if isinstance(c, fluent.ResourceGrid):
            items = [
                ResourceItemRecord(
                    id=it.id,
                    title=it.title,
                    subtitle=it.subtitle,
                    status_label=it.status_label,
                    status_color=it.status_color,
                    note=it.note,
                    note_color=it.note_color,
                    disabled=it.disabled,
                    recommended=it.recommended,
                    selected=it.selected,
                )
                for it in c.items
            ]
            meta = ResourceGridMetadata(
                action_id=c.action_id,
                columns=c.columns,
                recommended_label=c.recommended_label,
                items=items,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.OfferCard):
            meta = OfferCardMetadata(
                tag=c.tag,
                title=c.title,
                subtitle=c.subtitle,
                image=c.image,
                features=list(c.features),
                price_label=c.price_label,
                action_label=c.action_label,
                action_id=c.action_id,
                current=c.current,
                current_label=c.current_label,
                added=c.added,
                added_label=c.added_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.AddOnPicker):
            items = [
                AddOnRecord(
                    id=it.id,
                    icon=it.icon,
                    title=it.title,
                    description=it.description,
                    price=it.price,
                    unit=it.unit,
                    included_label=it.included_label,
                    added=it.added,
                )
                for it in c.items
            ]
            meta = AddOnPickerMetadata(
                total_label=c.total_label,
                currency=c.currency,
                action_id=c.action_id,
                items=items,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Ledger):
            lines = [
                LedgerLineRecord(
                    concept=ln.concept,
                    amount=ln.amount,
                    included=ln.included,
                    included_label=ln.included_label,
                )
                for ln in c.lines
            ]
            meta = LedgerMetadata(
                currency=c.currency, total_label=c.total_label, lines=lines, total=c.total
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.PaymentPicker):
            methods = [PaymentMethodRecord(id=m.id, label=m.label) for m in c.methods]
            meta = PaymentPickerMetadata(
                action_id=c.action_id,
                methods=methods,
                selected=c.selected,
                context_label=c.context_label,
                context_value=c.context_value,
                confirm_label=c.confirm_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.ProcessMonitor):
            items = [
                ProcessItemRecord(
                    id=it.id,
                    name=it.name,
                    systems=list(it.systems),
                    ok=it.ok,
                    warnings=it.warnings,
                    errors=it.errors,
                    status=it.status,
                    action_label=it.action_label,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(ProcessMonitorMetadata(items=items), c)
        if isinstance(c, fluent.Button):
            meta = ButtonMetadata(
                label=self.T(c.label), action_id=c.action_id, disabled=c.disabled,
                button_style=c.button_style,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Text):
            return self._fluent_client(
                TextMetadata(text=self.T(c.text), size=c.size, no_margins=c.no_margins), c)
        if isinstance(c, fluent.Separator):
            return self._fluent_client(SeparatorMetadata(), c)
        # Federation — a remote Mateu UI mounted as an island inside this page.
        if isinstance(c, fluent.MicroFrontend):
            meta = MicroFrontendMetadata(
                base_url=c.base_url, route=c.route, style=c.style,
                css_classes=c.css_classes, app_state=c.app_state,
            )
            return self._fluent_client(meta, c)
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

    def _comment(self, cm) -> CommentRecord:
        return CommentRecord(
            id=cm.id,
            author=cm.author,
            avatar=cm.avatar,
            text=cm.text,
            timestamp=cm.timestamp,
            replies=[self._comment(r) for r in cm.replies],
        )

    def _org_node(self, n) -> OrgNodeRecord:
        return OrgNodeRecord(
            id=n.id,
            title=n.title,
            subtitle=n.subtitle,
            avatar=n.avatar,
            color=n.color,
            action_id=n.action_id,
            children=[self._org_node(child) for child in n.children],
        )

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
        # wizard_progress("steps"): connected step bullets instead of the progress bar
        # (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        if getattr(cls, "__mateu_wizard_progress__", "bar") == "steps":
            progress = self.client(
                ProgressStepsMetadata(
                    steps=[
                        StepRecord(
                            id=f"step-{i}",
                            title=f"Step {i}",
                            status="done" if i < current else "current" if i == current else "upcoming",
                        )
                        for i in range(1, total + 1)
                    ]
                ),
                "fieldId",
                [],
            )
        else:
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
    def map_crud(self, cls, element, route: str, instance=None) -> ServerSideComponent:
        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        # HeroSearch: a centered hero header over the listing, results as cards, no auto-search.
        hero = instance if isinstance(instance, HeroSearch) else (
            cls() if isinstance(cls, type) and issubclass(cls, HeroSearch) else None
        )
        # Class-level @inline_editing: every data column (except ReadOnly() ones) is edited in
        # place; each committed cell dispatches the crud's update-row action (Java parity).
        inline = getattr(cls, "__mateu_inline_editing__", False)
        columns = []
        for f in view_fields(element):
            if not self.visible(f):
                continue
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
            CrudMetadata(
                title=title,
                columns=columns,
                toolbar=toolbar,
                filters=self.crud_filters(element),
                crudl_type="cards" if hero is not None else "table",
            ),
            "crud",
            [],
        )
        page_children = []
        if hero is not None:
            page_children.append(self.client(
                HeroSectionMetadata(
                    title=hero.hero_title(), subtitle=hero.hero_subtitle(),
                    image=hero.hero_image(), centered=True,
                ),
                None, [],
            ))
        page_children.append(crud)
        page = self.client(PageMetadata(), None, page_children)
        actions = [Action(id="search"), Action(id="new"), Action(id="delete")]
        if inline:
            actions.append(Action(id="update-row"))
        # A hero-search page starts EMPTY (the user searches); plain cruds preload their rows.
        triggers = [] if hero is not None else [Trigger(type="OnLoad", action_id="search")]
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions, triggers=triggers,
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

    def map_listing(self, cls, filters_type, row_type, route: str) -> ServerSideComponent:
        """A declarative Listing view: a read-only searchable listing — columns from the Row
        type, the smart search bar from the Filters type (typed DateRange/NumberRange/set fields
        render range and multi-select widgets — the type is the developer's explicit ask,
        mirroring Java's PageListingBuilder.isTypedFilter)."""
        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        # A self-referential children list makes rows hierarchical (grid_layout "tree"); it rides
        # inside the row dicts, never as a column.
        columns = [
            GridColumn(metadata=GridColumnMeta(
                id=camel_case(f.name),
                label=(f.marker(Label).value if f.has(Label) else humanize(f.name)),
                data_type=self.infer_data_type(f.type, f),
            ))
            for f in view_fields(row_type)
            if self.grid_row_type(f) is None and self.visible(f)
        ]
        actions = [Action(id="search")]
        if issubclass(cls, Selector):
            # The rows of a selector dialog show a Select button (the frontend keys on the
            # "select" action column) and clicking dispatches action-on-row-select.
            columns.append(GridColumn(metadata=GridColumnMeta(
                id="select", label="Select", data_type="action", stereotype="button",
            )))
            actions.append(Action(id="action-on-row-select", validation_required=False))
        crud = self.client(
            CrudMetadata(title=title, columns=columns, toolbar=[],
                         can_edit=False, filters=self.listing_filters(filters_type),
                         grid_layout=cls().grid_layout()),
            "crud",
            [],
        )
        page = self.client(PageMetadata(), None, [crud])
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions,
            triggers=[Trigger(type="OnLoad", action_id="search")],
        )

    def listing_filters(self, filters_type) -> list[FormFieldMetadata]:
        out: list[FormFieldMetadata] = []
        for f in view_fields(filters_type):
            fid = camel_case(f.name)
            label = f.marker(Label).value if f.has(Label) else humanize(f.name)
            t = f.type
            if t is DateRange:
                out.append(FormFieldMetadata(field_id=fid, data_type="date", label=label, stereotype="dateRange"))
            elif t is NumberRange:
                out.append(FormFieldMetadata(field_id=fid, data_type="number", label=label, stereotype="numberRange"))
            elif enum_set_element_type(t) is not None:
                el = enum_set_element_type(t)
                out.append(FormFieldMetadata(
                    field_id=fid, data_type="string", label=label, stereotype="multiSelect",
                    options=[Option(value=m.name, label=humanize(m.name)) for m in el],
                ))
            elif is_enum(t):
                out.append(FormFieldMetadata(
                    field_id=fid, data_type="string", label=label, stereotype="select",
                    options=[Option(value=m.name, label=humanize(m.name)) for m in t],
                ))
            else:
                out.append(FormFieldMetadata(field_id=fid, data_type=self.infer_data_type(t, f), label=label))
        return out

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
            # Hidden()/Disabled() on entity fields rule the detail form too.
            rules=self.map_rules(element, entity),
        )

    def map_rules(self, cls, instance) -> list[RuleRecord]:
        """Client-side rules of a view (mirrors Java's RuleMapper.createRules): ``Disabled()``
        fields disable unconditionally, ``Hidden(expr)`` fields hide while the expression is
        truthy, and a :class:`RuleSupplier` contributes programmatic rules."""
        rules: list[RuleRecord] = []
        for f in view_fields(cls):
            field_id = camel_case(f.name)
            if f.has(Disabled) or not self.authorized(f.marker(DisabledUnless)):
                rules.append(RuleRecord(
                    filter="true", action="SetDataValue", field_name=field_id,
                    field_attribute="disabled", expression="true",
                ))
            hidden = f.marker(Hidden)
            if hidden is not None and hidden.value:
                rules.append(RuleRecord(
                    filter="true", action="SetDataValue", field_name=field_id,
                    field_attribute="hidden", expression=hidden.value,
                ))
        if isinstance(instance, RuleSupplier):
            rules.extend(
                RuleRecord(
                    filter=r.filter, action=r.action, field_name=r.field_name,
                    field_attribute=r.field_attribute, value=r.value, expression=r.expression,
                    result=r.result, action_id=r.action_id,
                )
                for r in instance.rules()
            )
        return rules

    # ── Fields & layout ────────────────────────────────────────────────────────
    def form_cards(self, cls, instance, read_only: bool = False) -> list:
        read_only = read_only or bool(class_flag(cls, "__mateu_read_only__", False))
        fields = [f for f in view_fields(cls) if self.visible(f)]
        if any(f.has(Tab) for f in fields):
            return [self.tab_layout(cls, fields, instance, read_only)]

        # Group the declared fields into sections (title None = synthetic/unnamed section).
        sections: list[tuple[str | None, list]] = []
        section_zones: list[str] = []
        section_markers: list[Section | None] = []
        current: str | None = None
        current_zone = ""
        current_marker: Section | None = None
        for f in fields:
            # A new section starts when the Section declaration actually changes — comparing
            # EVERY attribute (frozen dataclass equality), not just the caption: two consecutive
            # untitled sections pointing at different zones (or with different property_list/
            # frameless flags) are distinct sections.
            sec = f.marker(Section)
            starts_new = not sections or (
                sec is not None and (current_marker is None or sec != current_marker)
            )
            if sec is not None:
                current = sec.caption
                current_zone = sec.zone
                current_marker = sec
            if starts_new:
                sections.append((current, []))
                section_zones.append(current_zone)
                section_markers.append(current_marker)
            sections[-1][1].append(f)

        # @zones columns on the class: sections lay out side by side (zones win over inference).
        declared_zones = getattr(cls, "__mateu_zones__", None)
        if declared_zones and len(sections) > 1:
            return [self.build_zones(
                declared_zones, sections, section_zones, section_markers, instance, read_only)]

        # @folded_layout: the section cards side by side in one horizontal row (zones win).
        if class_flag(cls, "__mateu_folded_layout__", False) and len(sections) > 1:
            return [ClientSideComponent(
                metadata=HorizontalLayoutMetadata(spacing=True),
                children=[
                    self.section_card(t, self.map_fields(fs, instance, read_only))
                    for t, fs in sections
                ],
            )]

        if self.prefer_tabs(cls, sections, read_only):
            return [self.tabs_from_sections(sections, instance, read_only)]

        plan = self.fold_plan(cls, sections, read_only)
        if plan is not None:
            return [self.folded_card(plan[0], plan[1], instance, read_only)]

        return [
            self.section_card(t, self.map_fields(fs, instance, read_only), section_markers[i])
            for i, (t, fs) in enumerate(sections)
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
            self.form_rows(self.map_fields(main, instance, read_only)),
        )
        folded_layout = self.client(
            FormLayoutMetadata(),
            None,
            self.form_rows(self.map_fields(folded, instance, read_only)),
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
                self.form_rows(self.map_fields(fs, instance, read_only)),
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

    def build_zones(
        self, declared_zones, sections, section_zones, section_markers, instance, read_only
    ) -> ClientSideComponent:
        """Distributes sections into the @zones columns and lays them out side by side — each
        zone a VerticalLayout stacking its section cards, its width from the zone declaration;
        sections with an unrecognised zone fall into a trailing flexible column (mirrors Java's
        SectionFormRenderer.renderZones)."""

        def card_of(i):
            title, fields = sections[i]
            return self.section_card(
                title,
                self.map_fields(fields, instance, read_only),
                section_markers[i],
            )

        def column(cards, width: str) -> ClientSideComponent:
            # Grow AND shrink around the declared basis minus the spacing gap (with flex-wrap the
            # line breaks are computed from the basis, so 62% + 38% + gap would wrap or overflow);
            # min-width sets the responsive wrap point (mirrors Java's widthStyle).
            style = (
                f"flex: 1 1 calc({width} - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);"
                if width
                else "flex: 1 1 12rem; min-width: min(20rem, 100%);"
            )
            return ClientSideComponent(
                metadata=VerticalLayoutMetadata(spacing=True), children=list(cards), style=style,
            )

        columns = []
        remaining = list(range(len(sections)))
        for name, width in declared_zones:
            mine = [i for i in remaining if section_zones[i] == name]
            if not mine:
                continue
            remaining = [i for i in remaining if i not in mine]
            columns.append(column((card_of(i) for i in mine), width))
        if remaining:
            columns.append(column((card_of(i) for i in remaining), ""))

        return ClientSideComponent(
            metadata=HorizontalLayoutMetadata(spacing=True, wrap=True),
            children=columns,
            style="width: 100%; align-items: flex-start;",
        )

    def section_card(
        self, title: str | None, fields, section: Section | None = None
    ) -> ClientSideComponent:
        # Section(property_list=True): every data field becomes a read-only property row (label
        # left / value right, divider between rows), stacked full-width — so the body is a plain
        # vertical layout instead of the responsive form layout (mirrors Java's
        # SectionFormRenderer.asPropertyList).
        if section is not None and section.property_list:
            body = ClientSideComponent(
                metadata=VerticalLayoutMetadata(),
                children=[self._as_property_row(f) for f in fields],
                style="width: 100%; align-items: stretch;",
            )
        else:
            body = self.client(FormLayoutMetadata(), None, self.form_rows(fields))
        # Section(frameless=True): no card wrapper, no padding — the content sits bare (mirrors
        # Java's @Section(frameless=true)).
        if section is not None and section.frameless:
            return ClientSideComponent(
                metadata=DivMetadata(),
                children=[body],
                style="flex: 1; min-width: 0; width:100%;",
            )
        if title is not None:
            return self.client(FormSectionMetadata(title=title), None, [body])
        vlayout = self.client(VerticalLayoutMetadata(), None, [body])
        div = self.client(DivMetadata(), "fieldId", [vlayout])
        return self.client(CardMetadata(content=div), "fieldId", [])

    @staticmethod
    def _as_property_row(field: ClientSideComponent) -> ClientSideComponent:
        meta = field.metadata
        if not isinstance(meta, FormFieldMetadata) or meta.stereotype == "grid":
            return field
        return field.model_copy(
            update={
                "metadata": meta.model_copy(
                    update={"property_row": True, "read_only": True, "colspan": 1}
                )
            }
        )

    def map_fields(self, fields, instance, read_only: bool) -> list:
        """Maps declared fields to DTOs, inserting a full-width separator above any
        ``SeparatorBefore()`` field (mirrors Java's FormLayoutBuilder)."""
        out = []
        for f in fields:
            if f.has(SeparatorBefore):
                out.append(ClientSideComponent(
                    metadata=SeparatorMetadata(attributes={"data-colspan": "2"})))
            out.append(self.map_field(f, instance, read_only))
        return out

    def form_rows(self, fields, max_columns: int = 2) -> list:
        rows = []
        pending = []
        for field in fields:
            # A separator always takes a full row of its own (data-colspan spans the columns).
            if isinstance(field.metadata, SeparatorMetadata):
                if pending:
                    rows.append(self.client(FormRowMetadata(), None, pending))
                    pending = []
                rows.append(self.client(FormRowMetadata(), None, [field]))
                continue
            pending.append(field)
            if len(pending) == max_columns:
                rows.append(self.client(FormRowMetadata(), None, pending))
                pending = []
        if pending:
            rows.append(self.client(FormRowMetadata(), None, pending))
        return rows

    @staticmethod
    def grid_row_type(f) -> type | None:
        """The row type of a grid (list-of-complex-rows) field; None when the field is not a
        grid (scalars, strings, enums…)."""
        if get_origin(f.type) is not list:
            return None
        args = get_args(f.type)
        arg = args[0] if args else None
        return arg if isinstance(arg, type) and arg is not str and not is_enum(arg) else None

    def map_grid_field(self, f, row_type, instance, read_only: bool) -> ClientSideComponent:
        """A list-of-rows field → a grid FormField (dataType "array", stereotype "grid", one
        GridColumn per row field, rows identified by position). Mirrors Java's
        GridColumnBuilder.getFormFieldForArray."""
        field_id = camel_case(f.name)
        # InlineEditing() on the grid field: cells edit in place, commits accumulate in the form
        # state (the frontend's renderEditableCell form-grid path) and save with the form.
        inline = not read_only and f.has(InlineEditing)
        columns = []
        for c in view_fields(row_type):
            if not self.visible(c):
                continue
            editable = inline and not c.has(ReadOnly)
            columns.append(GridColumn(metadata=GridColumnMeta(
                id=camel_case(c.name),
                label=(c.marker(Label).value if c.has(Label) else humanize(c.name)),
                data_type=self.infer_data_type(c.type, c),
                editable=editable,
                editor_type=self.editor_type_of(c) if editable else None,
                editor_options=(
                    [Option(value=m.name, label=str(m.name)) for m in c.type]
                    if editable and is_enum(c.type) else None
                ),
            )))
        rows = []
        for item in getattr(instance, f.name, None) or []:
            rows.append({
                camel_case(c.name): _row_cell(getattr(item, c.name, None))
                for c in view_fields(row_type)
            })
        on_row = f.marker(OnRowSelected)
        meta = FormFieldMetadata(
            field_id=field_id,
            data_type="array",
            label=self.T(f.marker(Label).value if f.has(Label) else humanize(f.name)),
            stereotype="grid",
            read_only=read_only,
            columns=columns,
            item_id_path="_rowNumber",
            initial_value=rows,
            on_item_selection_action_id=camel_case(on_row.value) if on_row else None,
            row_selection_shortcut=on_row.shortcut if on_row and on_row.shortcut else None,
        )
        return self.client(meta, field_id, [])

    def map_field(self, f, instance, read_only: bool = False) -> ClientSideComponent:
        field_id = camel_case(f.name)
        row_type = self.grid_row_type(f)
        if row_type is not None:
            return self.map_grid_field(f, row_type, instance, read_only)
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

        # ReadOnlyUnless(): read-only unless the caller is authorized.
        read_only = read_only or not self.authorized(f.marker(ReadOnlyUnless))
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
        if f.has(BulletedList):
            return "bulletedList"
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
        if f.has(Searchable):
            return "searchable"
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
            disabled=not self.authorized(getattr(fn, "__mateu_disabled_unless__", None)),
        )

    @staticmethod
    def client(meta, id, children) -> ClientSideComponent:
        return ClientSideComponent(metadata=meta, id=id, children=children)
