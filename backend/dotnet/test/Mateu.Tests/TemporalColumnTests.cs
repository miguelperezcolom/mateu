using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class Shipment
{
    public string Id { get; set; } = "";
    public DateOnly Added { get; set; }
    public DateTime Updated { get; set; }
    public DateTimeOffset Stamped { get; set; }
    public TimeOnly Opens { get; set; }
    public int Boxes { get; set; }
}

[UI("shipments"), Title("Shipments")]
public class Shipments : Crud<Shipment>
{
    public override IEnumerable<Shipment> Fetch(string? search) =>
        [new() { Id = "1", Added = new DateOnly(2026, 11, 5), Updated = new DateTime(2026, 11, 5, 10, 15, 0), Opens = new TimeOnly(9, 30), Boxes = 3 }];
}

/// <summary>A date / date-time / time property is a column of that dataType (Java's
/// ColumnTypeMapper), so the renderers write it in the UI's locale instead of the ISO text the row
/// carries.</summary>
public class TemporalColumnTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static string ColumnOf(string json, string id)
    {
        var at = json.IndexOf($"\"id\":\"{id}\"", StringComparison.Ordinal);
        Assert.True(at >= 0, json);
        var column = json.Substring(at, Math.Min(400, json.Length - at));
        return column[..column.IndexOf('}')];
    }

    [Theory]
    [InlineData("added", "date")]
    [InlineData("updated", "dateTime")]
    [InlineData("stamped", "dateTime")]
    [InlineData("opens", "time")]
    [InlineData("boxes", "integer")]
    public void A_temporal_property_is_a_column_of_its_data_type(string id, string dataType)
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(Shipments).Assembly))
            .Handle(new RunActionRqDto { Route = "shipments", ConsumedRoute = "shipments" });
        Assert.Contains($"\"dataType\":\"{dataType}\"", ColumnOf(JsonSerializer.Serialize(inc, Json), id));
    }
}
