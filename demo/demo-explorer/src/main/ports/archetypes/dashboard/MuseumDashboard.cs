// The C# twin (Mateu.NET): the same archetype — MetricCard properties form the KPI band,
// [Panel] properties the tiles; a card's ActionId runs the method of that name.
using Mateu.Uidl;

[UI("dashboard"), Title("Museum operations")]
public class MuseumDashboard : Dashboard
{
    public MetricCard Visitors { get; } = new()
    {
        Title = "Visitors", Value = "48,210", Trend = MetricTrend.Up, TrendLabel = "+6% vs last month",
        Timeframe = "This month", ActionId = "drillIntoVisitors",
    };

    public MetricCard Loans { get; } = new() { Title = "Active loans", Value = "37", Timeframe = "Today" };

    [Panel(Title = "Visitors per museum", Subtitle = "Last 30 days", ColSpan = 2)]
    public Chart PerMuseum { get; } = new()
    {
        ChartType = "bar",
        ChartData = new ChartData
        {
            Labels = ["The Met", "SMK", "Cleveland"],
            Datasets = [new ChartDataset { Label = "Visitors", Data = [26400, 9800, 12010] }],
        },
    };

    public Message DrillIntoVisitors() => new("Drilling into visitors…");
}
