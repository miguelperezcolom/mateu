using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class RnItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";

    public static List<RnItem> All() =>
        Enumerable.Range(0, 5).Select(i => new RnItem { Id = $"{i}", Name = $"Item {i}" }).ToList();
}

[UI("rn-crud")]
public class RnCrud : Crud<RnItem>
{
    public override IEnumerable<RnItem> Fetch(string? search) => RnItem.All();
    public override RnItem? Get(string id) => null;
    public override void Save(RnItem entity) { }
    public override void Delete(string id) { }
}

[UI("rn-listing")]
public class RnListing : IListing<RnItem>
{
    public ListingData<RnItem> Search(SearchRequest request) => ListingData.From(RnItem.All());
}

[UI("rn-pushdown")]
public class RnPagedListing : IListing<RnItem>
{
    public ListingData<RnItem> Search(SearchRequest request) =>
        new(RnItem.All().Skip(request.Pageable.Page * request.Pageable.Size).Take(request.Pageable.Size).ToList(), 5);
}

/// <summary>Every row of a listing page carries <c>_rowNumber</c> — its position in the whole result
/// — because the web grid tells rows apart by it (<c>item-id-path="_rowNumber"</c>): without it
/// selection and the active row compared undefined ids. Java's DataMapper stamps every page.</summary>
public class ListingRowNumberTests
{
    private static List<int> Numbers(Type view, int page, int size)
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(RnCrud).Assembly)).Handle(new RunActionRqDto
        {
            ServerSideType = view.FullName,
            ActionId = "search",
            ComponentState = new Dictionary<string, object?> { ["page"] = page, ["size"] = size },
        });
        var json = JsonNode.Parse(JsonSerializer.Serialize(inc, new JsonSerializerOptions(JsonSerializerDefaults.Web)))!;
        return json["fragments"]![0]!["data"]!["crud"]!["page"]!["content"]!.AsArray()
            .Select(r => r!["_rowNumber"]!.GetValue<int>()).ToList();
    }

    [Fact]
    public void A_crud_page_numbers_its_rows_from_the_page_start() =>
        Assert.Equal([2, 3], Numbers(typeof(RnCrud), 1, 2));

    [Fact]
    public void A_listing_page_numbers_its_rows_from_the_page_start() =>
        Assert.Equal([4], Numbers(typeof(RnListing), 2, 2));

    [Fact]
    public void A_listing_that_pages_itself_numbers_its_window_too() =>
        Assert.Equal([3, 4], Numbers(typeof(RnPagedListing), 1, 3));
}
