"""The Mateu wire model in Pydantic — a 1:1 mirror of ``io.mateu.dtos`` (and of the C# ``Mateu.Dtos``).

Serialized to the exact same JSON the renderers consume: camelCase property names, nulls kept,
polymorphic ``type`` discriminators on the component tree and the metadata tree.
"""

from __future__ import annotations

from .base import (  # noqa: F401
    WIRE_VERSION,
    Wire,
)
from .app import (  # noqa: F401
    AppContextSelector,
    AppHeaderAction,
    AppMetadata,
)
from .layout import (  # noqa: F401
    CardMetadata,
    DivMetadata,
    FormLayoutMetadata,
    FormMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    HorizontalLayoutMetadata,
    PageMetadata,
    VerticalLayoutMetadata,
)
from .fields import (  # noqa: F401
    CrudMetadata,
    FormFieldMetadata,
    NavLinkRecord,
    PairRecord,
    RemoteCoordinates,
    RestDataSource,
)
from .basic import (  # noqa: F401
    AccordionLayoutMetadata,
    AccordionPanelMetadata,
    AnchorMetadata,
    ButtonMetadata,
    CustomComponentMetadata,
    NoticeMetadata,
    ProgressBarMetadata,
    SeparatorMetadata,
    TabLayoutMetadata,
    TabMetadata,
    TextMetadata,
)
from .dashboard import (  # noqa: F401
    ContentLayoutMetadata,
    DashboardLayoutMetadata,
    DashboardPanelMetadata,
    EmptyStateMetadata,
    FoldoutLayoutMetadata,
    FoldoutNavigation,
    FoldoutPanelInfo,
    GanttMetadata,
    GanttTaskRecord,
    HeroSectionMetadata,
    MetricCardMetadata,
    PlanningBlockRecord,
    PlanningBoardMetadata,
    PlanningResourceRecord,
    ResponsiveGridMetadata,
    ScoreboardMetadata,
    SkeletonMetadata,
)
from .ux import (  # noqa: F401
    CalendarDayRecord,
    CalendarEventRecord,
    CalendarMetadata,
    CalloutCardMetadata,
    ChecklistItemRecord,
    ChecklistMetadata,
    CommentRecord,
    CommentThreadMetadata,
    ComparisonCardMetadata,
    FaqItemRecord,
    FaqMetadata,
    FeatureGridMetadata,
    FeatureRecord,
    FileItemRecord,
    FileListMetadata,
    FunnelMetadata,
    FunnelStageRecord,
    HeatCellRecord,
    HeatmapMetadata,
    KanbanCardRecord,
    KanbanColumnRecord,
    KanbanMetadata,
    OrgChartMetadata,
    OrgNodeRecord,
    PricingPlanRecord,
    PricingTableMetadata,
    ProgressStepsMetadata,
    StatMetadata,
    StepRecord,
    TestimonialRecord,
    TestimonialsMetadata,
    TimelineItemRecord,
    TimelineMetadata,
    TrendChartMetadata,
)
from .front_office import (  # noqa: F401
    ActionPanelCategoryRecord,
    ActionPanelItemRecord,
    ActionPanelMetadata,
    AddOnPickerMetadata,
    AddOnRecord,
    BulletedListMetadata,
    ChipRecord,
    DropZoneMetadata,
    EntityHeaderMetadata,
    FactRecord,
    LedgerLineRecord,
    LedgerMetadata,
    MapMarkerRecord,
    MapMetadata,
    MatrixCellRecord,
    MatrixColumnRecord,
    MatrixGridMetadata,
    MatrixRowRecord,
    MatrixSectionRecord,
    MeterMetadata,
    OfferCardMetadata,
    PaymentMethodRecord,
    PaymentPickerMetadata,
    ProcessItemRecord,
    ProcessMonitorMetadata,
    QueueGroupRecord,
    QueueItemRecord,
    ResourceGridMetadata,
    ResourceItemRecord,
    StatusItemRecord,
    StatusListMetadata,
    TaskProgressMetadata,
    TaskQueueMetadata,
)
from .overlays import (  # noqa: F401
    DialogMetadata,
    DrawerMetadata,
    MicroFrontendMetadata,
    PopoverMetadata,
)
from .components import (  # noqa: F401
    ClientSideComponent,
    Component,
    ComponentMetadata,
    RuleRecord,
    ServerSideComponent,
    ValidationRecord,
)
from .records import (  # noqa: F401
    Action,
    Badge,
    Banner,
    Button,
    CustomTrigger,
    Fab,
    GridColumn,
    GridColumnMeta,
    Kpi,
    MenuItem,
    Option,
    PeerNav,
    RestAction,
    Trigger,
)
from .envelope import (  # noqa: F401
    CustomEventRecord,
    Message,
    UICommand,
    UIFragment,
    UIIncrement,
)


def _rebuild_all() -> None:
    """Resolve the forward references across modules.

    The wire model is split by concern, and its models reference each other in both directions
    (an App's menu holds MenuItems, a component's children hold Components). Each model is built in
    its own module, where a reference to a LATER module cannot resolve yet; rebuilding every model
    against the package's full namespace — once everything is imported — completes them all.
    """
    from pydantic import BaseModel

    namespace = dict(globals())
    for value in list(namespace.values()):
        if (
            isinstance(value, type)
            and issubclass(value, BaseModel)
            and value.__module__.startswith(__name__ + ".")
        ):
            value.model_rebuild(force=True, _types_namespace=namespace)


_rebuild_all()
