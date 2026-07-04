using Mateu.Uidl;

namespace Mateu.Demo;

// A declarative dashboard (the C# analogue of the Java Dashboard archetype):
// consecutive MetricCard properties become a Scoreboard KPI band, [Panel] component
// properties become titled tiles on a responsive grid.
[UI("dashboard"), Title("Sales dashboard")]
public class SalesDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new()
    {
        Title = "Revenue", Value = "1.2", Unit = "M€",
        Trend = MetricTrend.Up, TrendLabel = "+12% vs last month", Icon = "💶",
        ActionId = "openRevenue",
    };

    public MetricCard Orders { get; } = new()
    {
        Title = "Orders", Value = "348", Trend = MetricTrend.Neutral, TrendLabel = "flat", Icon = "📦",
    };

    public MetricCard Refunds { get; } = new()
    {
        Title = "Refunds", Value = "7", Trend = MetricTrend.Down, TrendLabel = "-3 this week", Icon = "↩️",
    };

    [Panel(Title = "Delivery plan", Subtitle = "Q3 roadmap", ColSpan = 2)]
    public Gantt Plan { get; } = new()
    {
        Tasks =
        [
            new GanttTask
            {
                Id = "t1", Title = "Discovery", Start = new DateOnly(2026, 7, 1),
                End = new DateOnly(2026, 7, 15), Progress = 100, Color = "#4caf50",
            },
            new GanttTask
            {
                Id = "t2", Title = "Build", Start = new DateOnly(2026, 7, 10),
                End = new DateOnly(2026, 8, 20), Progress = 40,
            },
            new GanttTask
            {
                Id = "t3", Title = "Rollout", Start = new DateOnly(2026, 8, 15),
                End = new DateOnly(2026, 9, 10), Progress = 0,
            },
        ],
    };

    [Panel(Title = "Alerts")]
    public EmptyState Alerts { get; } = new()
    {
        Icon = "🎉", Title = "No alerts", Description = "Everything is running smoothly.",
        ActionId = "refresh", ActionLabel = "Refresh",
    };

    [Panel(Title = "Loading preview")]
    public Skeleton Loading { get; } = new() { Variant = SkeletonVariant.Card, Count = 2 };

    // Drill-in actions referenced by the tiles above.
    public Message OpenRevenue() => new("Revenue drill-in");
    public Message Refresh() => new("Refreshed");
}

// A declarative Redwood-style foldout page: the first component property is the always-visible
// overview; [Panel] properties are lateral fold-out panels.
[UI("booking"), Title("Booking 2026/0042")]
public class BookingFoldout : Foldout
{
    public Text Overview { get; } = new("Booking 2026/0042 — Miguel Pérez — 2 nights, Deluxe room");

    [Panel(Title = "Guests", Icon = "👥")]
    public Text Guests { get; } = new("Miguel Pérez (adult), Ana Pérez (adult)");

    [Panel(Title = "Payments", Icon = "💳", Open = false)]
    public Text Payments { get; } = new("Deposit 120€ received. Balance due at check-in.");

    [Panel(Title = "History", Icon = "🕓", Open = false)]
    public Text History { get; } = new("Created 2026-06-01, modified 2026-06-20.");
}

// A welcome page: hero + call-to-action buttons + highlight tiles.
[UI("welcome"), Title("Welcome")]
public class WelcomeDemo : Welcome
{
    protected override string? HeroTitle => "Welcome to Mateu.NET";
    protected override string? HeroSubtitle => "The same renderers, now speaking C#";

    public Button GetStarted { get; } = new("Get started", "start") { Primary = true };

    [Panel(Title = "Dashboards")]
    public Text Highlight1 { get; } = new("Scoreboards, metric cards, Gantt charts and tiles.");

    [Panel(Title = "Foldouts")]
    public Text Highlight2 { get; } = new("Redwood-style record pages with lateral panels.");

    public Message Start() => new("Let's go!");
}
