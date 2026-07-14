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

/// <summary>A read-only horizontal progress indicator: numbered steps joined by a connector.</summary>
public sealed record ProgressSteps : ComponentBase
{
    public IReadOnlyList<Step> Steps { get; init; } = [];
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

// ── Generic building blocks (used by archetypes and free composition) ──────────

/// <summary>A plain text block.</summary>
public sealed record Text(string Content) : ComponentBase;

/// <summary>A button dispatching an action (a method name on the view).</summary>
public sealed record Button(string Label, string ActionId) : ComponentBase
{
    public bool Primary { get; init; }
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
