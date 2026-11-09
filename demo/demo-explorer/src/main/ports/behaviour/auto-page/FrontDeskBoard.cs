// The C# twin (Mateu.NET): a plain class (no Dashboard base) whose MetricCard properties make
// page inference compose a dashboard; [AutoPage] makes it explicit.
using Mateu.Uidl;

[UI("front-desk-board"), Title("Front desk board"), AutoPage]
public class FrontDeskBoard
{
    public MetricCard Arrivals { get; } = new()
    {
        Title = "Arrivals", Value = "12", Trend = MetricTrend.Up, Timeframe = "today", ActionId = "openArrivals",
    };

    public MetricCard Departures { get; } = new() { Title = "Departures", Value = "9", Timeframe = "today" };

    [Panel(Title = "Notes")] public Text Notes { get; } = new("Two VIPs arriving at noon.");

    public Message OpenArrivals() => new("Drilling into today's 12 arrivals");
}
