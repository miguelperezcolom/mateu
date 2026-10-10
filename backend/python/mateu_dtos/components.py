"""The polymorphic component tree: the metadata union, client/server-side components and rules."""

from __future__ import annotations

from typing import (
    Annotated,
    Any,
    Literal,
    TYPE_CHECKING,
    Union,
)

from pydantic import Field

from .app import AppMetadata
from .base import Wire
from .basic import (
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
from .dashboard import (
    ContentLayoutMetadata,
    DashboardLayoutMetadata,
    DashboardPanelMetadata,
    EmptyStateMetadata,
    FoldoutLayoutMetadata,
    GanttMetadata,
    HeroSectionMetadata,
    MetricCardMetadata,
    PlanningBoardMetadata,
    ResponsiveGridMetadata,
    ScoreboardMetadata,
    SkeletonMetadata,
)
from .fields import (
    CrudMetadata,
    FormFieldMetadata,
)
from .front_office import (
    ActionPanelMetadata,
    AddOnPickerMetadata,
    BulletedListMetadata,
    DropZoneMetadata,
    EntityHeaderMetadata,
    LedgerMetadata,
    MapMetadata,
    MatrixGridMetadata,
    MeterMetadata,
    OfferCardMetadata,
    PaymentPickerMetadata,
    ProcessMonitorMetadata,
    ResourceGridMetadata,
    StatusListMetadata,
    TaskProgressMetadata,
    TaskQueueMetadata,
)
from .layout import (
    CardMetadata,
    DivMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    HorizontalLayoutMetadata,
    PageMetadata,
    VerticalLayoutMetadata,
)
from .overlays import (
    DialogMetadata,
    DrawerMetadata,
    MicroFrontendMetadata,
    PopoverMetadata,
)
from .ux import (
    CalendarMetadata,
    CalloutCardMetadata,
    ChecklistMetadata,
    CommentThreadMetadata,
    ComparisonCardMetadata,
    FaqMetadata,
    FeatureGridMetadata,
    FileListMetadata,
    FunnelMetadata,
    HeatmapMetadata,
    KanbanMetadata,
    OrgChartMetadata,
    PricingTableMetadata,
    ProgressStepsMetadata,
    StatMetadata,
    TestimonialsMetadata,
    TimelineMetadata,
    TrendChartMetadata,
)

if TYPE_CHECKING:
    from .records import Action


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
        ResponsiveGridMetadata,
        FoldoutLayoutMetadata,
        ContentLayoutMetadata,
        HeroSectionMetadata,
        EmptyStateMetadata,
        SkeletonMetadata,
        GanttMetadata,
        PlanningBoardMetadata,
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
        EntityHeaderMetadata,
        MeterMetadata,
        TaskProgressMetadata,
        StatusListMetadata,
        BulletedListMetadata,
        ActionPanelMetadata,
        MatrixGridMetadata,
        MapMetadata,
        DropZoneMetadata,
        SeparatorMetadata,
        CustomComponentMetadata,
        AnchorMetadata,
        NoticeMetadata,
        TaskQueueMetadata,
        ResourceGridMetadata,
        OfferCardMetadata,
        AddOnPickerMetadata,
        LedgerMetadata,
        PaymentPickerMetadata,
        ProcessMonitorMetadata,
        DrawerMetadata,
        PopoverMetadata,
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
    #: The sizing intent (coherence-plan #8): "hug" | "fill" | "fixed:<len>". None = unset (default
    #: flow). Portable intent-as-data; the web maps it to flex on the component host.
    sizing: str | None = None


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
    #: Redwood page width ("fixed"|"fullWidth"|"edgeToEdge") declared on the view; None = the
    #: renderer infers it from the page content (mirrors ServerSideComponentDto.pageWidth).
    page_width: str | None = None
    #: The coarse page type ("landing"|"collection"|"detail"|"form"|"process"|"dashboard") —
    #: the family of Redwood page templates the view belongs to; never None on the wire
    #: (mirrors ServerSideComponentDto.pageType).
    page_type: str | None = None
    #: The view is declared @static_view: its full response never varies, so the client caches it
    #: for the session and skips the round-trip on return visits (mirrors
    #: ServerSideComponentDto.staticView). A developer promise; False unless declared.
    static_view: bool = False
    #: Stable content hash (ETag) of this component's structure (phase b of the client structure
    #: cache). The client stores it next to the cached structure and echoes it back as
    #: RunActionRq.known_structure_hash; when it still matches, the server omits the component and
    #: the client reuses its cache (mirrors ServerSideComponentDto.structureHash).
    structure_hash: str | None = None


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
