using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class PricedItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    [Money] public double Price { get; set; }
}

[UI("priced-items"), Title("Priced items")]
public class PricedItems : Crud<PricedItem>
{
    public override IEnumerable<PricedItem> Fetch(string? search) => [new() { Id = "1", Name = "Grinder", Price = 89.5 }];
}

/// <summary>A [Money] property reads as an amount in the crud listing too: its column carries the
/// money stereotype (Java's @Stereotype(money) column), which the renderers write with two decimals
/// in the UI's locale ("89.50").</summary>
public class MoneyColumnTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    [Fact]
    public void A_money_property_is_a_money_column()
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(PricedItems).Assembly))
            .Handle(new RunActionRqDto { Route = "priced-items", ConsumedRoute = "priced-items" });
        var json = JsonSerializer.Serialize(inc, Json);
        var price = json.IndexOf("\"id\":\"price\"", StringComparison.Ordinal);
        Assert.True(price >= 0, json);
        var column = json.Substring(price, Math.Min(400, json.Length - price));
        Assert.Contains("\"stereotype\":\"money\"", column[..column.IndexOf('}')]);
    }
}
