using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror Java's DragAndDropSyncTest) ──

public class DndCharge
{
    public string Id { get; set; } = "";
    public string Description { get; set; } = "";
    public double Amount { get; set; }
}

[UI("dnd-charges"), DragRows("charge")]
public class DndWindowCharges : IListing<DndCharge>
{
    public ListingData<DndCharge> Search(SearchRequest request) => ListingData.From(new List<DndCharge>
    {
        new() { Id = "c1", Description = "Minibar", Amount = 12 },
        new() { Id = "c2", Description = "Spa", Amount = 80 },
    });
}

[UI("dnd-plain")]
public class DndPlainCharges : IListing<DndCharge>
{
    public ListingData<DndCharge> Search(SearchRequest request) => ListingData.From(new List<DndCharge>());
}

[UI("dnd-windows"), Title("Windows")]
public class DndWindows : IComponentTreeSupplier
{
    public IComponent Component() => new DropZone
    {
        Id = "window2",
        Accept = "charge",
        ActionId = "moveCharges",
        Parameters = new Dictionary<string, object?> { ["window"] = 2 },
        Title = "Window 2",
        Subtitle = "Guest (cash)",
        Content = [new Text("Balance 0.00 €")],
    };

    [Action]
    public Message MoveCharges(RunActionRqDto rq)
    {
        string P(string k) => rq.Parameters.TryGetValue(k, out var v)
            ? v switch
            {
                JsonElement { ValueKind: JsonValueKind.Array } a =>
                    "[" + string.Join(", ", a.EnumerateArray().Select(e => e.ToString())) + "]",
                JsonElement e => e.ToString(),
                _ => v?.ToString() ?? "",
            }
            : "";
        return new Message($"{P("_dragType")} {P("_draggedIds")} → window {P("window")}");
    }
}

/// <summary>Dragging listing rows onto a drop zone: [DragRows(type)] makes the listing's rows
/// draggable (CrudMetadataDto.DragType); a DropZone accepts a type and carries its action,
/// parameters and content; the drop runs that action with the dragged ids and the zone's parameters.</summary>
public class DragAndDropTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(DndWindows).Assembly));

    private static JsonElement Sync(Type view) => JsonSerializer.SerializeToElement(
        Handler().Handle(new RunActionRqDto { ServerSideType = view.FullName }), Json);

    private static IEnumerable<JsonElement> OfType(JsonElement root, string type) => Objects(root)
        .Where(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == type);

    [Fact]
    public void Drag_rows_makes_the_listing_draggable()
    {
        var crud = OfType(Sync(typeof(DndWindowCharges)), "Crud").First();
        Assert.Equal("charge", crud.GetProperty("dragType").GetString());
        var plain = OfType(Sync(typeof(DndPlainCharges)), "Crud").First();
        Assert.Equal(JsonValueKind.Null, plain.GetProperty("dragType").ValueKind);
    }

    [Fact]
    public void A_drop_zone_travels_with_its_action_parameters_and_content()
    {
        var root = Sync(typeof(DndWindows));
        var zone = Assert.Single(OfType(root, "DropZone"));
        Assert.Equal("charge", zone.GetProperty("accept").GetString());
        Assert.Equal("moveCharges", zone.GetProperty("actionId").GetString());
        Assert.Equal(2, zone.GetProperty("parameters").GetProperty("window").GetInt32());
        Assert.Equal("Window 2", zone.GetProperty("title").GetString());
        Assert.Equal("Guest (cash)", zone.GetProperty("subtitle").GetString());
        Assert.Contains("Balance 0.00 €",
            OfType(root, "Text").Select(t => t.GetProperty("text").GetString()));
    }

    [Fact]
    public void The_drop_runs_the_zone_action_with_the_dragged_ids()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "dnd-windows",
            ActionId = "moveCharges",
            ServerSideType = typeof(DndWindows).FullName,
            InitiatorComponentId = "cmp-1",
            Parameters = new Dictionary<string, object?>
            {
                ["window"] = JsonSerializer.SerializeToElement(2),
                ["_dragType"] = JsonSerializer.SerializeToElement("charge"),
                ["_draggedIds"] = JsonSerializer.SerializeToElement(new[] { "c1", "c2" }),
            },
        });
        Assert.Equal("charge [c1, c2] → window 2", Assert.Single(inc.Messages).Text);
    }

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
