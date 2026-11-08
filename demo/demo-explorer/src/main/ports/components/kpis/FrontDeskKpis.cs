// The C# twin (Mateu.NET): the same KPIs as a component tree. A MetricCard or a Stat with an
// ActionId is clickable; the method of that name (PascalCase) runs on the server.
using Mateu.Uidl;

[UI("front-desk-kpis"), Title("Front desk")]
public class FrontDeskKpis : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Spacing = true,
        Content =
        [
            new Scoreboard
            {
                Metrics =
                [
                    new MetricCard
                    {
                        Title = "Arrivals", Value = "42", Trend = MetricTrend.Up, TrendLabel = "+6 vs yesterday",
                        Timeframe = "Today", ActionId = "openArrivals",
                    },
                    new MetricCard { Title = "In house", Value = "196", Unit = "guests", Timeframe = "Now" },
                ],
            },
            new Stat
            {
                Label = "Room revenue", Value = "184,320", Unit = "€", Delta = "+12%", Trend = "up",
                Spark = [120, 135, 128, 150, 162, 171, 184], ActionId = "openRevenue",
            },
            new Meter { Label = "Credit used", Value = 1180, Max = 1500, Unit = "€", WarnAt = 1050, DangerAt = 1350 },
            new ComparisonCard
            {
                Title = "ADR", LeftLabel = "Nov 2025", LeftValue = "€ 131",
                RightLabel = "Nov 2026", RightValue = "€ 142", Delta = "+8.4%", Trend = "up",
            },
        ],
    };

    public Message OpenArrivals() => new("42 arrivals today — 9 already checked in");

    public Message OpenRevenue() => new("Room revenue by segment: direct 41%, OTA 38%, corporate 21%");
}
