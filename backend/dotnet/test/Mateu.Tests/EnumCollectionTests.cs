using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public enum RoomPreference { HighFloor, QuietRoom, NearLift }

[UI("enum-collections")]
public class EnumCollectionsView
{
    public List<RoomPreference> Preferences { get; set; } = [];
}

/// <summary>A List&lt;Enum&gt; with no stereotype is a multi-select of the enum's constants (Java's
/// ChoiceCollections; owner, 2026-10-12): it rendered as a grid of the enum's own properties.</summary>
public class EnumCollectionTests
{
    [Fact]
    public void A_list_of_enums_with_no_stereotype_is_a_multi_select()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(EnumCollectionsView).Assembly));
        var increment = handler.Handle(new RunActionRqDto { Route = "enum-collections", ConsumedRoute = "enum-collections" });
        var root = JsonSerializer.SerializeToNode(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        JsonObject? field = null;
        void Walk(JsonNode? node)
        {
            switch (node)
            {
                case JsonObject o:
                    if ((string?)o["type"] == "FormField" && (string?)o["fieldId"] == "preferences") field = o;
                    foreach (var (_, v) in o) Walk(v);
                    break;
                case JsonArray a:
                    foreach (var v in a) Walk(v);
                    break;
            }
        }
        Walk(root);
        Assert.NotNull(field);
        Assert.Equal("multiSelect", (string?)field!["stereotype"]);
        Assert.Equal(new[] { "HighFloor", "QuietRoom", "NearLift" },
            field["options"]!.AsArray().Select(o => (string)o!["value"]!).ToArray());
    }
}
