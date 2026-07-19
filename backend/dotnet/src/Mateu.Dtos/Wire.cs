using System.Text.Json.Serialization;

namespace Mateu.Dtos;

// ── Top-level wire envelope (mirrors io.mateu.dtos.UIIncrementDto) ──────────────
public record UIIncrementDto(
    IReadOnlyList<UICommandDto> Commands,
    IReadOnlyList<MessageDto> Messages,
    IReadOnlyList<UIFragmentDto> Fragments,
    IReadOnlyList<object> Banners,
    bool AppendBanners,
    object? AppData,
    object? AppState)
{
    public static UIIncrementDto Of(
        IEnumerable<UICommandDto>? commands = null,
        IEnumerable<MessageDto>? messages = null,
        IEnumerable<UIFragmentDto>? fragments = null,
        IEnumerable<object>? banners = null,
        bool appendBanners = false) =>
        new(commands?.ToList() ?? [], messages?.ToList() ?? [], fragments?.ToList() ?? [], banners?.ToList() ?? [], appendBanners, null, null);
}

public record UICommandDto(string TargetComponentId, string Type, object? Data)
{
    /// <summary>Closes the topmost open overlay (dialog or drawer).</summary>
    public static UICommandDto CloseModal() => new("ux_main", "CloseModal", null);

    /// <summary>Closes the topmost open overlay and emits <paramref name="eventName"/> (with
    /// <paramref name="detail"/> as its payload) through the custom-event bus, so the host page
    /// can react — refresh itself or receive the overlay's result (mirrors Java's
    /// UICommand.closeModal).</summary>
    public static UICommandDto CloseModal(string eventName, object? detail = null) =>
        new("ux_main", "CloseModal", new CustomEventDto(eventName, detail));

    /// <summary>Emits a named custom event from the current component (mirrors Java's
    /// UICommand.dispatchEvent) — @SubscribeTo counterparts react to it.</summary>
    public static UICommandDto DispatchEvent(string eventName, object? detail = null) =>
        new("ux_main", "DispatchEvent", new CustomEventDto(eventName, detail));
}

/// <summary>A named custom event riding on a CloseModal/DispatchEvent command (mirrors
/// io.mateu.uidl.fluent.CustomEvent).</summary>
public record CustomEventDto(string EventName, object? Detail);

public record MessageDto(
    string Variant,
    string Position,
    string Title,
    string Text,
    int Duration,
    string? UndoLabel = null,
    string? UndoActionId = null,
    IReadOnlyDictionary<string, object?>? UndoParameters = null);

public record UIFragmentDto(
    string TargetComponentId,
    ComponentDto? Component,
    object? State,
    object? Data,
    string Action,
    string? ContainerId);

// ── Component tree (discriminated on "type") ───────────────────────────────────
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ClientSideComponentDto), "ClientSide")]
[JsonDerivedType(typeof(ServerSideComponentDto), "ServerSide")]
public abstract record ComponentDto;

public record ClientSideComponentDto(
    ComponentMetadataDto Metadata,
    string? Id,
    IReadOnlyList<ComponentDto> Children,
    string? Style,
    string? CssClasses,
    string? Slot) : ComponentDto;

public record ServerSideComponentDto(
    string Id,
    string ServerSideType,
    string Route,
    IReadOnlyList<ComponentDto> Children,
    object InitialData,
    IReadOnlyList<ActionDto> Actions,
    IReadOnlyList<object> Triggers,
    string? Style,
    string? CssClasses,
    string? Slot) : ComponentDto
{
    public string? EmitsName { get; init; }
    public bool ConfirmOnNavigationIfDirty { get; init; }

    /// <summary>How the page's content column is sized (the first parameter of the Redwood page
    /// templates): "fixed"|"fullWidth"|"edgeToEdge"; null = no opinion — the renderer infers the
    /// width from the page content. From [PageWidth] on the view class, else the IPageWidthSupplier
    /// hook. (Mirrors io.mateu.dtos.ServerSideComponentDto.pageWidth.)</summary>
    public string? PageWidth { get; init; }

    /// <summary>Client-side rules ([Hidden]/[Disabled] fields, IRuleSupplier): the renderer's
    /// no-eval engine re-evaluates them on every state change.</summary>
    public IReadOnlyList<RuleDto> Rules { get; init; } = [];
}

/// <summary>A client-side rule (mirrors io.mateu.dtos.RuleDto): when Filter evaluates truthy the
/// renderer applies Action — e.g. SetDataValue of FieldAttribute (hidden, disabled, required…) to
/// the value of Expression, both evaluated against the live state.</summary>
public record RuleDto(
    string Filter,
    string Action,
    string? FieldName,
    string? FieldAttribute,
    object? Value,
    string? Expression,
    string Result,
    string? ActionId);

// Field names mirror io.mateu.dtos.ActionDto (confirmationRequired/rowsSelectedRequired/bubble):
// the frontend blocks a rowsSelectedRequired action while the grid selection is empty, and
// bubble lets the event reach the enclosing crud component.
public record ActionDto(
    string Id,
    bool ValidationRequired = true,
    bool ConfirmationRequired = false,
    bool RowsSelectedRequired = false,
    bool Bubble = false);

/// <summary>A trigger that fires <c>ActionId</c> when a named custom event is received.</summary>
public record CustomTriggerDto(string Event, string ActionId)
{
    public string Type { get; init; } = "OnCustomEvent";
}

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
[JsonDerivedType(typeof(FoldoutLayoutMetadataDto), "FoldoutLayout")]
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
[JsonDerivedType(typeof(SeparatorMetadataDto), "Separator")]
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
[JsonDerivedType(typeof(DialogMetadataDto), "Dialog")]
[JsonDerivedType(typeof(MicroFrontendMetadataDto), "MicroFrontend")]
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

/// <summary>Navigation Header of a foldout: prev/next between objects of the same type +
/// go-to-parent. A null/blank actionId hides the corresponding control.</summary>
public record FoldoutNavigationDto(
    string? Title, string? ParentLabel, string? ParentActionId,
    string? PreviousActionId, string? NextActionId);

/// <summary>Header info for one foldout panel; its content travels as a slotted component child.</summary>
public record FoldoutPanelInfoDto(string? Title, string? Subtitle, string? Icon, bool Open);

/// <summary>Page hero header. Slotted content travels as component children.</summary>
public record HeroSectionMetadataDto(string? Title, string? Subtitle, string? Image, string? Height, bool Centered) : ComponentMetadataDto;

/// <summary>Friendly empty-state placeholder with an optional call-to-action.</summary>
public record EmptyStateMetadataDto(string? Icon, string? Title, string? Description, string? ActionId, string? ActionLabel) : ComponentMetadataDto;

/// <summary>Shimmering loading placeholder. Variant: text|card|grid|form.</summary>
public record SkeletonMetadataDto(string Variant, int Count) : ComponentMetadataDto;

/// <summary>Gantt/timeline chart metadata.</summary>
public record GanttMetadataDto(IReadOnlyList<GanttTaskDto> Tasks) : ComponentMetadataDto;

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
    string? SelectActionId) : ComponentMetadataDto;

/// <summary>One planning board row; group is an optional swimlane caption.</summary>
public record PlanningResourceDto(string? Id, string? Label, string? Group);

/// <summary>One planning board block; start/end are ISO-8601 dates (inclusive).</summary>
public record PlanningBlockDto(
    string? Id, string? ResourceId, string? Start, string? End, string? Label, string? Color, string? Status);

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

/// <summary>Month-grid calendar metadata; Month/Event dates are ISO-8601 (yyyy-MM-dd).</summary>
public record CalendarMetadataDto(string? Month, IReadOnlyList<CalendarEventDto> Events) : ComponentMetadataDto;

/// <summary>One calendar event; Date is ISO-8601; ActionId makes the chip clickable.</summary>
public record CalendarEventDto(string? Id, string? Title, string? Date, string? Color, string? ActionId);

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

/// <summary>Tab strip metadata (mirrors io.mateu.dtos.TabLayoutDto). GroupRelationship —
/// alternative|sequential|simultaneous — carries the semantic relationship between the tabbed
/// groups; Adaptable tells renderers they may swap the concrete widget (e.g. degrade tabs to an
/// accordion on narrow viewports) as long as the disclosure semantics are preserved.</summary>
public record TabLayoutMetadataDto : ComponentMetadataDto
{
    public string? GroupRelationship { get; init; }
    public bool Adaptable { get; init; }
}

/// <summary>Accordion metadata (mirrors io.mateu.dtos.AccordionLayoutDto). Panels is empty on the
/// wire — the panels travel as component children carrying AccordionPanel metadata.</summary>
public record AccordionLayoutMetadataDto : ComponentMetadataDto
{
    public IReadOnlyList<AccordionPanelMetadataDto> Panels { get; init; } = [];
    public string? Variant { get; init; }
}

/// <summary>One collapsible accordion panel (mirrors io.mateu.dtos.AccordionPanelDto); its content
/// travels as the component's child.</summary>
public record AccordionPanelMetadataDto(string Label) : ComponentMetadataDto
{
    public string? Id { get; init; }
    public bool Active { get; init; }
    public bool Disabled { get; init; }
}

public record TabMetadataDto(string Label) : ComponentMetadataDto
{
    public bool Active { get; init; }
    public string? Shortcut { get; init; }
}

public record KpiDto(string Title, string Value)
{
    public string? Icon { get; init; }
    public string? Color { get; init; }
}

public record FabDto(string Icon, string ActionId)
{
    public string? Label { get; init; }
    public int Order { get; init; }
}

public record HorizontalLayoutMetadataDto : ComponentMetadataDto
{
    public bool Spacing { get; init; } = true;

    /// <summary>Lets the row's items wrap to the next line (responsive zone stacking).</summary>
    public bool Wrap { get; init; }
}

public record ProgressBarMetadataDto(double Value) : ComponentMetadataDto
{
    public double Min { get; init; }
    public double Max { get; init; } = 1;
}

public record TextMetadataDto(string Text) : ComponentMetadataDto
{
    /// <summary>Font size: xl | l | m | s | xs. m (or null) applies nothing.</summary>
    public string? Size { get; init; }

    /// <summary>Drops the container's block margins (margin-block-start/end: 0).</summary>
    public bool NoMargins { get; init; }
}

/// <summary>A horizontal divider line (&lt;hr&gt;); data-colspan in Attributes makes it span the
/// full form row.</summary>
public record SeparatorMetadataDto(IReadOnlyDictionary<string, string>? Attributes = null) : ComponentMetadataDto;

/// <summary>A hyperlink (mirrors AnchorDto). Target "_blank" is rendered with rel=noopener.</summary>
public record AnchorMetadataDto(string Text, string Url, string? Target = null) : ComponentMetadataDto;

/// <summary>A compact inline banner: theme-tinted strip with a severity icon, one line of text
/// and an optional right-aligned action.</summary>
public record NoticeMetadataDto(string? Text, string? Theme, string? Icon, string? ActionLabel, string? ActionId, bool Slim = false, bool FullWidth = false, bool NoIcon = false, string? Status = null, bool InlineContent = false) : ComponentMetadataDto;

public record ButtonMetadataDto(string Label, string ActionId) : ComponentMetadataDto
{
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }

    /// <summary>Extra parameters merged into the dispatched action request (e.g. the conflict
    /// dialog's <c>_forceOverwrite</c>).</summary>
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }
}

public record FormSectionMetadataDto(string Title) : ComponentMetadataDto;

public record CrudMetadataDto(
    string? Title,
    IReadOnlyList<GridColumnDto> Columns,
    IReadOnlyList<ButtonDto> Toolbar) : ComponentMetadataDto
{
    public string? Subtitle { get; init; }
    public bool Searchable { get; init; } = true;
    public bool CanEdit { get; init; }
    public string? DetailPath { get; init; }
    public string CrudlType { get; init; } = "table";

    /// <summary>The renderer's grid layout: auto (renderer decides) | table | list | cards |
    /// masterDetail | tree (hierarchical rows carrying a self-referential children list —
    /// never auto-selected).</summary>
    public string GridLayout { get; init; } = "auto";

    /// <summary>The smart search bar's filters, one FormField per filterable entity property
    /// (enums as multi-selects, temporals as date ranges, [RangeFilter] numerics as min–max).</summary>
    public IReadOnlyList<FormFieldMetadataDto> Filters { get; init; } = [];

    /// <summary>The [GroupBy] column of the row class (camelCase field id): the listing groups
    /// its rows by it — implicit primary sort + a group subtotal row whenever the value changes.
    /// Null when the row class declares no [GroupBy] column (mirrors CrudlDto.groupBy).</summary>
    public string? GroupBy { get; init; }
}

public record GridColumnDto(GridColumnMetaDto Metadata);

public record GridColumnMetaDto(string Id, string Label)
{
    public string Type { get; init; } = "GridColumn";

    /// <summary>The column's value type (string|integer|number|boolean|date|money) — drives the
    /// renderer's cell formatting. Null on legacy crud columns.</summary>
    public string? DataType { get; init; }

    public string? Stereotype { get; init; }

    /// <summary>Inline editing (class-level [InlineEditing] on the crud): the cell renders an
    /// in-place editor and each commit dispatches the crud's update-row action.</summary>
    public bool Editable { get; init; }

    /// <summary>Editor widget when Editable: select|boolean|integer|number|date|datetime|text.</summary>
    public string? EditorType { get; init; }

    /// <summary>Options of a select editor (enum constants); null otherwise.</summary>
    public IReadOnlyList<OptionDto>? EditorOptions { get; init; }

    /// <summary>The [Aggregate] function of the column — sum|avg|min|max|count — computed over
    /// the WHOLE filtered result set and shown in the listing's totals footer (and per group).
    /// Null on non-aggregated columns (mirrors GridColumnDto.aggregate).</summary>
    public string? Aggregate { get; init; }
}

public record TriggerDto(string Type, string ActionId);

public record AppMetadataDto(
    string Title,
    string Variant,
    IReadOnlyList<MenuItemDto> Menu) : ComponentMetadataDto
{
    public string Layout { get; init; } = "SINGLE_SLOT";
    public string HomeRoute { get; init; } = "";
    public string HomeConsumedRoute { get; init; } = "";

    /// <summary>The backend's public base URL — the shell loads its home content against it
    /// (mirrors AppDto.homeBaseUrl; without it the first auto-load fires page-relative).</summary>
    public string HomeBaseUrl { get; init; } = "";

    public string HomeServerSideType { get; init; } = "";
    public string ServerSideType { get; init; } = "";
    public string RootRoute { get; init; } = "";
    public string? Subtitle { get; init; }
    public string? LoginUrl { get; init; }
    public string? LogoutUrl { get; init; }

    /// <summary>SSE chat endpoint ([AI]); when set the renderer shows the floating AI chat.</summary>
    public string? SseUrl { get; init; }

    public IReadOnlyList<AppContextSelectorDto> ContextSelectors { get; init; } = [];

    /// <summary>Header action buttons next to the context selectors (the app class implements
    /// IAppActionsSupplier); an entry with Children renders as a dropdown.</summary>
    public IReadOnlyList<AppHeaderActionDto> ContextActions { get; init; } = [];

    /// <summary>True when the app class implements INotificationsSupplier — the shell shows the
    /// header bell, fed by the _notifications-list/_notifications-read app-level actions.</summary>
    public bool NotificationsEnabled { get; init; }

    /// <summary>True when the app class implements IGlobalSearchSupplier — the command palette
    /// also searches ENTITIES through the app-level _globalsearch action.</summary>
    public bool GlobalSearchEnabled { get; init; }
}

/// <summary>An application-level context selector shown on the app header: fixes a value for
/// every screen (the active hotel, the company…). The picked value lives in the app state under
/// FieldName and travels with every request.</summary>
public record AppContextSelectorDto(string FieldName, string Label, IReadOnlyList<OptionDto> Options);

/// <summary>An action button on the app header, next to the app-context selectors. An entry with
/// Children renders as a dropdown menu: only the children dispatch.</summary>
public record AppHeaderActionDto(
    string? ActionId, string Label, string? Icon, IReadOnlyList<AppHeaderActionDto>? Children);

public record MenuItemDto(string Label, string Route, string ServerSideType)
{
    public string ConsumedRoute { get; init; } = "";
    public string? ActionId { get; init; }
    public bool Separator { get; init; }
    public bool Visible { get; init; } = true;
    public IReadOnlyList<MenuItemDto> Submenus { get; init; } = [];

    /// <summary>Federated entry ([RemoteMenu]): the frontend fetches the remote backend's menu
    /// from BaseUrl and mounts its views under this option.</summary>
    public bool Remote { get; init; }

    public string? BaseUrl { get; init; }

    /// <summary>Inline the remote entries at this level instead of nesting under Label.</summary>
    public bool Explode { get; init; }
}

public record PageMetadataDto(
    string? Title,
    string? PageTitle,
    string? Subtitle,
    IReadOnlyList<ButtonDto> Toolbar,
    IReadOnlyList<ButtonDto> Buttons) : ComponentMetadataDto
{
    public int Level { get; init; }
    public bool ReadOnly { get; init; }
    public object? Actions { get; init; }
    /// <summary>Sticky sections index: null = renderer decides (auto), true = force, false = off.</summary>
    public bool? Toc { get; init; }
    /// <summary>Page width of a reflected view ("fixed"|"fullWidth"|"edgeToEdge"; null = the
    /// renderer infers it from the content). (Mirrors io.mateu.dtos.PageDto.pageWidth.)</summary>
    public string? PageWidth { get; init; }
    public IReadOnlyList<BadgeDto> Badges { get; init; } = [];
    public IReadOnlyList<KpiDto> Kpis { get; init; } = [];
    public IReadOnlyList<BannerDto> Banners { get; init; } = [];
    public IReadOnlyList<FabDto> Fabs { get; init; } = [];
}

/// <summary>A page banner (mirrors io.mateu.dtos.BannerDto). Theme: INFO|SUCCESS|WARNING|DANGER.</summary>
public record BannerDto(string Theme, string? Title, string? Description)
{
    public bool HasIcon { get; init; } = true;
    public bool HasCloseButton { get; init; }
    public int TimeoutSeconds { get; init; }
}

/// <summary>A status chip shown in the page header strip.</summary>
public record BadgeDto(string Text, string Color)
{
    public bool Primary { get; init; }
    public bool Small { get; init; }
    public bool Pill { get; init; } = true;
}

public record CardMetadataDto(ComponentDto Content) : ComponentMetadataDto
{
    public string? Title { get; init; }
    public IReadOnlyList<string> Variants { get; init; } = ["outlined"];
}

public record DivMetadataDto : ComponentMetadataDto
{
    public object? Content { get; init; }
}

public record VerticalLayoutMetadataDto : ComponentMetadataDto
{
    public bool Spacing { get; init; }
}

public record FormLayoutMetadataDto : ComponentMetadataDto
{
    public int MaxColumns { get; init; } = 2;
    public bool AutoResponsive { get; init; } = true;
}

public record FormRowMetadataDto : ComponentMetadataDto;

public record FormFieldMetadataDto(string FieldId, string DataType, string Label) : ComponentMetadataDto
{
    public string Stereotype { get; init; } = "regular";
    public bool TreeLeavesOnly { get; init; }
    public bool Required { get; init; }
    public bool ReadOnly { get; init; }
    public int Colspan { get; init; } = 1;
    public object? InitialValue { get; init; }
    public IReadOnlyList<OptionDto> Options { get; init; } = [];
    public bool Multiline { get; init; }
    /// <summary>Property-list sections ([Section(PropertyList = true)]): render as a read-only row
    /// with the label aligned left and the plain-text value aligned right, divider between rows.</summary>
    public bool PropertyRow { get; init; }
    /// <summary>Navigation link rendered as an icon at the right side of this field; null = no link.</summary>
    public NavLinkDto? Link { get; init; }

    /// <summary>Where a lookup (remote combo) field searches its options: the renderer fires
    /// Action with {searchText, page, size} and expects a page of options back. Null on
    /// non-lookup fields.</summary>
    public RemoteCoordinatesDto? RemoteCoordinates { get; init; }

    /// <summary>Grid (list-of-rows) fields: one GridColumn per row-type property. Null on
    /// non-grid fields.</summary>
    public IReadOnlyList<GridColumnDto>? Columns { get; init; }

    /// <summary>Grid fields: the row-identity path ("_rowNumber" — rows are identified by
    /// position).</summary>
    public string? ItemIdPath { get; init; }

    /// <summary>Grid fields: action dispatched when the user selects (clicks) a row, carrying
    /// the row as the _clickedRow parameter ([OnRowSelected]).</summary>
    public string? OnItemSelectionActionId { get; init; }

    /// <summary>Grid fields: keyboard base combo for selecting a row by position.</summary>
    public string? RowSelectionShortcut { get; init; }

    /// <summary>Generic field attributes (mirrors FormFieldDto.attributes, a list of key/value
    /// pairs) — e.g. the [FileUpload] accept filter travels as {"key":"accept","value":".csv"}.</summary>
    public IReadOnlyList<PairDto> Attributes { get; init; } = [];
}

/// <summary>A generic key/value pair (mirrors io.mateu.dtos.PairDto).</summary>
public record PairDto(string Key, object? Value);

/// <summary>Coordinates of a remote data source (mirrors io.mateu.dtos.RemoteCoordinatesDto);
/// only Action is set for same-backend lookups.</summary>
public record RemoteCoordinatesDto(string Action)
{
    public string? BaseUrl { get; init; }
    public string? Route { get; init; }
    public Dictionary<string, object?>? Params { get; init; }
}

/// <summary>A drawer overlay (mirrors io.mateu.dtos.DrawerDto): a panel sliding in from a
/// viewport edge whose content travels in the Content field. Emitted as an Add fragment so it
/// stacks on the page instead of replacing it.</summary>
public record DrawerMetadataDto(string? Id, string? HeaderTitle, ComponentDto? Content) : ComponentMetadataDto
{
    public ComponentDto? Header { get; init; }
    public ComponentDto? Footer { get; init; }
    /// <summary>start|end (the viewport edge the drawer slides from).</summary>
    public string Position { get; init; } = "end";
    public string? Width { get; init; }
    public bool NoPadding { get; init; }
    public bool Modeless { get; init; }
    public object? InitialData { get; init; }
}

/// <summary>A remote Mateu UI embedded as an island inside this page (mirrors
/// io.mateu.dtos.MicroFrontendDto): the renderer mounts a mateu-ux against BaseUrl/Route and the
/// island runs its own sync loop against the remote backend.</summary>
public record MicroFrontendMetadataDto(string BaseUrl, string Route) : ComponentMetadataDto
{
    public string ConsumedRoute { get; init; } = "_empty";
    public string? Style { get; init; }
    public string? CssClasses { get; init; }
    public string ServerSideType { get; init; } = "";
    public object? AppState { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A modal dialog overlay (mirrors io.mateu.dtos.DialogDto).</summary>
public record DialogMetadataDto(string? Id, string? HeaderTitle, ComponentDto? Content) : ComponentMetadataDto
{
    public ComponentDto? Header { get; init; }
    public ComponentDto? Footer { get; init; }
    public bool NoPadding { get; init; }
    public bool Modeless { get; init; }
    public string? Width { get; init; }
    public string? Height { get; init; }
    public bool CloseButtonOnHeader { get; init; } = true;
    public object? InitialData { get; init; }
}

/// <summary>Navigation link on a form field (mirrors io.mateu.dtos.NavLinkDto). Href/title travel
/// as raw <c>${...}</c> templates — the renderer interpolates them against the live state.</summary>
public record NavLinkDto(string Href, string? Icon, string? Title, string? Target);

public record OptionDto(string Value, string Label)
{
    /// <summary>Sub-options of a hierarchical option set (tree selects); empty on flat lists.</summary>
    public IReadOnlyList<OptionDto> Children { get; init; } = [];
}

// A button (ButtonDto in Java) — a flat record carrying its own "type":"Button".
public record ButtonDto(string Label, string ActionId)
{
    public string Type { get; init; } = "Button";
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }
    public string? Shortcut { get; init; }
}

// ── Inbound request (mirrors io.mateu.dtos.RunActionRqDto) ──────────────────────
public record RunActionRqDto
{
    public Dictionary<string, object?> ComponentState { get; init; } = new();
    public Dictionary<string, object?> AppState { get; init; } = new();
    public Dictionary<string, object?> Parameters { get; init; } = new();
    public string? InitiatorComponentId { get; init; }
    public string? ConsumedRoute { get; init; }
    public string? ActionId { get; init; }
    public string? Route { get; init; }
    public string? ServerSideType { get; init; }
    public string? ServerSideComponentRoute { get; init; }
}
