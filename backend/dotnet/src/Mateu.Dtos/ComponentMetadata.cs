using System.Text.Json.Serialization;

namespace Mateu.Dtos;

// ── Component metadata (discriminated on "type") ───────────────────────────────
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AppMetadataDto), "App")]
[JsonDerivedType(typeof(PageMetadataDto), "Page")]
[JsonDerivedType(typeof(CardMetadataDto), "Card")]
[JsonDerivedType(typeof(DivMetadataDto), "Div")]
[JsonDerivedType(typeof(VerticalLayoutMetadataDto), "VerticalLayout")]
[JsonDerivedType(typeof(FormLayoutMetadataDto), "FormLayout")]
[JsonDerivedType(typeof(FormRowMetadataDto), "FormRow")]
[JsonDerivedType(typeof(FormFieldMetadataDto), "FormField")]
[JsonDerivedType(typeof(FormSectionMetadataDto), "FormSection")]
[JsonDerivedType(typeof(CrudMetadataDto), "Crud")]
[JsonDerivedType(typeof(HorizontalLayoutMetadataDto), "HorizontalLayout")]
[JsonDerivedType(typeof(ProgressBarMetadataDto), "ProgressBar")]
[JsonDerivedType(typeof(TextMetadataDto), "Text")]
[JsonDerivedType(typeof(ButtonMetadataDto), "Button")]
[JsonDerivedType(typeof(TabLayoutMetadataDto), "TabLayout")]
[JsonDerivedType(typeof(TabMetadataDto), "Tab")]
[JsonDerivedType(typeof(AccordionLayoutMetadataDto), "AccordionLayout")]
[JsonDerivedType(typeof(AccordionPanelMetadataDto), "AccordionPanel")]
[JsonDerivedType(typeof(MetricCardMetadataDto), "MetricCard")]
[JsonDerivedType(typeof(ScoreboardMetadataDto), "Scoreboard")]
[JsonDerivedType(typeof(DashboardPanelMetadataDto), "DashboardPanel")]
[JsonDerivedType(typeof(DashboardLayoutMetadataDto), "DashboardLayout")]
[JsonDerivedType(typeof(ResponsiveGridMetadataDto), "ResponsiveGrid")]
[JsonDerivedType(typeof(FoldoutLayoutMetadataDto), "FoldoutLayout")]
[JsonDerivedType(typeof(ContentLayoutMetadataDto), "ContentLayout")]
[JsonDerivedType(typeof(HeroSectionMetadataDto), "HeroSection")]
[JsonDerivedType(typeof(EmptyStateMetadataDto), "EmptyState")]
[JsonDerivedType(typeof(SkeletonMetadataDto), "Skeleton")]
[JsonDerivedType(typeof(GanttMetadataDto), "Gantt")]
[JsonDerivedType(typeof(PlanningBoardMetadataDto), "PlanningBoard")]
[JsonDerivedType(typeof(KanbanMetadataDto), "Kanban")]
[JsonDerivedType(typeof(TimelineMetadataDto), "Timeline")]
[JsonDerivedType(typeof(ProgressStepsMetadataDto), "ProgressSteps")]
[JsonDerivedType(typeof(StatMetadataDto), "Stat")]
[JsonDerivedType(typeof(CalendarMetadataDto), "Calendar")]
[JsonDerivedType(typeof(PricingTableMetadataDto), "PricingTable")]
[JsonDerivedType(typeof(OrgChartMetadataDto), "OrgChart")]
[JsonDerivedType(typeof(HeatmapMetadataDto), "Heatmap")]
[JsonDerivedType(typeof(FunnelMetadataDto), "Funnel")]
[JsonDerivedType(typeof(TrendChartMetadataDto), "TrendChart")]
[JsonDerivedType(typeof(FeatureGridMetadataDto), "FeatureGrid")]
[JsonDerivedType(typeof(TestimonialsMetadataDto), "Testimonials")]
[JsonDerivedType(typeof(FaqMetadataDto), "Faq")]
[JsonDerivedType(typeof(CalloutCardMetadataDto), "CalloutCard")]
[JsonDerivedType(typeof(CommentThreadMetadataDto), "CommentThread")]
[JsonDerivedType(typeof(FileListMetadataDto), "FileList")]
[JsonDerivedType(typeof(ChecklistMetadataDto), "Checklist")]
[JsonDerivedType(typeof(ComparisonCardMetadataDto), "ComparisonCard")]
[JsonDerivedType(typeof(EntityHeaderMetadataDto), "EntityHeader")]
[JsonDerivedType(typeof(MeterMetadataDto), "Meter")]
[JsonDerivedType(typeof(TaskProgressMetadataDto), "TaskProgress")]
[JsonDerivedType(typeof(StatusListMetadataDto), "StatusList")]
[JsonDerivedType(typeof(BulletedListMetadataDto), "BulletedList")]
[JsonDerivedType(typeof(ActionPanelMetadataDto), "ActionPanel")]
[JsonDerivedType(typeof(MatrixGridMetadataDto), "MatrixGrid")]
[JsonDerivedType(typeof(MapMetadataDto), "Map")]
[JsonDerivedType(typeof(DropZoneMetadataDto), "DropZone")]
[JsonDerivedType(typeof(SeparatorMetadataDto), "Separator")]
[JsonDerivedType(typeof(CustomComponentMetadataDto), "CustomComponent")]
[JsonDerivedType(typeof(AnchorMetadataDto), "Anchor")]
[JsonDerivedType(typeof(NoticeMetadataDto), "Notice")]
[JsonDerivedType(typeof(TaskQueueMetadataDto), "TaskQueue")]
[JsonDerivedType(typeof(ResourceGridMetadataDto), "ResourceGrid")]
[JsonDerivedType(typeof(OfferCardMetadataDto), "OfferCard")]
[JsonDerivedType(typeof(AddOnPickerMetadataDto), "AddOnPicker")]
[JsonDerivedType(typeof(LedgerMetadataDto), "Ledger")]
[JsonDerivedType(typeof(PaymentPickerMetadataDto), "PaymentPicker")]
[JsonDerivedType(typeof(ProcessMonitorMetadataDto), "ProcessMonitor")]
[JsonDerivedType(typeof(DrawerMetadataDto), "Drawer")]
[JsonDerivedType(typeof(PopoverMetadataDto), "Popover")]
[JsonDerivedType(typeof(DialogMetadataDto), "Dialog")]
[JsonDerivedType(typeof(MicroFrontendMetadataDto), "MicroFrontend")]
[JsonDerivedType(typeof(CustomFieldMetadataDto), "CustomField")]
public abstract record ComponentMetadataDto;

// ── Dashboards, foldouts, heroes, empty states, skeletons, Gantt ───────────────
// 1:1 mirrors of the Java wire DTOs (io.mateu.dtos.MetricCardDto & friends).

/// <summary>KPI tile metadata for dashboards (mirrors MetricCardDto). Trend: up|down|neutral.</summary>
public record MetricCardMetadataDto(
    string? Title,
    string? Value,
    string? Unit,
    string? Trend,
    string? TrendLabel,
    string? Icon,
    string? Description,
    string? ActionId) : ComponentMetadataDto;

/// <summary>Horizontal band of metric cards. The MetricCards travel as component children.</summary>
public record ScoreboardMetadataDto : ComponentMetadataDto;

/// <summary>Titled dashboard tile. The wrapped component travels as the component's single child.</summary>
public record DashboardPanelMetadataDto(string? Title, string? Subtitle, int ColSpan, int RowSpan) : ComponentMetadataDto;

/// <summary>Responsive dashboard grid. Tiles travel as component children (columns 0 = auto-fit).</summary>
public record DashboardLayoutMetadataDto(int Columns) : ComponentMetadataDto;

/// <summary>One responsive grid — THE general layout foundation (coherence-plan #9). Carries the
/// resolved CSS grid-template-columns (from the tracks' hug/fixed/fill intent) and the gap; children
/// travel as the component's children.</summary>
public record ResponsiveGridMetadataDto(string? GridTemplateColumns, string? Gap, IReadOnlyList<int>? ColSpans = null, string? StackBelow = null, string? GridTemplateAreas = null, IReadOnlyList<string>? StickyAreas = null, bool Reorderable = false) : ComponentMetadataDto;

/// <summary>Redwood-style foldout layout. The overview travels as the child slotted "overview";
/// each panel's content as the child slotted "panel-N" matching the panels list order.</summary>
public record FoldoutLayoutMetadataDto(IReadOnlyList<FoldoutPanelInfoDto> Panels) : ComponentMetadataDto
{
    /// <summary>Big heading of the optional header band above the columns (RDS "overview title").</summary>
    public string? HeaderTitle { get; init; }

    /// <summary>Label/Value chips shown under the header title (flattened to text on the wire).</summary>
    public IReadOnlyList<string> Badges { get; init; } = [];

    /// <summary>Overview orientation: "vertical" (left) or "horizontal" (top).</summary>
    public string Orientation { get; init; } = "vertical";

    /// <summary>Navigation Header (prev/next + go-to-parent); null hides the bar.</summary>
    public FoldoutNavigationDto? Navigation { get; init; }

    /// <summary>ActionId dispatched by the overview's Edit affordance; null = no Edit button.</summary>
    public string? OverviewEditActionId { get; init; }
}

/// <summary>Redwood-style content page layout. The regions travel as slotted children: the primary
/// region as "main-N", the contextual secondary region as "aside-N", and the full-width footer as
/// "footer-N" (each matching the source list order).</summary>
public record ContentLayoutMetadataDto : ComponentMetadataDto
{
    /// <summary>Which side the aside sits on: "start" or "end".</summary>
    public string AsidePosition { get; init; } = "end";

    public string? AsideWidth { get; init; }

    public bool AsideSticky { get; init; }
}

/// <summary>Navigation Header of a foldout: prev/next between objects of the same type +
/// go-to-parent. A null/blank actionId hides the corresponding control.</summary>
public record FoldoutNavigationDto(
    string? Title, string? ParentLabel, string? ParentActionId,
    string? PreviousActionId, string? NextActionId);

/// <summary>Header info for one foldout panel; its content travels as a slotted component child.</summary>
public record FoldoutPanelInfoDto(string? Title, string? Subtitle, string? Icon, bool Open, string? Width = null);

/// <summary>Page hero header. Slotted content travels as component children.</summary>
public record HeroSectionMetadataDto(string? Title, string? Subtitle, string? Image, string? Height, bool Centered) : ComponentMetadataDto
{
    /// <summary>The band's tone: null (omitted) = default look; otherwise one of ocean, pine, lilac,
    /// teal, rose, pebble, slate, plum, sienna — a dark tinted band with light ink. (Mirrors
    /// io.mateu.dtos.HeroSectionDto.tone.)</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Tone { get; init; }
}

/// <summary>Friendly empty-state placeholder with an optional call-to-action.</summary>
public record EmptyStateMetadataDto(string? Icon, string? Title, string? Description, string? ActionId, string? ActionLabel) : ComponentMetadataDto;

/// <summary>Shimmering loading placeholder. Variant: text|card|grid|form.</summary>
public record SkeletonMetadataDto(string Variant, int Count) : ComponentMetadataDto;

/// <summary>Gantt/timeline chart metadata.</summary>
public record GanttMetadataDto(IReadOnlyList<GanttTaskDto> Tasks) : ComponentMetadataDto
{
    /// <summary>When set, clicking a bar dispatches this action with the clicked task id as
    /// _clickedTaskId. (Mirrors io.mateu.dtos.GanttDto.onTaskSelectionActionId.)</summary>
    public string? OnTaskSelectionActionId { get; init; }
}

/// <summary>One Gantt bar; start/end are ISO-8601 dates (yyyy-MM-dd).</summary>
public record GanttTaskDto(string? Id, string? Title, string? Start, string? End, double Progress, string? Color);

/// <summary>Planning board / tape chart metadata (mirrors PlanningBoardDto); from/to are ISO-8601
/// dates.</summary>
public record PlanningBoardMetadataDto(
    IReadOnlyList<PlanningResourceDto> Resources,
    IReadOnlyList<PlanningBlockDto> Blocks,
    string? From,
    string? To,
    string? MoveActionId,
    string? SelectActionId,
    IReadOnlyList<string>? AttributeColumns = null,
    string? ResizeActionId = null,
    string? OpenActionId = null,
    string? RangeSelectActionId = null) : ComponentMetadataDto;

/// <summary>One planning board row; group is an optional swimlane caption, attributes the values
/// of the board's attribute columns, icon an optional icon name before the label.</summary>
public record PlanningResourceDto(
    string? Id, string? Label, string? Group, IReadOnlyList<string>? Attributes = null, string? Icon = null);

/// <summary>One planning board block; start/end are ISO-8601 dates (inclusive); icon before the
/// label and summary = the hover text (lines separated by \n).</summary>
public record PlanningBlockDto(
    string? Id, string? ResourceId, string? Start, string? End, string? Label, string? Color, string? Status,
    string? Icon = null, string? Summary = null);

/// <summary>Kanban board metadata: columns of cards.</summary>
public record KanbanMetadataDto(IReadOnlyList<KanbanColumnDto> Columns) : ComponentMetadataDto;

/// <summary>One kanban column with its cards.</summary>
public record KanbanColumnDto(string? Id, string? Title, string? Color, IReadOnlyList<KanbanCardDto> Cards);

/// <summary>One kanban card; ActionId — when set — makes the card clickable.</summary>
public record KanbanCardDto(string? Id, string? Title, string? Description, string? Badge, string? Color, string? ActionId);

/// <summary>Timeline / activity-feed metadata: a list of entries.</summary>
public record TimelineMetadataDto(IReadOnlyList<TimelineItemDto> Items) : ComponentMetadataDto;

/// <summary>One timeline entry; ActionId — when set — makes it clickable.</summary>
public record TimelineItemDto(string? Id, string? Title, string? Description, string? Timestamp, string? Icon, string? Color, string? ActionId);

/// <summary>Progress-indicator metadata: numbered steps — a horizontal row by default, a stacked
/// column when Vertical (the wizard RAIL mode).</summary>
public record ProgressStepsMetadataDto(IReadOnlyList<StepDto> Steps, bool Vertical = false)
    : ComponentMetadataDto;

/// <summary>One progress step; Status is done|current|upcoming.</summary>
public record StepDto(string? Id, string? Title, string? Description, string? Status);

/// <summary>KPI stat metadata: value/unit, delta, trend (up|down|flat) and a sparkline.</summary>
public record StatMetadataDto(string? Label, string? Value, string? Unit, string? Delta, string? Trend, IReadOnlyList<double> Spark, string? ActionId) : ComponentMetadataDto;

/// <summary>Calendar metadata; Month (the anchor) and every date are ISO-8601 (yyyy-MM-dd). View is
/// month|week|day|list (default month), Views the switchable ones, Days the per-date cells and
/// DayActionId makes those cells clickable.</summary>
public record CalendarMetadataDto(string? Month, IReadOnlyList<CalendarEventDto> Events,
    string View, IReadOnlyList<string> Views, IReadOnlyList<CalendarDayDto> Days, string? DayActionId)
    : ComponentMetadataDto;

/// <summary>One calendar event; Date/EndDate are ISO-8601, Start/EndTime "HH:mm"; ActionId makes
/// the chip clickable.</summary>
public record CalendarEventDto(string? Id, string? Title, string? Date, string? EndDate,
    string? StartTime, string? EndTime, string? Color, string? ActionId);

/// <summary>One date's cell of a calendar: ISO date, a short label and a tone.</summary>
public record CalendarDayDto(string? Date, string? Label, string? Tone);

/// <summary>Pricing-table metadata: plan cards.</summary>
public record PricingTableMetadataDto(IReadOnlyList<PricingPlanDto> Plans) : ComponentMetadataDto;

/// <summary>One pricing plan; Featured marks the recommended one.</summary>
public record PricingPlanDto(string? Id, string? Name, string? Price, string? Period, bool Featured, IReadOnlyList<string> Features, string? CtaLabel, string? ActionId);

/// <summary>Org-chart metadata: a root node with recursive children.</summary>
public record OrgChartMetadataDto(OrgNodeDto? Root) : ComponentMetadataDto;

/// <summary>One org-chart node; Children nest recursively.</summary>
public record OrgNodeDto(string? Id, string? Title, string? Subtitle, string? Avatar, string? Color, string? ActionId, IReadOnlyList<OrgNodeDto> Children);

/// <summary>Calendar-heatmap metadata: one cell per day.</summary>
public record HeatmapMetadataDto(IReadOnlyList<HeatCellDto> Cells) : ComponentMetadataDto;

/// <summary>One heatmap cell; Date is ISO-8601; Value drives color intensity.</summary>
public record HeatCellDto(string? Date, double Value, string? Label);

/// <summary>Conversion-funnel metadata: ordered stages.</summary>
public record FunnelMetadataDto(IReadOnlyList<FunnelStageDto> Stages) : ComponentMetadataDto;

/// <summary>One funnel stage.</summary>
public record FunnelStageDto(string? Label, double Value, string? Color);

/// <summary>Lightweight line/area-chart metadata: a single series.</summary>
public record TrendChartMetadataDto(string? Title, IReadOnlyList<double> Values, IReadOnlyList<string> Labels, string? Color, bool Area) : ComponentMetadataDto;

/// <summary>Feature-grid metadata: cards of icon + title + description (Columns 0 = auto-fit).</summary>
public record FeatureGridMetadataDto(IReadOnlyList<FeatureDto> Features, int Columns) : ComponentMetadataDto;

/// <summary>One feature card.</summary>
public record FeatureDto(string? Icon, string? Title, string? Description, string? ActionId);

/// <summary>Testimonials metadata: quote cards.</summary>
public record TestimonialsMetadataDto(IReadOnlyList<TestimonialDto> Items) : ComponentMetadataDto;

/// <summary>One testimonial card; Rating is 0–5 stars.</summary>
public record TestimonialDto(string? Quote, string? Author, string? Role, string? Avatar, int Rating);

/// <summary>FAQ metadata: collapsible question/answer rows.</summary>
public record FaqMetadataDto(IReadOnlyList<FaqItemDto> Items) : ComponentMetadataDto;

/// <summary>One FAQ row; Open makes it start expanded.</summary>
public record FaqItemDto(string? Question, string? Answer, bool Open);

/// <summary>Callout-card metadata: a themed call-to-action block.</summary>
public record CalloutCardMetadataDto(string? Title, string? Description, string? Icon, string? CtaLabel, string? ActionId, string? Theme) : ComponentMetadataDto;

/// <summary>Comment-thread metadata: comments with recursive replies.</summary>
public record CommentThreadMetadataDto(IReadOnlyList<CommentDto> Comments) : ComponentMetadataDto;

/// <summary>One comment; Replies nest recursively.</summary>
public record CommentDto(string? Id, string? Author, string? Avatar, string? Text, string? Timestamp, IReadOnlyList<CommentDto> Replies);

/// <summary>File-list metadata: attached files.</summary>
public record FileListMetadataDto(IReadOnlyList<FileItemDto> Files) : ComponentMetadataDto;

/// <summary>One file entry.</summary>
public record FileItemDto(string? Name, string? Size, string? Type, string? Url, string? ActionId);

/// <summary>Checklist metadata with a progress bar.</summary>
public record ChecklistMetadataDto(string? Title, IReadOnlyList<ChecklistItemDto> Items) : ComponentMetadataDto;

/// <summary>One checklist item.</summary>
public record ChecklistItemDto(string? Id, string? Label, bool Done, string? ActionId);

/// <summary>Two-value comparison metadata (mirrors io.mateu.dtos.ComparisonCardDto).</summary>
public record ComparisonCardMetadataDto(string? Title, string? LeftLabel, string? LeftValue,
    string? RightLabel, string? RightValue, string? Delta, string? Trend) : ComponentMetadataDto;

// ── Front-office UX components (mirror io.mateu.dtos.EntityHeaderDto & friends) ─

/// <summary>A small status chip: label on a badge-palette color (normal|success|warning|error|contrast).</summary>
public record ChipDto(string? Label, string? Color);

/// <summary>One label-over-value pair of an entity header.</summary>
public record FactDto(string? Label, string? Value);

/// <summary>Entity-header metadata: identity + key facts + one highlighted metric.</summary>
public record EntityHeaderMetadataDto(
    string? Title,
    IReadOnlyList<ChipDto> Badges,
    string? Subtitle,
    IReadOnlyList<FactDto> Facts,
    string? MetricLabel,
    string? MetricValue,
    string? MetricCaption) : ComponentMetadataDto;

/// <summary>Meter metadata: consumption vs limit; WarnAt/DangerAt are optional fill-color
/// thresholds.</summary>
public record MeterMetadataDto(
    string? Label,
    double Value,
    double Max,
    string? Unit,
    string? Caption,
    double? WarnAt,
    double? DangerAt) : ComponentMetadataDto;

/// <summary>Task-progress metadata: Done/Total pills + an optional CTA.</summary>
public record TaskProgressMetadataDto(
    string? Label,
    int Total,
    int Done,
    string? ActionLabel,
    string? ActionId) : ComponentMetadataDto;

/// <summary>Status-list metadata: rows with status chip and/or action.</summary>
public record StatusListMetadataDto(
    IReadOnlyList<StatusItemDto> Items, bool Compact = false, bool Frameless = false,
    string? RowActionId = null)
    : ComponentMetadataDto;

public record BulletedListMetadataDto(IReadOnlyList<string> Items) : ComponentMetadataDto;

/// <summary>Categorised action panel ("I want to…"): categories in order, each with its actions.</summary>
public record ActionPanelMetadataDto(
    string Label,
    string? Shortcut,
    IReadOnlyList<ActionPanelCategoryDto> Categories,
    int MaxPerCategory,
    bool HideUnpopulatedToggle) : ComponentMetadataDto;

public record ActionPanelCategoryDto(string? Title, IReadOnlyList<ActionPanelItemDto> Actions);

public record ActionPanelItemDto(
    string? Label,
    string? ActionId,
    IReadOnlyDictionary<string, object?>? Parameters,
    int? Count,
    bool Populated,
    bool Disabled);

/// <summary>A drop target for dragged listing rows; its content travels as the component's
/// children (mirrors Java's DropZoneDto).</summary>
public record DropZoneMetadataDto(
    string? Accept,
    string? ActionId,
    IReadOnlyDictionary<string, object?> Parameters,
    string? Title,
    string? Subtitle) : ComponentMetadataDto;

/// <summary>Matrix grid: rows × columns in collapsible sections; every row carries exactly one cell
/// per column (mirrors Java's MatrixGridDto).</summary>
public record MatrixGridMetadataDto(
    string? RowHeaderLabel,
    IReadOnlyList<MatrixColumnDto> Columns,
    IReadOnlyList<MatrixSectionDto> Sections,
    string? CellActionId,
    string? EditActionId) : ComponentMetadataDto;

public record MatrixColumnDto(string? Id, string? Label, string? Group, string? Tone);

public record MatrixSectionDto(string Id, string? Title, bool Collapsed, IReadOnlyList<MatrixRowDto> Rows);

public record MatrixRowDto(string? Id, string? Label, IReadOnlyList<MatrixCellDto> Cells, bool Editable, bool Emphasis);

public record MatrixCellDto(string Value, string? Tone, bool Link);

/// <summary>Street map: centre ("lat, lon"), zoom, markers and the action a marker click runs
/// (with { _markerId }) — mirrors Java's MapDto.</summary>
public record MapMetadataDto(
    string? Position,
    string? Zoom,
    IReadOnlyList<MapMarkerDto> Markers,
    string? MarkerActionId,
    string? TileUrl = null,
    string? Attribution = null) : ComponentMetadataDto;

/// <summary>One point on a map (mirrors Java's MapMarkerDto).</summary>
public record MapMarkerDto(
    string? Id, double Latitude, double Longitude, string? Label, string? Description, string? Color);

/// <summary>One status-list row; the action dispatches ActionId with { _item: Id }.</summary>
public record StatusItemDto(
    string? Id,
    string? Icon,
    string? Avatar,
    string? Title,
    string? Description,
    string? Status,
    string? StatusColor,
    string? ActionLabel,
    string? ActionId);

/// <summary>Task-queue metadata: grouped work-queue cards; a card click dispatches the
/// component-level ActionId with { _item: id }.</summary>
public record TaskQueueMetadataDto(string? ActionId, IReadOnlyList<QueueGroupDto> Groups) : ComponentMetadataDto;

/// <summary>One labeled task-queue group.</summary>
public record QueueGroupDto(string? Label, IReadOnlyList<QueueItemDto> Items);

/// <summary>One task-queue card.</summary>
public record QueueItemDto(string? Id, string? Title, string? Caption, IReadOnlyList<ChipDto> Badges, bool Selected);

/// <summary>Resource-grid metadata: availability/selection grid (Columns 0 = auto-fill).</summary>
public record ResourceGridMetadataDto(
    string? ActionId,
    int Columns,
    string? RecommendedLabel,
    IReadOnlyList<ResourceItemDto> Items) : ComponentMetadataDto;

/// <summary>One resource-grid cell.</summary>
public record ResourceItemDto(
    string? Id,
    string? Title,
    string? Subtitle,
    string? StatusLabel,
    string? StatusColor,
    string? Note,
    string? NoteColor,
    bool Disabled,
    bool Recommended,
    bool Selected);

/// <summary>Offer-card metadata: current vs upgrade offer; Current shows CurrentLabel and no CTA.
/// Added flips the CTA to success green showing AddedLabel (toggle offers).</summary>
public record OfferCardMetadataDto(
    string? Tag,
    string? Title,
    string? Subtitle,
    string? Image,
    IReadOnlyList<string> Features,
    string? PriceLabel,
    string? ActionLabel,
    string? ActionId,
    bool Current,
    string? CurrentLabel,
    bool Added = false,
    string? AddedLabel = null) : ComponentMetadataDto;

/// <summary>Add-on picker metadata: priced extras with a live running total.</summary>
public record AddOnPickerMetadataDto(
    string? TotalLabel,
    string? Currency,
    string? ActionId,
    IReadOnlyList<AddOnDto> Items) : ComponentMetadataDto;

/// <summary>One priced extra; IncludedLabel replaces the price and hides the toggle.</summary>
public record AddOnDto(
    string? Id,
    string? Icon,
    string? Title,
    string? Description,
    double? Price,
    string? Unit,
    string? IncludedLabel,
    bool Added);

/// <summary>Ledger metadata: folio breakdown; Total null → client computes the sum.</summary>
public record LedgerMetadataDto(
    string? Currency,
    string? TotalLabel,
    IReadOnlyList<LedgerLineDto> Lines,
    double? Total) : ComponentMetadataDto;

/// <summary>One ledger row; Included lines show IncludedLabel instead of an amount.</summary>
public record LedgerLineDto(string? Concept, double? Amount, bool Included, string? IncludedLabel);

/// <summary>Payment-picker metadata: segmented methods + context chip + confirm CTA dispatching
/// ActionId with { _method: selectedId }.</summary>
public record PaymentPickerMetadataDto(
    string? ActionId,
    IReadOnlyList<PaymentMethodDto> Methods,
    string? Selected,
    string? ContextLabel,
    string? ContextValue,
    string? ConfirmLabel,
    string? MethodActionId = null) : ComponentMetadataDto;

/// <summary>One selectable payment method.</summary>
public record PaymentMethodDto(string? Id, string? Label);

/// <summary>Process-monitor metadata: monitored automation processes with health counters.</summary>
public record ProcessMonitorMetadataDto(IReadOnlyList<ProcessItemDto> Items) : ComponentMetadataDto;

/// <summary>One monitored process; Status is ok|warning|error.</summary>
public record ProcessItemDto(
    string? Id,
    string? Name,
    IReadOnlyList<string> Systems,
    int Ok,
    int Warnings,
    int Errors,
    string? Status,
    string? ActionLabel,
    string? ActionId);
