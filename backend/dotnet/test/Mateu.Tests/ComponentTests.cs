using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Views under test ──────────────────────────────────────────────────────────

[UI("dash"), Title("Dash")]
public class Dash : Dashboard
{
    protected override int Columns => 3;

    public MetricCard Revenue { get; } = new()
    {
        Title = "Revenue", Value = "1.2", Unit = "M",
        Trend = MetricTrend.Up, TrendLabel = "12% more", Icon = "euro",
        Description = "Total revenue", ActionId = "openRevenue",
    };

    public MetricCard Orders { get; } = new() { Title = "Orders", Value = "348", Trend = MetricTrend.Down };

    [Panel(Title = "Plan", Subtitle = "Q3", ColSpan = 2, RowSpan = 1)]
    public Gantt Plan { get; } = new()
    {
        Tasks =
        [
            new GanttTask
            {
                Id = "t1", Title = "Build", Start = new DateOnly(2026, 7, 1),
                End = new DateOnly(2026, 8, 15), Progress = 60.5, Color = "#4caf50",
            },
        ],
    };

    [Panel(Title = "Board")]
    public Kanban Board { get; } = new()
    {
        Columns =
        [
            new KanbanColumn
            {
                Id = "todo", Title = "To do", Color = "#94a3b8",
                Cards = [new KanbanCard { Id = "c1", Title = "Task A", Badge = "3" }],
            },
            new KanbanColumn
            {
                Id = "doing", Title = "Doing",
                Cards = [new KanbanCard { Id = "c2", Title = "Task B", Description = "in flight", ActionId = "openCard" }],
            },
        ],
    };

    [Panel(Title = "Board")]
    public Timeline Feed { get; } = new()
    {
        Items =
        [
            new TimelineItem { Id = "e1", Title = "Order placed", Timestamp = "09:00", Icon = "cart" },
            new TimelineItem { Id = "e2", Title = "Shipped", Description = "Tracking #ABC", Timestamp = "14:20", Color = "#10b981", ActionId = "openShipment" },
        ],
    };

    [Panel] // title defaults to the humanized property name
    public EmptyState Alerts { get; } = new()
    {
        Icon = "party", Title = "No alerts", Description = "All good.",
        ActionId = "refresh", ActionLabel = "Refresh",
    };

    public Skeleton Loading { get; } = new() { Variant = SkeletonVariant.Grid, Count = 5 };

    public Message OpenRevenue() => new("drill-in");
    public Message Refresh() => new("refreshed");
}

[UI("fold"), Title("Fold")]
public class Fold : Foldout
{
    public Text Overview { get; } = new("the record overview");

    [Panel(Title = "Guests", Icon = "people")]
    public Text Guests { get; } = new("guest list");

    [Panel(Title = "Payments", Subtitle = "Money", Open = false)]
    public Text Payments { get; } = new("payment info");
}

[UI("greet-page"), Title("Greet page")]
public class WelcomePage : Welcome
{
    protected override string? HeroTitle => "Hello there";
    protected override string? HeroSubtitle => "Start here";
    protected override string? HeroImage => "https://img/hero.jpg";

    public Button Start { get; } = new("Get started", "go") { Primary = true };

    [Panel(Title = "Feature A")]
    public Text A { get; } = new("does A");

    public Message Go() => new("gone");
}

[UI("item"), Title("Item")]
public class Item : ItemOverview
{
    public Text KeyInfo { get; } = new("the key info");

    [Panel(Title = "Details")]
    public Text Details { get; } = new("the details");

    [Panel(Title = "History")]
    public Text History { get; } = new("the history");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

public class ComponentTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(Dash).Assembly));

    private static string RenderView(Type viewType) =>
        JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    [Fact]
    public void Dashboard_emits_scoreboard_band_panels_and_grid()
    {
        var json = RenderView(typeof(Dash));

        // The grid, with the fixed column count.
        Assert.Contains("\"type\":\"DashboardLayout\"", json);
        Assert.Contains("\"columns\":3", json);

        // Consecutive MetricCards grouped into one Scoreboard band.
        Assert.Contains("\"type\":\"Scoreboard\"", json);
        Assert.Contains("\"type\":\"MetricCard\"", json);
        Assert.Contains("\"title\":\"Revenue\"", json);
        Assert.Contains("\"value\":\"1.2\"", json);
        Assert.Contains("\"trend\":\"up\"", json);
        Assert.Contains("\"trend\":\"down\"", json);
        Assert.Contains("\"trendLabel\":\"12% more\"", json);
        Assert.Contains("\"description\":\"Total revenue\"", json);
        Assert.Contains("\"actionId\":\"openRevenue\"", json);

        // [Panel] wraps the component in a DashboardPanel tile (title/subtitle/spans in metadata).
        Assert.Contains("\"type\":\"DashboardPanel\"", json);
        Assert.Contains("\"title\":\"Plan\"", json);
        Assert.Contains("\"subtitle\":\"Q3\"", json);
        Assert.Contains("\"colSpan\":2", json);
        Assert.Contains("\"rowSpan\":1", json);
        Assert.Contains("\"title\":\"Alerts\"", json); // [Panel] title defaulted from the property name

        // EmptyState and Skeleton tiles.
        Assert.Contains("\"type\":\"EmptyState\"", json);
        Assert.Contains("\"actionLabel\":\"Refresh\"", json);
        Assert.Contains("\"type\":\"Skeleton\"", json);
        Assert.Contains("\"variant\":\"grid\"", json);
        Assert.Contains("\"count\":5", json);

        // Tile actionIds are advertised so the renderer routes them back.
        Assert.Contains("{\"id\":\"openRevenue\"", json);
        Assert.Contains("{\"id\":\"refresh\"", json);
    }

    [Fact]
    public void Gantt_emits_tasks_with_iso_dates_and_progress()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Gantt\"", json);
        Assert.Contains("\"tasks\":[{", json);
        Assert.Contains("\"id\":\"t1\"", json);
        Assert.Contains("\"title\":\"Build\"", json);
        Assert.Contains("\"start\":\"2026-07-01\"", json);
        Assert.Contains("\"end\":\"2026-08-15\"", json);
        Assert.Contains("\"progress\":60.5", json);
        Assert.Contains("\"color\":\"#4caf50\"", json);
    }

    [Fact]
    public void Kanban_emits_columns_and_cards()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Kanban\"", json);
        Assert.Contains("\"columns\":[{", json);
        Assert.Contains("\"title\":\"To do\"", json);
        Assert.Contains("\"color\":\"#94a3b8\"", json);
        Assert.Contains("\"badge\":\"3\"", json);
        Assert.Contains("\"actionId\":\"openCard\"", json);
    }

    [Fact]
    public void Timeline_emits_items()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Timeline\"", json);
        Assert.Contains("\"items\":[{", json);
        Assert.Contains("\"title\":\"Order placed\"", json);
        Assert.Contains("\"timestamp\":\"14:20\"", json);
        Assert.Contains("\"actionId\":\"openShipment\"", json);
    }

    [Fact]
    public void Metric_card_action_is_dispatched_by_method_name()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "openRevenue",
            ServerSideType = typeof(Dash).FullName,
        });
        Assert.Equal("drill-in", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Foldout_emits_panel_headers_and_slotted_children()
    {
        var json = RenderView(typeof(Fold));

        Assert.Contains("\"type\":\"FoldoutLayout\"", json);

        // Panel headers ride in the metadata.
        Assert.Contains("\"panels\":[{", json);
        Assert.Contains("\"title\":\"Guests\"", json);
        Assert.Contains("\"icon\":\"people\"", json);
        Assert.Contains("\"open\":true", json);
        Assert.Contains("\"title\":\"Payments\"", json);
        Assert.Contains("\"subtitle\":\"Money\"", json);
        Assert.Contains("\"open\":false", json);

        // The overview and each panel's content travel as slotted children.
        Assert.Contains("\"slot\":\"overview\"", json);
        Assert.Contains("\"slot\":\"panel-0\"", json);
        Assert.Contains("\"slot\":\"panel-1\"", json);
        Assert.Contains("the record overview", json);
        Assert.Contains("guest list", json);
        Assert.Contains("payment info", json);
    }

    [Fact]
    public void Welcome_emits_hero_with_ctas_and_highlight_grid()
    {
        var json = RenderView(typeof(WelcomePage));

        Assert.Contains("\"type\":\"HeroSection\"", json);
        Assert.Contains("\"title\":\"Hello there\"", json);
        Assert.Contains("\"subtitle\":\"Start here\"", json);
        Assert.Contains("\"image\":\"https://img/hero.jpg\"", json);
        Assert.Contains("\"centered\":true", json);

        // The CTA button rides inside the hero; its action is advertised and dispatchable.
        Assert.Contains("\"label\":\"Get started\"", json);
        Assert.Contains("\"actionId\":\"go\"", json);

        // Highlight tiles on a DashboardLayout below.
        Assert.Contains("\"type\":\"DashboardLayout\"", json);
        Assert.Contains("\"title\":\"Feature A\"", json);

        var inc = Handler().Handle(new RunActionRqDto { ActionId = "go", ServerSideType = typeof(WelcomePage).FullName });
        Assert.Equal("gone", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Item_overview_emits_sticky_key_info_card_and_tabs()
    {
        var json = RenderView(typeof(Item));

        Assert.Contains("\"type\":\"HorizontalLayout\"", json);
        Assert.Contains("\"type\":\"Card\"", json);
        Assert.Contains("position: sticky", json);
        Assert.Contains("\"type\":\"TabLayout\"", json);
        Assert.Contains("\"label\":\"Details\"", json);
        Assert.Contains("\"label\":\"History\"", json);
        Assert.Contains("the key info", json);
    }

    [Fact]
    public void Fluent_components_map_to_the_exact_java_wire_shape()
    {
        // Byte-shape check of a hand-built tree against the Java reference JSON.
        var dto = ComponentMapper.Map(new Scoreboard
        {
            Id = "board",
            Metrics =
            [
                new MetricCard { Title = "Occupancy", Value = "87", Unit = "%", Trend = MetricTrend.Up },
            ],
        });
        var json = JsonSerializer.Serialize<ComponentDto>(dto, new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        });

        Assert.Equal(
            "{\"type\":\"ClientSide\",\"metadata\":{\"type\":\"Scoreboard\"},\"id\":\"board\",\"children\":[" +
            "{\"type\":\"ClientSide\",\"metadata\":{\"type\":\"MetricCard\",\"title\":\"Occupancy\",\"value\":\"87\"," +
            "\"unit\":\"%\",\"trend\":\"up\",\"trendLabel\":null,\"icon\":null,\"description\":null,\"actionId\":null}," +
            "\"id\":null,\"children\":[],\"style\":null,\"cssClasses\":null,\"slot\":null}]," +
            "\"style\":null,\"cssClasses\":null,\"slot\":null}",
            json);
    }
}
