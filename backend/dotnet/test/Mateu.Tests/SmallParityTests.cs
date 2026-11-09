using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("labelled-overview")]
public class LabelledOverview : GeneralOverview<string>
{
    protected override string RecordLabel => "Requisition";
    protected override IReadOnlyList<Option> SwitcherOptions() => [new Option("r1", "Requisition 1")];
    protected override string? Load(string id) => id;
    protected override IComponent Overview(string row) => new Text(row);
}

public class HeroHotelFilters
{
    public string? City { get; set; }
    public bool Pool { get; set; }
}

public class HeroHotelRow
{
    public string Name { get; set; } = "";
    public string City { get; set; } = "";
}

[UI("hotel-hero"), Title("Hotels")]
public class HotelHero : HeroSearch<HeroHotelFilters, HeroHotelRow>
{
    public override string? HeroTitle() => "Find a hotel";
    public override ListingData<HeroHotelRow> Search(SearchRequest request) =>
        ListingData.From([new HeroHotelRow { Name = "Ritz", City = request.Filters<HeroHotelFilters>()?.City ?? "" }]);
}

/// <summary>Smaller parity items: GeneralOverview.RecordLabel and a HeroSearch over a declarative
/// listing with its own filters type (Java's HeroSearch&lt;Filters, Row&gt;).</summary>
public class SmallParityTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(SmallParityTests).Assembly));

    private static IEnumerable<JsonObject> Objects(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                foreach (var x in Objects(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var v in a)
                foreach (var x in Objects(v)) yield return x;
                break;
        }
    }

    private static JsonNode Load(string route) =>
        JsonSerializer.SerializeToNode(Handler.Handle(new RunActionRqDto { Route = route }), Json)!;

    [Fact]
    public void The_record_switcher_carries_its_label()
    {
        var field = Objects(Load("labelled-overview")).Single(o => (string?)o["metadata"]?["fieldId"] == "record");
        Assert.Equal("Requisition", (string?)field["metadata"]!["label"]);
    }

    [Fact]
    public void A_hero_search_over_a_filters_type_draws_the_hero_the_facets_and_cards_and_starts_empty()
    {
        var root = Load("hotel-hero");
        var component = root["fragments"]![0]!["component"]!.AsObject();
        Assert.Contains(Objects(component), o => (string?)o["metadata"]?["type"] == "HeroSection"
                                                && (string?)o["metadata"]?["title"] == "Find a hotel");
        var crud = Objects(component).Single(o => (string?)o["metadata"]?["type"] == "Crud")["metadata"]!;
        Assert.Equal("cards", (string?)crud["gridLayout"]);
        Assert.Equal(["city", "pool"], crud["filters"]!.AsArray().Select(f => (string?)f!["fieldId"]));
        Assert.DoesNotContain(component["triggers"]!.AsArray(), t => (string?)t!["actionId"] == "search");
        Assert.Equal("landing", (string?)component["pageType"]);

        var found = JsonSerializer.SerializeToNode(Handler.Handle(new RunActionRqDto
        {
            Route = "hotel-hero", ActionId = "search", ServerSideType = typeof(HotelHero).FullName,
            ComponentState = new() { ["city"] = JsonSerializer.SerializeToElement("Madrid") },
        }), Json)!;
        Assert.Contains(Objects(found), o => (string?)o["city"] == "Madrid");
    }
}
