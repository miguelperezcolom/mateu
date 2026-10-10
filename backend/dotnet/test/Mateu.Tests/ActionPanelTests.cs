using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The categorised action panel ("I want to…") in a component-tree view — mirrors the
/// Java ActionPanelSyncTest fixture.</summary>
[UI("action-panel")]
public class ActionPanelView : IComponentTreeSupplier
{
    public IComponent Component() => new ActionPanel
    {
        Shortcut = "ctrl+i",
        HideUnpopulatedToggle = true,
        Categories =
        [
            new ActionPanelCategory("Modify")
            {
                Actions =
                [
                    new ActionPanelItem("Check out", "checkOut"),
                    new ActionPanelItem("Traces", "traces") { Count = 3 },
                ],
            },
            new ActionPanelCategory("Go to")
            {
                Actions =
                [
                    new ActionPanelItem("Billing", "goTo")
                    {
                        Parameters = new Dictionary<string, object?> { ["target"] = "billing" },
                        Populated = true,
                    },
                    new ActionPanelItem("Reinstate", "reinstate") { Disabled = true },
                ],
            },
        ],
    };
}

/// <summary>Categories travel in order with their actions, a count implies populated, and the
/// defaults (label, 10 per column) are filled on the server so every renderer gets the same panel.</summary>
public class ActionPanelTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    [Fact]
    public void Panel_travels_with_its_categories_and_defaults()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(ActionPanelView).Assembly));
        var root = JsonSerializer.SerializeToElement(
            handler.Handle(new RunActionRqDto { ServerSideType = typeof(ActionPanelView).FullName }), Json);

        var panels = Objects(root)
            .Where(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                        && t.GetString() == "ActionPanel")
            .ToList();
        var panel = Assert.Single(panels);
        Assert.Equal("I want to…", panel.GetProperty("label").GetString());
        Assert.Equal("ctrl+i", panel.GetProperty("shortcut").GetString());
        Assert.Equal(10, panel.GetProperty("maxPerCategory").GetInt32());
        Assert.True(panel.GetProperty("hideUnpopulatedToggle").GetBoolean());

        var categories = panel.GetProperty("categories").EnumerateArray().ToList();
        Assert.Equal(["Modify", "Go to"], categories.Select(c => c.GetProperty("title").GetString()));

        var modify = categories[0].GetProperty("actions").EnumerateArray().ToList();
        Assert.Equal(["checkOut", "traces"], modify.Select(a => a.GetProperty("actionId").GetString()));
        Assert.Equal([false, true], modify.Select(a => a.GetProperty("populated").GetBoolean()));
        Assert.Equal(3, modify[1].GetProperty("count").GetInt32());

        var goTo = categories[1].GetProperty("actions").EnumerateArray().ToList();
        Assert.Equal("billing", goTo[0].GetProperty("parameters").GetProperty("target").GetString());
        Assert.True(goTo[1].GetProperty("disabled").GetBoolean());
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
