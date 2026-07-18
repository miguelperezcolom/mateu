namespace Mateu.Uidl;

// ── Fluent components (C# analogue of io.mateu.uidl.data + io.mateu.uidl.fluent) ──
// A view builds a tree of these (directly, or via an archetype like Dashboard) and Mateu maps it
// to the same wire JSON the Java backend emits.

/// <summary>Marker for a fluent UI component (the C# analogue of io.mateu.uidl.fluent.Component).</summary>
public interface IComponent
{
    string? Id { get; }
    string? Style { get; }
    string? CssClasses { get; }
}

/// <summary>A view that supplies its own component tree instead of a reflected form
/// (the C# analogue of io.mateu.uidl.interfaces.ComponentTreeSupplier).</summary>
public interface IComponentTreeSupplier
{
    IComponent Component();
}

/// <summary>Base for fluent components: id + style + css classes.</summary>
public abstract record ComponentBase : IComponent
{
    public string? Id { get; init; }
    public string? Style { get; init; }
    public string? CssClasses { get; init; }
}

/// <summary>A live form field composed directly into a fluent tree (the analogue of Java's
/// fluent FormField, e.g. a search box or a select inside an archetype): the renderer binds it
/// to componentState under <see cref="FieldId"/>, so its value rides every action request and
/// lands on a same-named property of the view. With <see cref="Options"/> it renders as a
/// select.</summary>
public sealed record FormField : ComponentBase
{
    public required string FieldId { get; init; }
    public string DataType { get; init; } = "string";
    public string? Label { get; init; }
    public string Stereotype { get; init; } = "regular";
    public bool Required { get; init; }
    public bool ReadOnly { get; init; }
    public object? InitialValue { get; init; }
    public IReadOnlyList<Option> Options { get; init; } = [];
}

// ── Dashboards ─────────────────────────────────────────────────────────────────

public enum MetricTrend { Up, Down, Neutral }

/// <summary>A KPI tile: a title, a prominent value, an optional trend indicator and an optional
/// drill-in action. Use inside a <see cref="Scoreboard"/> or a <see cref="DashboardLayout"/>.</summary>
public sealed record MetricCard : ComponentBase
{
    public string? Title { get; init; }
    public string? Value { get; init; }
    public string? Unit { get; init; }
    public MetricTrend? Trend { get; init; }
    public string? TrendLabel { get; init; }
    public string? Icon { get; init; }
    public string? Description { get; init; }
    /// <summary>Makes the tile clickable — the renderer dispatches this action (a method name).</summary>
    public string? ActionId { get; init; }
}

/// <summary>A horizontal band of <see cref="MetricCard"/>s summarising essential status
/// information, typically placed at the top of a dashboard.</summary>
public sealed record Scoreboard : ComponentBase
{
    public IReadOnlyList<MetricCard> Metrics { get; init; } = [];
}

/// <summary>A titled tile inside a <see cref="DashboardLayout"/>. Wraps any component and can span
/// several grid columns/rows.</summary>
public sealed record DashboardPanel : ComponentBase
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public IComponent? Content { get; init; }
    public int ColSpan { get; init; } = 1;
    public int RowSpan { get; init; } = 1;
}

/// <summary>A responsive grid of dashboard tiles. Columns 0 (default) lets the renderer pick a
/// responsive column count.</summary>
public sealed record DashboardLayout : ComponentBase
{
    public int Columns { get; init; }
    public IReadOnlyList<IComponent> Items { get; init; } = [];
}

// ── Foldout ────────────────────────────────────────────────────────────────────

/// <summary>One lateral panel of a <see cref="FoldoutLayout"/>. Closed panels render as a narrow
/// strip with the rotated title; clicking folds them out. Open controls the initial state.</summary>
public sealed record FoldoutPanel : ComponentBase
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Icon { get; init; }
    public bool Open { get; init; } = true;
    public IComponent? Content { get; init; }
}

/// <summary>Redwood-style foldout: a fixed overview panel on the left plus lateral fold-out panels
/// with categories of associated information.</summary>
public sealed record FoldoutLayout : ComponentBase
{
    public IComponent? Overview { get; init; }
    public IReadOnlyList<FoldoutPanel> Panels { get; init; } = [];
    /// <summary>Big heading of the optional header band above the columns (RDS "overview title").</summary>
    public string? HeaderTitle { get; init; }
    /// <summary>Label/Value chips shown under the header title.</summary>
    public IReadOnlyList<string> Badges { get; init; } = [];
}

// ── Hero, empty state, skeleton, Gantt ─────────────────────────────────────────

/// <summary>A prominent page hero: a large title and subtitle, optionally over a background image,
/// with slotted content below (search box, call-to-action buttons…).</summary>
public sealed record HeroSection : ComponentBase
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Image { get; init; }
    public string? Height { get; init; }
    public bool Centered { get; init; }
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>A friendly placeholder for "there is nothing here yet": an icon, a title, a description
/// and an optional call-to-action button.</summary>
public sealed record EmptyState : ComponentBase
{
    public string? Icon { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? ActionId { get; init; }
    public string? ActionLabel { get; init; }
}

public enum SkeletonVariant { Text, Card, Grid, Form }

/// <summary>A shimmering placeholder shown while real content loads. Count repeats the shape
/// (lines, rows or fields).</summary>
public sealed record Skeleton : ComponentBase
{
    public SkeletonVariant Variant { get; init; } = SkeletonVariant.Text;
    public int Count { get; init; } = 3;
}

/// <summary>One bar of a <see cref="Gantt"/>: a task with a date span, optional progress and color.</summary>
public sealed record GanttTask
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public DateOnly? Start { get; init; }
    public DateOnly? End { get; init; }
    /// <summary>Completion percentage, 0–100.</summary>
    public double Progress { get; init; }
    public string? Color { get; init; }
}

/// <summary>A Gantt/timeline chart: one row per <see cref="GanttTask"/>, bars spanning the task's
/// dates on a shared time axis. Read-only by design.</summary>
public sealed record Gantt : ComponentBase
{
    public IReadOnlyList<GanttTask> Tasks { get; init; } = [];
}

/// <summary>One row of a <see cref="PlanningBoard"/>: a bookable/assignable resource (room,
/// vehicle, employee). Group is an optional swimlane caption (e.g. floor or room type) —
/// consecutive resources sharing the same group render under one caption.</summary>
public sealed record PlanningResource
{
    public string? Id { get; init; }
    public string? Label { get; init; }
    public string? Group { get; init; }
}

/// <summary>One block of a <see cref="PlanningBoard"/>: a booking/assignment spanning Start to End
/// (inclusive) on the resource identified by ResourceId, with an optional color and status caption
/// (shown in the tooltip).</summary>
public sealed record PlanningBlock
{
    public string? Id { get; init; }
    public string? ResourceId { get; init; }
    public DateOnly? Start { get; init; }
    public DateOnly? End { get; init; }
    public string? Label { get; init; }
    public string? Color { get; init; }
    public string? Status { get; init; }
}

/// <summary>A planning board / tape chart: one row per <see cref="PlanningResource"/>, one column
/// per day between From and To, and colored <see cref="PlanningBlock"/>s spanning their date
/// ranges on their resource's row — the rooms × days grid every hotel/rental/staffing back-office
/// needs. When SelectActionId is set, clicking a block runs that action with the block's id in
/// parameters._blockId; when MoveActionId is set, blocks can be dragged to another row/day —
/// dropping runs the action with _blockId, _resourceId, _start and _end.</summary>
public sealed record PlanningBoard : ComponentBase
{
    public IReadOnlyList<PlanningResource> Resources { get; init; } = [];
    public IReadOnlyList<PlanningBlock> Blocks { get; init; } = [];
    public DateOnly? From { get; init; }
    public DateOnly? To { get; init; }
    public string? MoveActionId { get; init; }
    public string? SelectActionId { get; init; }
}

/// <summary>One card on a <see cref="KanbanColumn"/>. A card with an ActionId is clickable.</summary>
public sealed record KanbanCard
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Badge { get; init; }
    public string? Color { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>One column of a <see cref="Kanban"/> board: a title, an accent color and its cards.</summary>
public sealed record KanbanColumn
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Color { get; init; }
    public IReadOnlyList<KanbanCard> Cards { get; init; } = [];
}

/// <summary>A read-only kanban board: columns of cards. Cards may carry an ActionId to be clickable.</summary>
public sealed record Kanban : ComponentBase
{
    public IReadOnlyList<KanbanColumn> Columns { get; init; } = [];
}

/// <summary>One entry on a <see cref="Timeline"/>. Timestamp is a free-form label; an ActionId
/// makes the entry clickable.</summary>
public sealed record TimelineItem
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Timestamp { get; init; }
    public string? Icon { get; init; }
    public string? Color { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A read-only vertical timeline / activity feed: a chronological list of entries.</summary>
public sealed record Timeline : ComponentBase
{
    public IReadOnlyList<TimelineItem> Items { get; init; } = [];
}

/// <summary>One step of a <see cref="ProgressSteps"/>. Status: done|current|upcoming.</summary>
public sealed record Step
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Status { get; init; }
}

/// <summary>A read-only progress indicator: numbered steps joined by a connector — a horizontal
/// row by default, a stacked column when Vertical (the wizard RAIL mode).</summary>
public sealed record ProgressSteps : ComponentBase
{
    public IReadOnlyList<Step> Steps { get; init; } = [];
    public bool Vertical { get; init; }
}

/// <summary>A compact KPI stat: value + unit, a delta with a trend (up|down|flat) and an inline
/// sparkline drawn from Spark. An ActionId makes the tile clickable.</summary>
public sealed record Stat : ComponentBase
{
    public string? Label { get; init; }
    public string? Value { get; init; }
    public string? Unit { get; init; }
    public string? Delta { get; init; }
    public string? Trend { get; init; }
    public IReadOnlyList<double> Spark { get; init; } = [];
    public string? ActionId { get; init; }
}

/// <summary>One event on a <see cref="Calendar"/>: a title on a Date, with an optional color and
/// an ActionId that makes the chip clickable.</summary>
public sealed record CalendarEvent
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public DateOnly? Date { get; init; }
    public string? Color { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A read-only month-grid calendar with events. Month is any day in the month to show.</summary>
public sealed record Calendar : ComponentBase
{
    public DateOnly? Month { get; init; }
    public IReadOnlyList<CalendarEvent> Events { get; init; } = [];
}

/// <summary>One plan of a <see cref="PricingTable"/>: name, price + period, features and a CTA.
/// Featured marks the recommended plan.</summary>
public sealed record PricingPlan
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public string? Price { get; init; }
    public string? Period { get; init; }
    public bool Featured { get; init; }
    public IReadOnlyList<string> Features { get; init; } = [];
    public string? CtaLabel { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A pricing / plan-comparison table: plan cards side by side, one optionally featured.</summary>
public sealed record PricingTable : ComponentBase
{
    public IReadOnlyList<PricingPlan> Plans { get; init; } = [];
}

/// <summary>One node of an <see cref="OrgChart"/>: a title, subtitle, avatar and its children.</summary>
public sealed record OrgNode
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Avatar { get; init; }
    public string? Color { get; init; }
    public string? ActionId { get; init; }
    public IReadOnlyList<OrgNode> Children { get; init; } = [];
}

/// <summary>A read-only top-down hierarchy chart: a root node whose children fan out below it.</summary>
public sealed record OrgChart : ComponentBase
{
    public OrgNode? Root { get; init; }
}

/// <summary>One cell of a <see cref="Heatmap"/>: a Date and its Value (drives color intensity).</summary>
public sealed record HeatCell
{
    public DateOnly? Date { get; init; }
    public double Value { get; init; }
    public string? Label { get; init; }
}

/// <summary>A read-only calendar heatmap (GitHub-contributions style): one square per day.</summary>
public sealed record Heatmap : ComponentBase
{
    public IReadOnlyList<HeatCell> Cells { get; init; } = [];
}

/// <summary>One stage of a <see cref="Funnel"/>: a label, value and optional bar color.</summary>
public sealed record FunnelStage
{
    public string? Label { get; init; }
    public double Value { get; init; }
    public string? Color { get; init; }
}

/// <summary>A read-only conversion funnel: stacked bars, each narrower than the last.</summary>
public sealed record Funnel : ComponentBase
{
    public IReadOnlyList<FunnelStage> Stages { get; init; } = [];
}

/// <summary>A read-only lightweight line/area chart: a single series drawn as an SVG line.</summary>
public sealed record TrendChart : ComponentBase
{
    public string? Title { get; init; }
    public IReadOnlyList<double> Values { get; init; } = [];
    public IReadOnlyList<string> Labels { get; init; } = [];
    public string? Color { get; init; }
    public bool Area { get; init; }
}

/// <summary>One cell of a <see cref="FeatureGrid"/>: an icon, title, description and optional action.</summary>
public sealed record Feature
{
    public string? Icon { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A responsive grid of feature cards. Columns fixes the count (0 = auto-fit).</summary>
public sealed record FeatureGrid : ComponentBase
{
    public IReadOnlyList<Feature> Features { get; init; } = [];
    public int Columns { get; init; }
}

/// <summary>One card of a <see cref="Testimonials"/> block: a quote, an author and a rating.</summary>
public sealed record Testimonial
{
    public string? Quote { get; init; }
    public string? Author { get; init; }
    public string? Role { get; init; }
    public string? Avatar { get; init; }
    public int Rating { get; init; }
}

/// <summary>A responsive grid of testimonial / quote cards.</summary>
public sealed record Testimonials : ComponentBase
{
    public IReadOnlyList<Testimonial> Items { get; init; } = [];
}

/// <summary>One question/answer of a <see cref="Faq"/>; Open makes it start expanded.</summary>
public sealed record FaqItem
{
    public string? Question { get; init; }
    public string? Answer { get; init; }
    public bool Open { get; init; }
}

/// <summary>A read-only FAQ list: collapsible question/answer rows.</summary>
public sealed record Faq : ComponentBase
{
    public IReadOnlyList<FaqItem> Items { get; init; } = [];
}

/// <summary>A highlighted call-to-action block. Theme: info|success|warning|danger.</summary>
public sealed record CalloutCard : ComponentBase
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Icon { get; init; }
    public string? CtaLabel { get; init; }
    public string? ActionId { get; init; }
    public string? Theme { get; init; }
}

/// <summary>One entry of a <see cref="CommentThread"/>; Replies nest recursively.</summary>
public sealed record Comment
{
    public string? Id { get; init; }
    public string? Author { get; init; }
    public string? Avatar { get; init; }
    public string? Text { get; init; }
    public string? Timestamp { get; init; }
    public IReadOnlyList<Comment> Replies { get; init; } = [];
}

/// <summary>A read-only discussion thread with nested replies.</summary>
public sealed record CommentThread : ComponentBase
{
    public IReadOnlyList<Comment> Comments { get; init; } = [];
}

/// <summary>One entry of a <see cref="FileList"/>: name, size, type (icon), url and/or action.</summary>
public sealed record FileItem
{
    public string? Name { get; init; }
    public string? Size { get; init; }
    public string? Type { get; init; }
    public string? Url { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A read-only list of attached files with type icons.</summary>
public sealed record FileList : ComponentBase
{
    public IReadOnlyList<FileItem> Files { get; init; } = [];
}

/// <summary>One item of a <see cref="Checklist"/>; Done, plus an optional toggle action.</summary>
public sealed record ChecklistItem
{
    public string? Id { get; init; }
    public string? Label { get; init; }
    public bool Done { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A checklist with a progress bar.</summary>
public sealed record Checklist : ComponentBase
{
    public string? Title { get; init; }
    public IReadOnlyList<ChecklistItem> Items { get; init; } = [];
}

/// <summary>A two-value comparison: a left and right label+value with a delta chip between them,
/// colored by Trend (up|down|flat).</summary>
public sealed record ComparisonCard : ComponentBase
{
    public string? Title { get; init; }
    public string? LeftLabel { get; init; }
    public string? LeftValue { get; init; }
    public string? RightLabel { get; init; }
    public string? RightValue { get; init; }
    public string? Delta { get; init; }
    public string? Trend { get; init; }
}

// ── Front-office UX components ─────────────────────────────────────────────────

/// <summary>A small status chip: a label on a badge-palette color
/// (normal|success|warning|error|contrast).</summary>
public sealed record Chip
{
    public string? Label { get; init; }
    public string? Color { get; init; }
}

/// <summary>One label-over-value pair of an <see cref="EntityHeader"/>.</summary>
public sealed record Fact
{
    public string? Label { get; init; }
    public string? Value { get; init; }
}

/// <summary>Persistent context banner: identity + key facts + one highlighted metric of the
/// entity a flow operates on (e.g. the guest card of a check-in wizard). No actions.</summary>
public sealed record EntityHeader : ComponentBase
{
    public string? Title { get; init; }
    public IReadOnlyList<Chip> Badges { get; init; } = [];
    public string? Subtitle { get; init; }
    public IReadOnlyList<Fact> Facts { get; init; } = [];
    public string? MetricLabel { get; init; }
    public string? MetricValue { get; init; }
    public string? MetricCaption { get; init; }
}

/// <summary>Consumption vs limit (e.g. balance vs preauthorization): a formatted value over a
/// progress track. Fill color: success below WarnAt, warning ≥ WarnAt, error ≥ DangerAt
/// (thresholds optional; absent → primary color). No actions.</summary>
public sealed record Meter : ComponentBase
{
    public string? Label { get; init; }
    public double Value { get; init; }
    public double Max { get; init; }
    /// <summary>Currency-like symbol appended after the formatted value with a space.</summary>
    public string? Unit { get; init; }
    /// <summary>Muted caption below; empty → the client shows the computed fill percent.</summary>
    public string? Caption { get; init; }
    public double? WarnAt { get; init; }
    public double? DangerAt { get; init; }
}

/// <summary>Subtask completion banner: label + Done/Total pills + an optional CTA dispatching
/// ActionId. When Done == Total the banner tints success and hides the button.</summary>
public sealed record TaskProgress : ComponentBase
{
    public string? Label { get; init; }
    public int Total { get; init; }
    public int Done { get; init; }
    public string? ActionLabel { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>One row of a <see cref="StatusList"/>: icon (or an Avatar — short text like a
/// person's initials rendered in a circular avatar, taking precedence over the icon) +
/// title/description, a status chip and/or a small action button (dispatches ActionId with
/// parameters { _item: Id }).</summary>
public sealed record StatusItem
{
    public string? Id { get; init; }
    public string? Icon { get; init; }
    public string? Avatar { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Status { get; init; }
    public string? StatusColor { get; init; }
    public string? ActionLabel { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>Rows with an icon, text, status chip and/or action — incidents, side-effects
/// checklists. Compact tightens the row padding for dense screens; Frameless keeps the row
/// dividers but drops the outer border (the host provides the framing).</summary>
public sealed record StatusList : ComponentBase
{
    public IReadOnlyList<StatusItem> Items { get; init; } = [];
    public bool Compact { get; init; }
    public bool Frameless { get; init; }
    /// <summary>Makes every row clickable: clicking one dispatches this action with { _item: id }.</summary>
    public string? RowActionId { get; init; }
}

/// <summary>A plain bulleted list (&lt;ul&gt;) of text items — the lightweight counterpart of
/// <see cref="StatusList"/> for read-only enumerations (preferences, highlights, notes).</summary>
public sealed record BulletedList : ComponentBase
{
    public IReadOnlyList<string> Items { get; init; } = [];
}

/// <summary>A compact inline banner: a theme-tinted strip with a severity icon and one line of
/// text (e.g. "2 quejas pendientes"), plus an optional right-aligned action. Theme: "info" |
/// "success" | "warning" | "danger" (default info).</summary>
public sealed record Notice(string Text) : ComponentBase
{
    public string? Theme { get; init; }
    public string? Icon { get; init; }
    /// <summary>Suppresses the severity icon entirely.</summary>
    public bool NoIcon { get; init; }
    public string? ActionLabel { get; init; }
    public string? ActionId { get; init; }
    /// <summary>Right-aligned state text rendered where the action button goes.</summary>
    public string? Status { get; init; }
    /// <summary>Tight variant: no block margins and reduced padding.</summary>
    public bool Slim { get; init; }
    /// <summary>Spans the full form width (all columns).</summary>
    public bool FullWidth { get; init; }
    /// <summary>Content renders on the SAME line as the text instead of below it.</summary>
    public bool InlineContent { get; init; }
    /// <summary>Arbitrary components rendered inside the tinted strip, below the text.</summary>
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>One card of a <see cref="TaskQueue"/> group. Selected renders with an accent
/// border + tinted background.</summary>
public sealed record QueueItem
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Caption { get; init; }
    public IReadOnlyList<Chip> Badges { get; init; } = [];
    public bool Selected { get; init; }
}

/// <summary>One labeled group of a <see cref="TaskQueue"/>.</summary>
public sealed record QueueGroup
{
    public string? Label { get; init; }
    public IReadOnlyList<QueueItem> Items { get; init; } = [];
}

/// <summary>Grouped work queue (e.g. arrivals/departures rail). Clicking a card dispatches the
/// component-level ActionId with parameters { _item: id }.</summary>
public sealed record TaskQueue : ComponentBase
{
    public string? ActionId { get; init; }
    public IReadOnlyList<QueueGroup> Groups { get; init; } = [];
}

/// <summary>One cell of a <see cref="ResourceGrid"/>: title + subtitle + status chip, optional
/// colored note. Disabled → no pointer; Recommended → accent border + floating tag;
/// Selected → accent border + tint.</summary>
public sealed record ResourceItem
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? StatusLabel { get; init; }
    public string? StatusColor { get; init; }
    public string? Note { get; init; }
    public string? NoteColor { get; init; }
    public bool Disabled { get; init; }
    public bool Recommended { get; init; }
    public bool Selected { get; init; }
}

/// <summary>Availability/selection grid (e.g. a room picker). Columns fixes the count
/// (0 = auto-fill). Clicking an enabled item dispatches ActionId with { _item: id }.</summary>
public sealed record ResourceGrid : ComponentBase
{
    public string? ActionId { get; init; }
    public int Columns { get; init; }
    /// <summary>Text of the floating mini-tag on recommended items (default "Recommended").</summary>
    public string? RecommendedLabel { get; init; }
    public IReadOnlyList<ResourceItem> Items { get; init; } = [];
}

/// <summary>Current vs upgrade offer card: optional image header, floating Tag chip, feature
/// chips and a footer — Current shows the muted CurrentLabel (no CTA); otherwise a primary
/// button ActionLabel with PriceLabel dispatching ActionId. For toggle offers set Added from
/// the server state: the CTA turns success green and shows AddedLabel; clicking dispatches the
/// same ActionId again so the action can toggle it back.</summary>
public sealed record OfferCard : ComponentBase
{
    public string? Tag { get; init; }
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Image { get; init; }
    public IReadOnlyList<string> Features { get; init; } = [];
    public string? PriceLabel { get; init; }
    public string? ActionLabel { get; init; }
    public string? ActionId { get; init; }
    public bool Current { get; init; }
    public string? CurrentLabel { get; init; }
    public bool Added { get; init; }
    public string? AddedLabel { get; init; }
}

/// <summary>One priced extra of an <see cref="AddOnPicker"/>. When IncludedLabel is present it is
/// shown instead of the price and the toggle is hidden. Added seeds the toggle state.</summary>
public sealed record AddOn
{
    public string? Id { get; init; }
    public string? Icon { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public double? Price { get; init; }
    /// <summary>Price period/unit shown after the amount (e.g. "estancia" → "€ 343,00 / estancia").</summary>
    public string? Unit { get; init; }
    public string? IncludedLabel { get; init; }
    public bool Added { get; init; }
}

/// <summary>Priced extras with a live running total. Each toggle dispatches ActionId with
/// { _item: id, _added: bool, _total: number } when present.</summary>
public sealed record AddOnPicker : ComponentBase
{
    public string? TotalLabel { get; init; }
    public string? Currency { get; init; }
    public string? ActionId { get; init; }
    public IReadOnlyList<AddOn> Items { get; init; } = [];
}

/// <summary>One row of a <see cref="Ledger"/>. Included lines show IncludedLabel (default
/// "Included") instead of an amount; negative amounts render error-red.</summary>
public sealed record LedgerLine
{
    public string? Concept { get; init; }
    public double? Amount { get; init; }
    public bool Included { get; init; }
    public string? IncludedLabel { get; init; }
}

/// <summary>Folio breakdown with a total. Total null → the client computes the sum of the
/// non-included amounts. No actions.</summary>
public sealed record Ledger : ComponentBase
{
    public string? Currency { get; init; }
    public string? TotalLabel { get; init; }
    public IReadOnlyList<LedgerLine> Lines { get; init; } = [];
    public double? Total { get; init; }
}

/// <summary>One selectable method of a <see cref="PaymentPicker"/>.</summary>
public sealed record PaymentMethod
{
    public string? Id { get; init; }
    public string? Label { get; init; }
}

/// <summary>Payment method + context + confirm CTA: segmented method buttons (client-side state
/// seeded from Selected), an optional context chip, and a primary ConfirmLabel button
/// dispatching ActionId with { _method: selectedId }.</summary>
public sealed record PaymentPicker : ComponentBase
{
    public string? ActionId { get; init; }
    /// <summary>Dispatched with { _method: id } every time the user picks a method.</summary>
    public string? MethodActionId { get; init; }
    public IReadOnlyList<PaymentMethod> Methods { get; init; } = [];
    public string? Selected { get; init; }
    public string? ContextLabel { get; init; }
    public string? ContextValue { get; init; }
    public string? ConfirmLabel { get; init; }
}

/// <summary>One monitored process of a <see cref="ProcessMonitor"/>. Status (ok|warning|error)
/// drives the colored dot; ActionLabel/ActionId show a small fix button (no parameters).</summary>
public sealed record ProcessItem
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public IReadOnlyList<string> Systems { get; init; } = [];
    public int Ok { get; init; }
    public int Warnings { get; init; }
    public int Errors { get; init; }
    public string? Status { get; init; }
    public string? ActionLabel { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>Monitored automation processes with health counters and an optional fix action.</summary>
public sealed record ProcessMonitor : ComponentBase
{
    public IReadOnlyList<ProcessItem> Items { get; init; } = [];
}

// ── Generic building blocks (used by archetypes and free composition) ──────────

/// <summary>A plain text block. Size: "xl" | "l" | "m" | "s" | "xs" — m (or null) applies
/// nothing, the rest enlarge/reduce the font. NoMargins drops the container's block margins,
/// independent of Size.</summary>
public sealed record Text(string Content) : ComponentBase
{
    public string? Size { get; init; }
    public bool NoMargins { get; init; }
}

/// <summary>A horizontal divider line (&lt;hr&gt;) separating contents inside a section, form or
/// layout. Declaratively, mark a property with [SeparatorBefore] to paint one above it.</summary>
public sealed record Separator : ComponentBase;

/// <summary>A hyperlink. Target "_blank" opens in a new tab (the renderer adds rel=noopener).
/// (C# analogue of io.mateu.uidl.data.Anchor.)</summary>
public sealed record Anchor(string Text, string Url) : ComponentBase
{
    public string? Target { get; init; }
}

/// <summary>A button dispatching an action (a method name on the view).</summary>
public sealed record Button(string Label, string ActionId) : ComponentBase
{
    public bool Primary { get; init; }

    /// <summary>Extra parameters merged into the dispatched action request (e.g. the conflict
    /// dialog's <c>_forceOverwrite</c>).</summary>
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }
}

/// <summary>An outlined card wrapping a component.</summary>
public sealed record Card : ComponentBase
{
    public string? Title { get; init; }
    public IComponent? Content { get; init; }
}

/// <summary>Lays its children out horizontally.</summary>
public sealed record HorizontalLayout : ComponentBase
{
    public bool Spacing { get; init; } = true;
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>Lays its children out vertically.</summary>
public sealed record VerticalLayout : ComponentBase
{
    public bool Spacing { get; init; }
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>One tab of a <see cref="TabLayout"/>.</summary>
public sealed record TabPanel(string Label, IComponent Content)
{
    /// <summary>When true this tab is the one selected when the strip first renders (instead of the
    /// default first tab). If several tabs set it, the first one wins.</summary>
    public bool Active { get; init; }
}

/// <summary>Semantic relationship between the groups a disclosure layout (tabs, accordion, wizard…)
/// presents, carried next to the concrete widget so renderers can adapt the presentation without
/// losing the intent. (C# analogue of io.mateu.dtos.GroupRelationshipDto.)</summary>
public enum GroupRelationship { Alternative, Sequential, Simultaneous }

/// <summary>A tab strip; the first tab is active by default.</summary>
public sealed record TabLayout : ComponentBase
{
    public IReadOnlyList<TabPanel> Tabs { get; init; } = [];

    /// <summary>The semantic relationship between the tabbed groups; null = unspecified.</summary>
    public GroupRelationship? GroupRelationship { get; init; }

    /// <summary>Whether renderers may swap the concrete widget (e.g. degrade tabs to an accordion
    /// on narrow viewports) as long as the disclosure semantics are preserved.</summary>
    public bool Adaptable { get; init; }
}

// ── Federation ─────────────────────────────────────────────────────────────────

/// <summary>A remote Mateu UI embedded as an island inside this page: the renderer mounts the
/// remote backend's view at BaseUrl/Route and it runs its own sync loop — compose UIs owned by
/// other services without proxying them. (C# analogue of io.mateu.uidl.data.MicroFrontend.)</summary>
public sealed record MicroFrontend(string BaseUrl, string Route = "") : ComponentBase
{
    /// <summary>Extra app state seeded into the island's requests.</summary>
    public object? AppState { get; init; }
}

// ── Overlays ───────────────────────────────────────────────────────────────────

public enum DrawerPosition { Start, End }

/// <summary>A panel sliding in from a viewport edge, returned from any action to open its Content
/// on top of the current page — the side-panel counterpart of <see cref="Dialog"/>. Close it from
/// a later action with <c>UICommandDto.CloseModal(...)</c>; ✕/Esc/backdrop dismiss without a
/// result. (C# analogue of io.mateu.uidl.data.Drawer.)</summary>
public sealed record Drawer : ComponentBase
{
    public string? HeaderTitle { get; init; }
    public IComponent? Header { get; init; }
    public IComponent? Content { get; init; }
    public IComponent? Footer { get; init; }
    public DrawerPosition Position { get; init; } = DrawerPosition.End;
    public string? Width { get; init; }
    public bool NoPadding { get; init; }
    /// <summary>No backdrop — the page behind stays interactive.</summary>
    public bool Modeless { get; init; }
}

/// <summary>A modal window, returned from any action to open its Content on top of the current
/// page. (C# analogue of io.mateu.uidl.data.Dialog.)</summary>
public sealed record Dialog : ComponentBase
{
    public string? HeaderTitle { get; init; }
    public IComponent? Header { get; init; }
    public IComponent? Content { get; init; }
    public IComponent? Footer { get; init; }
    public string? Width { get; init; }
    public string? Height { get; init; }
    public bool NoPadding { get; init; }
    public bool Modeless { get; init; }
    public bool CloseButtonOnHeader { get; init; } = true;
}

// ── [Panel] — archetype tile marker ────────────────────────────────────────────

/// <summary>Marks a component property of an archetype (Dashboard, Foldout, Welcome, ItemOverview)
/// as a titled panel/tile/tab. (C# analogue of io.mateu.uidl.annotations.Panel.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class PanelAttribute : Attribute
{
    public string Title { get; set; } = "";
    public string Subtitle { get; set; } = "";
    public int ColSpan { get; set; } = 1;
    public int RowSpan { get; set; } = 1;
    /// <summary>Icon shown on the panel strip (foldout pages).</summary>
    public string Icon { get; set; } = "";
    /// <summary>Whether the panel starts folded out (foldout pages).</summary>
    public bool Open { get; set; } = true;
}
