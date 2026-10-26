using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror the Java ArchetypePageHeaderSyncTest fixtures) ───────────

[UI("hdr/plain-dashboard"), Title("Plain ops")]
public class HdrPlainDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new() { Title = "Revenue", Value = "1.2" };
}

[UI("hdr/dashboard"), Title("Ops"), Subtitle("Today at the front desk"), Overline("Hotel Palma")]
public class HdrDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new() { Title = "Revenue", Value = "1.2" };

    [Timestamp("Updated")]
    public string Updated { get; set; } = "10:42";
}

[UI("hdr/item"), Title("Product 42")]
public class HdrItem : ItemOverview, IPeerNavigationSupplier
{
    public IComponent KeyInfo { get; } = new Text("key info") { Id = "key" };

    [Panel(Title = "Stock")]
    public IComponent Stock { get; } = new Text("12 units") { Id = "stock" };

    public PeerNav? Peers() => new(null, "hdr/item/41", null, "hdr/item/43");
}

[UI("hdr/dm"), Title("Schedule"), Subtitle("Week 43")]
public class HdrDataManagement : DataManagement
{
    protected override IComponent GridView() => new Text("the grid") { Id = "grid-view" };
    protected override IComponent GanttView() => new Text("the gantt") { Id = "gantt-view" };
}

/// <summary>The composed archetypes carry the canonical page-header pieces they declare inside a
/// page titled like the view unless the tree names itself; an archetype declaring none renders
/// exactly as before. (Mirror of Java's ArchetypePageHeaderSyncTest.)</summary>
public class ArchetypePageHeaderTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static JsonElement Render(Type viewType) =>
        JsonSerializer.SerializeToElement(
            new SyncHandler(new MateuRegistry(typeof(HdrDashboard).Assembly))
                .Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    private static List<JsonElement> Pages(JsonElement root) =>
        Objects(root).Where(o => o.TryGetProperty("metadata", out var m)
            && m.ValueKind == JsonValueKind.Object
            && m.TryGetProperty("type", out var t) && t.GetString() == "Page")
            .Select(o => o.GetProperty("metadata")).ToList();

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        if (el.ValueKind == JsonValueKind.Object)
        {
            yield return el;
            foreach (var p in el.EnumerateObject())
                foreach (var o in Objects(p.Value)) yield return o;
        }
        else if (el.ValueKind == JsonValueKind.Array)
        {
            foreach (var i in el.EnumerateArray())
                foreach (var o in Objects(i)) yield return o;
        }
    }

    [Fact]
    public void An_archetype_declaring_no_header_piece_gets_no_page() =>
        Assert.Empty(Pages(Render(typeof(HdrPlainDashboard))));

    [Fact]
    public void A_dashboard_carries_its_declared_header_in_a_page_titled_like_the_view()
    {
        var page = Assert.Single(Pages(Render(typeof(HdrDashboard))));
        Assert.Equal("Ops", page.GetProperty("title").GetString());
        Assert.Equal("Today at the front desk", page.GetProperty("subtitle").GetString());
        Assert.Equal("Hotel Palma", page.GetProperty("overline").GetString());
        Assert.Equal("Updated 10:42", page.GetProperty("timestamp").GetString());
    }

    [Fact]
    public void An_item_overview_carries_its_peer_navigation()
    {
        var page = Assert.Single(Pages(Render(typeof(HdrItem))));
        Assert.Equal("hdr/item/43", page.GetProperty("peerNav").GetProperty("nextRoute").GetString());
        Assert.Equal("Product 42", page.GetProperty("title").GetString());
    }

    [Fact]
    public void A_tree_that_names_itself_is_not_titled_twice()
    {
        var page = Assert.Single(Pages(Render(typeof(HdrDataManagement))));
        Assert.Equal(JsonValueKind.Null, page.GetProperty("title").ValueKind);
        Assert.Equal("Week 43", page.GetProperty("subtitle").GetString());
    }
}
