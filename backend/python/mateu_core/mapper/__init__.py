"""Turns an annotated Python view instance into the Mateu component tree (App->Page->Card->...->FormField).
The Python port of C#'s ReflectionMapper.
"""

from __future__ import annotations

from ._common import (  # noqa: F401 - the public import path of every helper
    AccordionLayoutMetadata,
    AccordionPanelMetadata,
    Action,
    ActionPanelCategoryRecord,
    ActionPanelItemRecord,
    ActionPanelMetadata,
    AddOnPickerMetadata,
    AddOnRecord,
    Aggregate,
    AnchorMetadata,
    Any,
    AppActionsSupplier,
    AppContextSelector,
    AppHeaderAction,
    AppMetadata,
    AppSupplier,
    Aside,
    Audience,
    Badge,
    Banner,
    BulletedList,
    BulletedListMetadata,
    Button,
    ButtonMetadata,
    COMPACT_STYLE,
    CalendarDayRecord,
    CalendarEventRecord,
    CalendarMetadata,
    CalloutCardMetadata,
    CardMetadata,
    ChecklistItemRecord,
    ChecklistMetadata,
    ChipRecord,
    ClientSideComponent,
    CommentRecord,
    CommentThreadMetadata,
    ComparisonCardMetadata,
    ComponentTreeSupplier,
    ContentLayoutMetadata,
    ContextVar,
    Creatable,
    Crud,
    CrudMetadata,
    CustomComponentMetadata,
    CustomTrigger,
    Dashboard,
    DashboardLayoutMetadata,
    DashboardPanelMetadata,
    DateRange,
    Decimal,
    Deletable,
    DialogMetadata,
    Disabled,
    DisabledUnless,
    DivMetadata,
    DrawerMetadata,
    DropZoneMetadata,
    Editable,
    EmptyStateMetadata,
    EntityHeaderMetadata,
    Enum,
    EyesOnly,
    Fab,
    FactRecord,
    FaqItemRecord,
    FaqMetadata,
    FeatureGridMetadata,
    FeatureRecord,
    FileItemRecord,
    FileListMetadata,
    FileUpload,
    Filterable,
    Foldout,
    FoldoutLayoutMetadata,
    FoldoutNavigationWire,
    FoldoutPanelInfo,
    FormFieldMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    FunnelMetadata,
    FunnelStageRecord,
    GanttMetadata,
    GanttTaskRecord,
    GlobalSearchSupplier,
    GridColumn,
    GridColumnMeta,
    GroupBy,
    HeaderBadge,
    HeatCellRecord,
    HeatmapMetadata,
    HeroSearch,
    HeroSectionMetadata,
    Hidden,
    HorizontalLayoutMetadata,
    InlineEditing,
    ItemOverview,
    KanbanCardRecord,
    KanbanColumnRecord,
    KanbanMetadata,
    Kpi,
    KpiMarker,
    Label,
    LedgerLineRecord,
    LedgerMetadata,
    LinkSupplier,
    LinkTo,
    Listing,
    Lookup,
    MapMarkerRecord,
    MapMetadata,
    MatrixCellRecord,
    MatrixColumnRecord,
    MatrixGridMetadata,
    MatrixRowRecord,
    MatrixSectionRecord,
    MenuItem,
    MenuSupplier,
    MeterMetadata,
    MetricCardMetadata,
    MicroFrontendMetadata,
    Money,
    Multiline,
    NavLinkRecord,
    Navigable,
    NoticeMetadata,
    NotificationsSupplier,
    NumberRange,
    OfferCardMetadata,
    OnRowSelected,
    Option,
    OrgChartMetadata,
    OrgNodeRecord,
    PageMetadata,
    PairRecord,
    Panel,
    Password,
    PaymentMethodRecord,
    PaymentPickerMetadata,
    PeerNav,
    PeerNavigationSupplier,
    PhotoCapture,
    PlainText,
    PlanningBlockRecord,
    PlanningBoardMetadata,
    PlanningResourceRecord,
    PopoverMetadata,
    PricingPlanRecord,
    PricingTableMetadata,
    PrimaryColumn,
    ProcessItemRecord,
    ProcessMonitorMetadata,
    ProgressBarMetadata,
    ProgressStepsMetadata,
    QueueGroupRecord,
    QueueItemRecord,
    RangeFilter,
    ReadOnly,
    ReadOnlyUnless,
    RemoteCoordinates,
    Required,
    ResourceGridMetadata,
    ResourceItemRecord,
    ResponsiveGridMetadata,
    RestAction,
    RestDataSource,
    RestOptions,
    RowStatus,
    Rule,
    RuleRecord,
    RuleSupplier,
    ScoreboardMetadata,
    Searchable,
    Section,
    Selector,
    SeparatorBefore,
    SeparatorMetadata,
    ServerSideComponent,
    Signature,
    SkeletonMetadata,
    SmartSearchPage,
    StatMetadata,
    StatusItemRecord,
    StatusListMetadata,
    Step,
    StepRecord,
    Stereotype,
    Tab,
    TabLayoutMetadata,
    TabMetadata,
    TaskProgressMetadata,
    TaskQueueMetadata,
    TestimonialRecord,
    TestimonialsMetadata,
    TextMetadata,
    TimelineItemRecord,
    TimelineMetadata,
    Timestamp,
    Tooltip,
    Translator,
    TreeSelect,
    TrendChartMetadata,
    Trigger,
    TypeVar,
    UseRadioButtons,
    VerticalLayoutMetadata,
    Welcome,
    _current_audience,
    _generic_class,
    _id,
    _log,
    _resolved_generic_args,
    _row_cell,
    camel_case,
    capabilities,
    capability_class,
    class_flag,
    crud_element_type,
    dataclasses,
    date,
    datetime,
    enum_label,
    enum_set_element_type,
    filterable_filters_type,
    fluent,
    for_current_audience,
    format_value,
    get_args,
    get_origin,
    get_type_hints,
    humanize,
    humanize_constant,
    is_enum,
    labels_aside_inference,
    layout_inference,
    listing_row_type,
    listing_types,
    logging,
    methods_with,
    normalize,
    page_inference,
    page_type_of,
    resolve_action,
    set_current_audience,
    type_name,
    uuid,
    view_fields,
    with_action_options,
)
from ._base import MixinBase
from .app import AppMapperMixin
from .view import ViewMapperMixin
from .archetypes import ArchetypeMapperMixin
from .components import ComponentMapperMixin
from .decorations import DecorationMapperMixin
from .wizard import WizardMapperMixin
from .crud import CrudMapperMixin
from .layout import LayoutMapperMixin
from .fields import FieldMapperMixin


class ReflectionMapper(
    AppMapperMixin,
    ViewMapperMixin,
    ArchetypeMapperMixin,
    ComponentMapperMixin,
    DecorationMapperMixin,
    WizardMapperMixin,
    CrudMapperMixin,
    LayoutMapperMixin,
    FieldMapperMixin,
    MixinBase,
):
    def __init__(
        self, translator: Translator | None = None, identity_provider=None, rest_sources=None, components=None
    ):
        self.translator = translator
        self.identity_provider = identity_provider
        #: The app's REST source catalogue (a RestSourceRegistry); None = no catalogue.
        self.rest_sources = rest_sources
        #: The app's business-component catalogue (a ComponentRegistry); None = none.
        self.components = components
        #: model type → ComponentAdapter (set by the SyncHandler from the registry).
        self.adapters: dict = {}

    def _locale(self) -> str | None:
        """The UI language the translator declares, or None (the browser decides)."""
        locale = getattr(self.translator, "locale", None) if self.translator else None
        try:
            return locale() if callable(locale) else None
        except Exception:  # noqa: BLE001 - no locale is a valid answer
            return None

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
        # Timestamp() fields render as the header "last updated" text, never as form fields.
        if f.has(Timestamp):
            return False
        # kpi() fields are hoisted into the page header (page.metadata.kpis), never form fields.
        if f.has(KpiMarker):
            return False
        # Aside() fields render in the ContentLayout aside slot, not the form body.
        if f.has(Aside):
            return False
        return self._permitted(f)

    def _permitted(self, f) -> bool:
        """Whether a field is permitted for the current caller/audience — the SECURITY gate only
        (EyesOnly + Audience). A field that fails this must never reach the wire, not even in
        initialData/state; the header-hoist exclusions (KPI/Timestamp/Aside) are separate."""
        return self.authorized(f.marker(EyesOnly)) and for_current_audience(f.marker(Audience))

    def T(self, s: str) -> str:
        return self.translator.translate(s) if self.translator else s

    def _opt_t(self, s: str | None) -> str | None:
        return None if s is None else self.T(s)
