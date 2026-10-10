using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>A rate shown with a hover popover (its breakdown) next to a legacy click popover.</summary>
[UI("hover-popover"), Title("Rate")]
public class HoverRatePage : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content =
        [
            new Popover
            {
                Id = "rateInfo",
                Trigger = PopoverTrigger.Hover,
                Wrapped = new Text("BAR 134 €") { Id = "rateLink" },
                Content = new Text("Sat 10: 134 € · Sun 11: 120 €") { Id = "rateBreakdown" },
            },
            new Popover { Wrapped = new Text("wrapped"), Content = new Text("content") },
        ],
    };
}

public class HoverStay
{
    public string Id { get; set; } = "";
    public string Guest { get; set; } = "";
    [Tooltip("breakdown")] public double Rate { get; set; }
    public string Breakdown { get; set; } = "";
}

[UI("hover-tooltip"), Title("Stays")]
public class HoverStays : IListing<HoverStay>
{
    public ListingData<HoverStay> Search(SearchRequest request) => ListingData.From(new[]
    {
        new HoverStay { Id = "1", Guest = "Brown", Rate = 134, Breakdown = "Sat 10: 134 €\nSun 11: 120 €" },
    });
}

/// <summary>Hover details — mirrors Java's PopoverAndTooltipSyncTest: a Popover carries its trigger
/// (click by default, hover for read-only details) and its own id, and [Tooltip("otherField")] on a
/// listing row property makes its cell show another field of the row (the column's tooltipPath).</summary>
public class PopoverAndTooltipTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static JsonElement Load(Type ui, string route) =>
        JsonSerializer.SerializeToElement(
            new SyncHandler(new MateuRegistry(typeof(HoverStays).Assembly)).Handle(new RunActionRqDto
            {
                Route = route, ConsumedRoute = route, ServerSideType = ui.FullName, ActionId = "",
                InitiatorComponentId = "hover_app",
                ComponentState = new Dictionary<string, object?>(),
                Parameters = new Dictionary<string, object?>(),
            }), Json);

    private static IEnumerable<JsonElement> Walk(JsonElement e)
    {
        if (e.ValueKind == JsonValueKind.Object)
        {
            yield return e;
            foreach (var p in e.EnumerateObject())
                foreach (var c in Walk(p.Value)) yield return c;
        }
        else if (e.ValueKind == JsonValueKind.Array)
            foreach (var i in e.EnumerateArray())
                foreach (var c in Walk(i)) yield return c;
    }

    [Fact]
    public void A_popover_carries_its_trigger_and_id()
    {
        var components = Walk(Load(typeof(HoverRatePage), "/hover-popover"))
            .Where(o => o.TryGetProperty("metadata", out var m) && m.ValueKind == JsonValueKind.Object
                        && m.TryGetProperty("type", out var t) && t.GetString() == "Popover")
            .ToList();

        Assert.Equal(["hover", "click"],
            components.Select(c => c.GetProperty("metadata").GetProperty("trigger").GetString()));
        Assert.Equal(["rateInfo", "fieldId"], components.Select(c => c.GetProperty("id").GetString()));
    }

    [Fact]
    public void A_tooltip_column_points_at_the_other_field()
    {
        var columns = Walk(Load(typeof(HoverStays), "/hover-tooltip"))
            .Where(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                        && t.GetString() == "GridColumn")
            .ToList();

        Assert.NotEmpty(columns);
        Assert.Equal("breakdown", columns.Single(c => c.GetProperty("id").GetString() == "rate")
            .GetProperty("tooltipPath").GetString());
        Assert.Equal(JsonValueKind.Null, columns.Single(c => c.GetProperty("id").GetString() == "guest")
            .GetProperty("tooltipPath").ValueKind);
    }
}
