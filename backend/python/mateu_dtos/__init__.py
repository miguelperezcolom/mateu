"""The Mateu wire model in Pydantic — a 1:1 mirror of ``io.mateu.dtos`` (and of the C# ``Mateu.Dtos``).

Serialized to the exact same JSON the renderers consume: camelCase property names, nulls kept,
polymorphic ``type`` discriminators on the component tree and the metadata tree.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal, Union

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class Wire(BaseModel):
    """Base for every wire model: camelCase aliases, populate by field name too, keep nulls."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)


# ── Component metadata (discriminated on "type") ───────────────────────────────
class AppMetadata(Wire):
    type: Literal["App"] = "App"
    title: str
    variant: str
    menu: list["MenuItem"] = Field(default_factory=list)
    layout: str = "SINGLE_SLOT"
    home_route: str = ""
    home_consumed_route: str = ""
    #: The backend's public base URL — the shell loads its home content against it (mirrors
    #: AppDto.homeBaseUrl; without it the first auto-load fires page-relative).
    home_base_url: str = ""
    home_server_side_type: str = ""
    server_side_type: str = ""
    root_route: str = ""
    subtitle: str | None = None
    login_url: str | None = None
    logout_url: str | None = None
    #: SSE chat endpoint (@ai); when set the renderer shows the floating AI chat.
    sse_url: str | None = None
    context_selectors: list["AppContextSelector"] = Field(default_factory=list)


class AppContextSelector(Wire):
    """An application-level context selector shown on the app header: fixes a value for every
    screen (the active hotel, the company…). The picked value lives in the app state under
    field_name and travels with every request."""

    field_name: str
    label: str
    options: list["Option"] = Field(default_factory=list)


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


class CardMetadata(Wire):
    type: Literal["Card"] = "Card"
    content: "Component"
    title: str | None = None
    variants: list[str] = Field(default_factory=lambda: ["outlined"])


class DivMetadata(Wire):
    type: Literal["Div"] = "Div"
    content: Any | None = None


class VerticalLayoutMetadata(Wire):
    type: Literal["VerticalLayout"] = "VerticalLayout"
    spacing: bool = False


class HorizontalLayoutMetadata(Wire):
    type: Literal["HorizontalLayout"] = "HorizontalLayout"
    spacing: bool = True


class FormLayoutMetadata(Wire):
    type: Literal["FormLayout"] = "FormLayout"
    max_columns: int = 2
    auto_responsive: bool = True


class FormRowMetadata(Wire):
    type: Literal["FormRow"] = "FormRow"


class FormSectionMetadata(Wire):
    type: Literal["FormSection"] = "FormSection"
    title: str


class FormFieldMetadata(Wire):
    type: Literal["FormField"] = "FormField"
    field_id: str
    data_type: str
    label: str
    stereotype: str = "regular"
    tree_leaves_only: bool = False
    required: bool = False
    read_only: bool = False
    colspan: int = 1
    initial_value: Any | None = None
    options: list["Option"] = Field(default_factory=list)
    multiline: bool = False
    #: Navigation link rendered as an icon at the right side of this field; None = no link.
    link: "NavLinkRecord | None" = None
    #: Where a lookup (remote combo) field searches its options: the renderer fires ``action``
    #: with {searchText, page, size} and expects a page of options back. None on other fields.
    remote_coordinates: "RemoteCoordinates | None" = None
    #: Grid (list-of-rows) fields: one GridColumn per row-type field. None on non-grid fields.
    columns: "list[GridColumn] | None" = None
    #: Grid fields: the row-identity path ("_rowNumber" — rows are identified by position).
    item_id_path: str | None = None
    #: Grid fields: action dispatched when the user selects (clicks) a row, carrying the row as
    #: the _clickedRow parameter (OnRowSelected()).
    on_item_selection_action_id: str | None = None
    #: Grid fields: keyboard base combo for selecting a row by position.
    row_selection_shortcut: str | None = None


class RemoteCoordinates(Wire):
    """Coordinates of a remote data source (mirrors ``io.mateu.dtos.RemoteCoordinatesDto``);
    only ``action`` is set for same-backend lookups."""

    action: str
    base_url: str | None = None
    route: str | None = None
    params: dict[str, Any] | None = None


class NavLinkRecord(Wire):
    """Navigation link on a form field (mirrors ``io.mateu.dtos.NavLinkDto``; "Record" suffix to
    avoid clashing with ``mateu_uidl.NavLink``, like ``GanttTaskRecord``). ``href``/``title``
    travel as raw ``${...}`` templates — the renderer interpolates them against the live state."""

    href: str
    icon: str | None = None
    title: str | None = None
    target: str | None = None


class CrudMetadata(Wire):
    type: Literal["Crud"] = "Crud"
    title: str | None = None
    columns: list["GridColumn"] = Field(default_factory=list)
    toolbar: list["Button"] = Field(default_factory=list)
    subtitle: str | None = None
    searchable: bool = True
    can_edit: bool = False
    detail_path: str | None = None
    crudl_type: str = "table"
    #: The renderer's grid layout: auto (renderer decides) | table | list | cards | masterDetail
    #: | tree (hierarchical rows carrying a self-referential children list — never auto-selected).
    grid_layout: str = "auto"
    # the smart search bar's filters, one FormField per filterable entity field (enums as
    # multi-selects, temporals as date ranges, RangeFilter numerics as min-max)
    filters: list["FormFieldMetadata"] = Field(default_factory=list)


class ProgressBarMetadata(Wire):
    type: Literal["ProgressBar"] = "ProgressBar"
    value: float
    min: float = 0
    max: float = 1


class TextMetadata(Wire):
    type: Literal["Text"] = "Text"
    text: str


class ButtonMetadata(Wire):
    type: Literal["Button"] = "Button"
    label: str
    action_id: str
    disabled: bool = False
    button_style: str | None = None


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


class MetricCardMetadata(Wire):
    """KPI tile metadata for dashboards (mirrors ``MetricCardDto``)."""

    type: Literal["MetricCard"] = "MetricCard"
    title: str | None = None
    value: str | None = None
    unit: str | None = None
    trend: str | None = None  # "up" | "down" | "neutral"
    trend_label: str | None = None
    icon: str | None = None
    description: str | None = None
    action_id: str | None = None


class ScoreboardMetadata(Wire):
    """Horizontal band of metric cards; the metric cards travel as component children."""

    type: Literal["Scoreboard"] = "Scoreboard"


class DashboardPanelMetadata(Wire):
    """Titled dashboard tile; the wrapped component travels as the component's single child."""

    type: Literal["DashboardPanel"] = "DashboardPanel"
    title: str | None = None
    subtitle: str | None = None
    col_span: int = 1
    row_span: int = 1


class DashboardLayoutMetadata(Wire):
    """Responsive dashboard grid; tiles travel as component children. 0 columns = auto-fit."""

    type: Literal["DashboardLayout"] = "DashboardLayout"
    columns: int = 0


class FoldoutPanelInfo(Wire):
    """Header info for one foldout panel (mirrors ``FoldoutPanelInfoDto``)."""

    title: str | None = None
    subtitle: str | None = None
    icon: str | None = None
    open: bool = True


class FoldoutLayoutMetadata(Wire):
    """Redwood-style foldout. Overview travels as the child slotted ``overview``; each panel's
    content as the child slotted ``panel-N`` matching the panels list order."""

    type: Literal["FoldoutLayout"] = "FoldoutLayout"
    panels: list[FoldoutPanelInfo] = Field(default_factory=list)


class HeroSectionMetadata(Wire):
    """Page hero header; slotted content travels as component children."""

    type: Literal["HeroSection"] = "HeroSection"
    title: str | None = None
    subtitle: str | None = None
    image: str | None = None
    height: str | None = None
    centered: bool = False


class EmptyStateMetadata(Wire):
    """Friendly empty-state placeholder (mirrors ``EmptyStateDto``)."""

    type: Literal["EmptyState"] = "EmptyState"
    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None
    action_label: str | None = None


class SkeletonMetadata(Wire):
    """Shimmering loading placeholder (mirrors ``SkeletonDto``)."""

    type: Literal["Skeleton"] = "Skeleton"
    variant: str = "text"  # "text" | "card" | "grid" | "form"
    count: int = 0


class GanttTaskRecord(Wire):
    """One Gantt bar; start/end are ISO-8601 dates (mirrors ``GanttTaskDto``)."""

    id: str | None = None
    title: str | None = None
    start: str | None = None
    end: str | None = None
    progress: float = 0
    color: str | None = None


class GanttMetadata(Wire):
    """Gantt/timeline chart metadata (mirrors ``GanttDto``)."""

    type: Literal["Gantt"] = "Gantt"
    tasks: list[GanttTaskRecord] = Field(default_factory=list)


class KanbanCardRecord(Wire):
    """One kanban card; ``action_id`` — when set — makes the card clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    badge: str | None = None
    color: str | None = None
    action_id: str | None = None


class KanbanColumnRecord(Wire):
    """One kanban column with its cards (mirrors ``KanbanColumnDto``)."""

    id: str | None = None
    title: str | None = None
    color: str | None = None
    cards: list[KanbanCardRecord] = Field(default_factory=list)


class KanbanMetadata(Wire):
    """Kanban board metadata: columns of cards (mirrors ``KanbanDto``)."""

    type: Literal["Kanban"] = "Kanban"
    columns: list[KanbanColumnRecord] = Field(default_factory=list)


class TimelineItemRecord(Wire):
    """One timeline entry; ``action_id`` — when set — makes it clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    timestamp: str | None = None
    icon: str | None = None
    color: str | None = None
    action_id: str | None = None


class TimelineMetadata(Wire):
    """Timeline / activity-feed metadata (mirrors ``TimelineDto``)."""

    type: Literal["Timeline"] = "Timeline"
    items: list[TimelineItemRecord] = Field(default_factory=list)


class StepRecord(Wire):
    """One progress step; ``status`` is done|current|upcoming (mirrors ``StepDto``)."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None


class ProgressStepsMetadata(Wire):
    """Horizontal progress-indicator metadata (mirrors ``ProgressStepsDto``)."""

    type: Literal["ProgressSteps"] = "ProgressSteps"
    steps: list[StepRecord] = Field(default_factory=list)


class StatMetadata(Wire):
    """KPI stat metadata: value/unit, delta, trend and a sparkline (mirrors ``StatDto``)."""

    type: Literal["Stat"] = "Stat"
    label: str | None = None
    value: str | None = None
    unit: str | None = None
    delta: str | None = None
    trend: str | None = None
    spark: list[float] = Field(default_factory=list)
    action_id: str | None = None


class CalendarEventRecord(Wire):
    """One calendar event; ``date`` is ISO-8601; ``action_id`` makes the chip clickable."""

    id: str | None = None
    title: str | None = None
    date: str | None = None
    color: str | None = None
    action_id: str | None = None


class CalendarMetadata(Wire):
    """Month-grid calendar metadata (mirrors ``CalendarDto``); dates are ISO-8601."""

    type: Literal["Calendar"] = "Calendar"
    month: str | None = None
    events: list[CalendarEventRecord] = Field(default_factory=list)


class PricingPlanRecord(Wire):
    """One pricing plan; ``featured`` marks the recommended one (mirrors ``PricingPlanDto``)."""

    id: str | None = None
    name: str | None = None
    price: str | None = None
    period: str | None = None
    featured: bool = False
    features: list[str] = Field(default_factory=list)
    cta_label: str | None = None
    action_id: str | None = None


class PricingTableMetadata(Wire):
    """Pricing-table metadata: plan cards (mirrors ``PricingTableDto``)."""

    type: Literal["PricingTable"] = "PricingTable"
    plans: list[PricingPlanRecord] = Field(default_factory=list)


class OrgNodeRecord(Wire):
    """One org-chart node; ``children`` nest recursively (mirrors ``OrgNodeDto``)."""

    id: str | None = None
    title: str | None = None
    subtitle: str | None = None
    avatar: str | None = None
    color: str | None = None
    action_id: str | None = None
    children: list["OrgNodeRecord"] = Field(default_factory=list)


class OrgChartMetadata(Wire):
    """Org-chart metadata: a root node with recursive children (mirrors ``OrgChartDto``)."""

    type: Literal["OrgChart"] = "OrgChart"
    root: OrgNodeRecord | None = None


class HeatCellRecord(Wire):
    """One heatmap cell; ``date`` is ISO-8601; ``value`` drives color intensity."""

    date: str | None = None
    value: float = 0
    label: str | None = None


class HeatmapMetadata(Wire):
    """Calendar-heatmap metadata: one cell per day (mirrors ``HeatmapDto``)."""

    type: Literal["Heatmap"] = "Heatmap"
    cells: list[HeatCellRecord] = Field(default_factory=list)


class FunnelStageRecord(Wire):
    """One funnel stage (mirrors ``FunnelStageDto``)."""

    label: str | None = None
    value: float = 0
    color: str | None = None


class FunnelMetadata(Wire):
    """Conversion-funnel metadata: ordered stages (mirrors ``FunnelDto``)."""

    type: Literal["Funnel"] = "Funnel"
    stages: list[FunnelStageRecord] = Field(default_factory=list)


class TrendChartMetadata(Wire):
    """Lightweight line/area-chart metadata: a single series (mirrors ``TrendChartDto``)."""

    type: Literal["TrendChart"] = "TrendChart"
    title: str | None = None
    values: list[float] = Field(default_factory=list)
    labels: list[str] = Field(default_factory=list)
    color: str | None = None
    area: bool = False


class FeatureRecord(Wire):
    """One feature card (mirrors ``FeatureDto``)."""

    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None


class FeatureGridMetadata(Wire):
    """Feature-grid metadata: cards of icon + title + description (mirrors ``FeatureGridDto``)."""

    type: Literal["FeatureGrid"] = "FeatureGrid"
    features: list[FeatureRecord] = Field(default_factory=list)
    columns: int = 0


class TestimonialRecord(Wire):
    """One testimonial card; ``rating`` is 0–5 stars (mirrors ``TestimonialDto``)."""

    quote: str | None = None
    author: str | None = None
    role: str | None = None
    avatar: str | None = None
    rating: int = 0


class TestimonialsMetadata(Wire):
    """Testimonials metadata: quote cards (mirrors ``TestimonialsDto``)."""

    type: Literal["Testimonials"] = "Testimonials"
    items: list[TestimonialRecord] = Field(default_factory=list)


class FaqItemRecord(Wire):
    """One FAQ row; ``open`` makes it start expanded (mirrors ``FaqItemDto``)."""

    question: str | None = None
    answer: str | None = None
    open: bool = False


class FaqMetadata(Wire):
    """FAQ metadata: collapsible question/answer rows (mirrors ``FaqDto``)."""

    type: Literal["Faq"] = "Faq"
    items: list[FaqItemRecord] = Field(default_factory=list)


class CalloutCardMetadata(Wire):
    """Callout-card metadata: a themed call-to-action block (mirrors ``CalloutCardDto``)."""

    type: Literal["CalloutCard"] = "CalloutCard"
    title: str | None = None
    description: str | None = None
    icon: str | None = None
    cta_label: str | None = None
    action_id: str | None = None
    theme: str | None = None


class CommentRecord(Wire):
    """One comment; ``replies`` nest recursively (mirrors ``CommentDto``)."""

    id: str | None = None
    author: str | None = None
    avatar: str | None = None
    text: str | None = None
    timestamp: str | None = None
    replies: list["CommentRecord"] = Field(default_factory=list)


class CommentThreadMetadata(Wire):
    """Comment-thread metadata: comments with recursive replies (mirrors ``CommentThreadDto``)."""

    type: Literal["CommentThread"] = "CommentThread"
    comments: list[CommentRecord] = Field(default_factory=list)


class FileItemRecord(Wire):
    """One file entry (mirrors ``FileItemDto``)."""

    name: str | None = None
    size: str | None = None
    type: str | None = None
    url: str | None = None
    action_id: str | None = None


class FileListMetadata(Wire):
    """File-list metadata: attached files (mirrors ``FileListDto``)."""

    type: Literal["FileList"] = "FileList"
    files: list[FileItemRecord] = Field(default_factory=list)


class ChecklistItemRecord(Wire):
    """One checklist item (mirrors ``ChecklistItemDto``)."""

    id: str | None = None
    label: str | None = None
    done: bool = False
    action_id: str | None = None


class ChecklistMetadata(Wire):
    """Checklist metadata with a progress bar (mirrors ``ChecklistDto``)."""

    type: Literal["Checklist"] = "Checklist"
    title: str | None = None
    items: list[ChecklistItemRecord] = Field(default_factory=list)


class ComparisonCardMetadata(Wire):
    """Two-value comparison metadata (mirrors ``ComparisonCardDto``)."""

    type: Literal["ComparisonCard"] = "ComparisonCard"
    title: str | None = None
    left_label: str | None = None
    left_value: str | None = None
    right_label: str | None = None
    right_value: str | None = None
    delta: str | None = None
    trend: str | None = None


class DrawerMetadata(Wire):
    """A drawer overlay (mirrors ``io.mateu.dtos.DrawerDto``): a panel sliding in from a viewport
    edge whose content travels in the ``content`` field. Emitted as an Add fragment so it stacks
    on the page instead of replacing it."""

    type: Literal["Drawer"] = "Drawer"
    id: str | None = None
    header_title: str | None = None
    header: "Component | None" = None
    content: "Component | None" = None
    footer: "Component | None" = None
    #: start|end (the viewport edge the drawer slides from).
    position: str = "end"
    width: str | None = None
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


ComponentMetadata = Annotated[
    Union[
        AppMetadata,
        PageMetadata,
        CardMetadata,
        DivMetadata,
        VerticalLayoutMetadata,
        HorizontalLayoutMetadata,
        FormLayoutMetadata,
        FormRowMetadata,
        FormSectionMetadata,
        FormFieldMetadata,
        CrudMetadata,
        ProgressBarMetadata,
        TextMetadata,
        ButtonMetadata,
        TabLayoutMetadata,
        TabMetadata,
        AccordionLayoutMetadata,
        AccordionPanelMetadata,
        MetricCardMetadata,
        ScoreboardMetadata,
        DashboardPanelMetadata,
        DashboardLayoutMetadata,
        FoldoutLayoutMetadata,
        HeroSectionMetadata,
        EmptyStateMetadata,
        SkeletonMetadata,
        GanttMetadata,
        KanbanMetadata,
        TimelineMetadata,
        ProgressStepsMetadata,
        StatMetadata,
        CalendarMetadata,
        PricingTableMetadata,
        OrgChartMetadata,
        HeatmapMetadata,
        FunnelMetadata,
        TrendChartMetadata,
        FeatureGridMetadata,
        TestimonialsMetadata,
        FaqMetadata,
        CalloutCardMetadata,
        CommentThreadMetadata,
        FileListMetadata,
        ChecklistMetadata,
        ComparisonCardMetadata,
        DrawerMetadata,
        DialogMetadata,
        MicroFrontendMetadata,
    ],
    Field(discriminator="type"),
]


# ── Component tree (discriminated on "type") ───────────────────────────────────
class ClientSideComponent(Wire):
    type: Literal["ClientSide"] = "ClientSide"
    metadata: ComponentMetadata
    id: str | None = None
    children: list["Component"] = Field(default_factory=list)
    style: str | None = None
    css_classes: str | None = None
    slot: str | None = None


class ServerSideComponent(Wire):
    type: Literal["ServerSide"] = "ServerSide"
    id: str
    server_side_type: str
    route: str
    children: list["Component"] = Field(default_factory=list)
    initial_data: Any = Field(default_factory=dict)
    actions: list["Action"] = Field(default_factory=list)
    triggers: list[Any] = Field(default_factory=list)
    style: str | None = None
    css_classes: str | None = None
    slot: str | None = None
    emits_name: str | None = None
    confirm_on_navigation_if_dirty: bool = False
    #: Client-side rules (Hidden()/Disabled() fields, RuleSupplier): the renderer's no-eval
    #: engine re-evaluates them on every state change.
    rules: list["RuleRecord"] = Field(default_factory=list)


class RuleRecord(Wire):
    """A client-side rule (mirrors ``io.mateu.dtos.RuleDto``): while ``filter`` is truthy the
    renderer applies ``action`` — most commonly SetDataValue of ``field_attribute`` (hidden,
    disabled, required…) to the value of ``expression``, both evaluated against the live state."""

    filter: str
    action: str
    field_name: str | None = None
    field_attribute: str | None = None
    value: Any | None = None
    expression: str | None = None
    result: str = "Continue"
    action_id: str | None = None


Component = Annotated[
    Union[ClientSideComponent, ServerSideComponent], Field(discriminator="type")
]


# ── Flat helper records (not part of the polymorphic unions) ────────────────────
class Button(Wire):
    label: str
    action_id: str
    type: str = "Button"
    disabled: bool = False
    button_style: str | None = None
    shortcut: str | None = None


class Option(Wire):
    value: str
    label: str
    # sub-options of a hierarchical option set (tree selects); empty on flat lists
    children: list["Option"] = Field(default_factory=list)


class GridColumnMeta(Wire):
    id: str
    label: str
    type: str = "GridColumn"
    #: The column's value type (string|integer|number|boolean|date|money) — drives the renderer's
    #: cell formatting. None on legacy crud columns.
    data_type: str | None = None
    stereotype: str | None = None
    # Inline editing (class-level @inline_editing on the crud): the cell renders an in-place
    # editor (select|boolean|integer|number|date|datetime|text) and each commit dispatches the
    # crud's update-row action. editor_options carries a select editor's enum constants.
    editable: bool = False
    editor_type: str | None = None
    editor_options: list[Option] | None = None


class GridColumn(Wire):
    metadata: GridColumnMeta


class MenuItem(Wire):
    label: str
    route: str
    server_side_type: str
    consumed_route: str = ""
    action_id: str | None = None
    separator: bool = False
    visible: bool = True
    submenus: list["MenuItem"] = Field(default_factory=list)
    #: Federated entry (@remote_menu): the frontend fetches the remote backend's menu from
    #: base_url and mounts its views under this option.
    remote: bool = False
    base_url: str | None = None
    #: Inline the remote entries at this level instead of nesting under label.
    explode: bool = False


class Kpi(Wire):
    title: str
    value: str
    icon: str | None = None
    color: str | None = None


class Fab(Wire):
    icon: str
    action_id: str
    label: str | None = None
    order: int = 0


class Banner(Wire):
    theme: str
    title: str | None = None
    description: str | None = None
    has_icon: bool = True
    has_close_button: bool = False
    timeout_seconds: int = 0


class Badge(Wire):
    text: str
    color: str
    primary: bool = False
    small: bool = False
    pill: bool = True


class Action(Wire):
    id: str
    validation_required: bool = True


class Trigger(Wire):
    type: str
    action_id: str


class CustomTrigger(Wire):
    event: str
    action_id: str
    type: str = "OnCustomEvent"


# ── Top-level envelope ─────────────────────────────────────────────────────────
class UICommand(Wire):
    target_component_id: str
    type: str
    data: Any | None = None

    @staticmethod
    def close_modal(event_name: str | None = None, detail: Any | None = None) -> "UICommand":
        """Closes the topmost open overlay (dialog or drawer). With ``event_name`` it also emits
        that event (carrying ``detail``) through the custom-event bus so the host page can react —
        refresh itself or receive the overlay's result (mirrors Java's UICommand.closeModal)."""
        data = None if event_name is None else CustomEventRecord(event_name=event_name, detail=detail)
        return UICommand(target_component_id="ux_main", type="CloseModal", data=data)

    @staticmethod
    def dispatch_event(event_name: str, detail: Any | None = None) -> "UICommand":
        """Emits a named custom event from the current component (mirrors Java's
        UICommand.dispatchEvent) — @subscribe_to counterparts react to it."""
        return UICommand(
            target_component_id="ux_main",
            type="DispatchEvent",
            data=CustomEventRecord(event_name=event_name, detail=detail),
        )


class CustomEventRecord(Wire):
    """A named custom event riding on a CloseModal/DispatchEvent command (mirrors
    ``io.mateu.uidl.fluent.CustomEvent``)."""

    event_name: str
    detail: Any | None = None


class Message(Wire):
    variant: str
    position: str
    title: str
    text: str
    duration: int


class UIFragment(Wire):
    target_component_id: str
    component: Component | None = None
    state: Any | None = None
    data: Any | None = None
    action: str
    container_id: str | None = None


class UIIncrement(Wire):
    commands: list[UICommand] = Field(default_factory=list)
    messages: list[Message] = Field(default_factory=list)
    fragments: list[UIFragment] = Field(default_factory=list)
    banners: list[Any] = Field(default_factory=list)
    append_banners: bool = False
    app_data: Any | None = None
    app_state: Any | None = None

    @staticmethod
    def of(commands=None, messages=None, fragments=None, banners=None, append_banners=False) -> "UIIncrement":
        return UIIncrement(
            commands=commands or [],
            messages=messages or [],
            fragments=fragments or [],
            banners=banners or [],
            append_banners=append_banners,
        )


# Resolve the forward references / recursive models.
for _m in (
    AppMetadata,
    PageMetadata,
    CardMetadata,
    ClientSideComponent,
    ServerSideComponent,
    UIFragment,
):
    _m.model_rebuild()
