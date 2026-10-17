using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class Gadget
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("gadgets"), Title("Gadgets")]
public class Gadgets : Crud<Gadget>
{
    public static readonly List<Gadget> Store = [];

    public override IEnumerable<Gadget> Fetch(string? search) => Store;
    public override Gadget? Get(string id) => Store.FirstOrDefault(g => g.Id == id);
    public override void Save(Gadget gadget) { Store.RemoveAll(g => g.Id == gadget.Id); Store.Add(gadget); }
    public override void Delete(string id) => Store.RemoveAll(g => g.Id == id);
}

/// <summary>The two listing actions a plain Crud advertises but used to drop: the id column is a
/// link to the record ("view" → its route), and Delete on the LISTING deletes the rows selected in
/// the grid (it used to answer nothing unless the route named a record). The wire of the listing
/// itself is pinned by the conformance corpus (conformance/cases/crud).</summary>
public class CrudListingActionsTests
{
    private static UIIncrementDto Run(string actionId, Dictionary<string, object?>? parameters = null,
        Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(typeof(Gadgets).Assembly)).Handle(new RunActionRqDto
        {
            Route = "/gadgets",
            ConsumedRoute = "/gadgets",
            ServerSideType = typeof(Gadgets).FullName,
            ActionId = actionId,
            InitiatorComponentId = "c1",
            Parameters = parameters ?? new(),
            ComponentState = state ?? new(),
        });

    [Fact]
    public void The_id_link_opens_the_record()
    {
        var inc = Run("view", parameters: new() { ["id"] = JsonSerializer.SerializeToElement("g1") });

        // a server-driven navigation clears the unsaved-changes flag first
        Assert.Equal(["MarkAsClean", "NavigateTo"], inc.Commands.Select(c => c.Type));
        var command = inc.Commands[1];
        Assert.Equal("/gadgets/g1", command.Data);
    }

    [Fact]
    public void Delete_on_the_listing_deletes_the_selected_rows_and_searches_again()
    {
        Gadgets.Store.Clear();
        Gadgets.Store.AddRange([
            new() { Id = "g1", Name = "Gear" }, new() { Id = "g2", Name = "Cog" },
            new() { Id = "g3", Name = "Sprocket" },
        ]);

        var inc = Run("delete", state: new()
        {
            ["crud_selected_items"] = JsonSerializer.SerializeToElement(new[]
            {
                new { id = "g1", name = "Gear" }, new { id = "g3", name = "Sprocket" },
            }),
        });

        Assert.Equal(["g2"], Gadgets.Store.Select(g => g.Id));
        Assert.Equal("Deleted", Assert.Single(inc.Messages).Text);
        var json = JsonSerializer.Serialize(inc);
        Assert.Contains("Cog", json);
        Assert.DoesNotContain("Sprocket", json);
    }
}
