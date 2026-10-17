using System.Numerics;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("more-field-types")]
public class MoreFieldTypesForm
{
    public BigInteger Big { get; set; } = BigInteger.Parse("12345678901234567890");
    public DateTime When { get; set; } = new(2026, 10, 17, 10, 15, 30);
    public DateTimeOffset Zoned { get; set; } = new(2026, 10, 17, 10, 15, 30, TimeSpan.Zero);
    public TimeOnly At { get; set; } = new(9, 30);
    public string Name { get; set; } = "Ada";

    [Button] public Message Echo() =>
        new($"{Big}|{Name}|{When:yyyy-MM-ddTHH:mm:ss}|{Zoned.ToLocalTime():yyyy-MM-ddTHH:mm:ss}|{At:HH:mm}");
}

/// <summary>Java's MoreFieldTypesSyncTest in the port: a date-time keeps its time (it was mapped as
/// a DATE and the time was lost on the round trip), a time is a time and a BigInteger an integer.</summary>
public class MoreFieldTypesTests
{
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(MoreFieldTypesForm).Assembly));

    private static JsonNode Wire(UIIncrementDto increment) =>
        JsonSerializer.SerializeToNode(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

    private static JsonObject Field(JsonNode root, string id)
    {
        JsonObject? found = null;
        void Walk(JsonNode? node)
        {
            switch (node)
            {
                case JsonObject o:
                    if ((string?)o["type"] == "FormField" && (string?)o["fieldId"] == id) found ??= o;
                    foreach (var (_, v) in o) Walk(v);
                    break;
                case JsonArray a:
                    foreach (var v in a) Walk(v);
                    break;
            }
        }
        Walk(root);
        Assert.NotNull(found);
        return found!;
    }

    [Fact]
    public void Each_type_maps_to_its_wire_data_type_and_value()
    {
        var root = Wire(Handler.Handle(new RunActionRqDto { Route = "more-field-types", ConsumedRoute = "more-field-types" }));
        Assert.Equal("integer", (string?)Field(root, "big")["dataType"]);
        Assert.Equal("dateTime", (string?)Field(root, "when")["dataType"]);
        Assert.Equal("dateTime", (string?)Field(root, "zoned")["dataType"]);
        Assert.Equal("time", (string?)Field(root, "at")["dataType"]);
        var json = root.ToJsonString();
        Assert.Contains("\"when\":\"2026-10-17T10:15:30\"", json);
        Assert.Contains("\"at\":\"09:30\"", json);
    }

    [Fact]
    public void Their_values_round_trip_through_an_action()
    {
        var inc = Handler.Handle(new RunActionRqDto
        {
            Route = "more-field-types",
            ActionId = "echo",
            ServerSideType = typeof(MoreFieldTypesForm).FullName,
            ComponentState = new()
            {
                ["big"] = JsonSerializer.SerializeToElement("98765432109876543210"),
                ["name"] = JsonSerializer.SerializeToElement("Grace"),
                ["when"] = JsonSerializer.SerializeToElement("2026-01-02T03:04:05"),
                ["zoned"] = JsonSerializer.SerializeToElement("2026-01-02T03:04:05"),
                ["at"] = JsonSerializer.SerializeToElement("18:45"),
            },
        });
        Assert.Equal("98765432109876543210|Grace|2026-01-02T03:04:05|2026-01-02T03:04:05|18:45",
            inc.Messages.Single().Text);
    }
}
