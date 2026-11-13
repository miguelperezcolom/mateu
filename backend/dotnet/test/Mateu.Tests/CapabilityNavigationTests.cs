using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures: the capability combinations whose navigation the other suite does not reach ──

/// <summary>Editable + creatable, NOT navigable: the editable-listing idiom, New included — both
/// the editor and the creation form open in a drawer over the listing.</summary>
[UI("drawer-full-books"), Title("Drawer Books")]
public class DrawerFullBooks : IListing<CapBook>, IEditable<CapBook, string>, ICreatable<CapBook, string>
{
    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public CapBook Edit(string id) => CapBooks.All().First(b => b.Id == id);

    public string Save(CapBook editor) => editor.Id;

    public CapBook CreationForm() => new() { Title = "New book" };

    public string Create(CapBook form) => "b3";
}

/// <summary>Navigable + editable + creatable: rows, Edit and New navigate to their routes.</summary>
[UI("nav-full-books"), Title("Nav Books")]
public class NavFullBooks : IListing<CapBook>, INavigable<CapBook, string>, IEditable<CapBook, string>,
    ICreatable<CapBook, string>
{
    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public CapBook View(string id) => CapBooks.All().First(b => b.Id == id);

    public CapBook Edit(string id) => CapBooks.All().First(b => b.Id == id);

    public string Save(CapBook editor) => editor.Id;

    public CapBook CreationForm() => new();

    public string Create(CapBook form) => "b3";
}

public class CapNumberedBook
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
}

/// <summary>A deletable listing whose ids are ints: the selected rows' ids reach it typed.</summary>
[UI("numbered-books"), Title("Numbered Books")]
public class NumberedBooks : IListing<CapNumberedBook>, IDeletable<int>
{
    public static volatile IReadOnlyList<int>? LastDeleted;

    public ListingData<CapNumberedBook> Search(SearchRequest request) =>
        ListingData.From(new List<CapNumberedBook> { new() { Id = 7, Title = "Siete" } });

    public void DeleteAllById(IReadOnlyList<int> selectedIds) => LastDeleted = selectedIds;
}

/// <summary>The navigation a capability listing answers for each combination (mirrors Java's
/// CapabilityCrud routes): drawer New / cancel in the editable-listing idiom, routed Edit / New /
/// cancel and the /{id}/edit route when the listing is navigable, and typed ids on delete.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class CapabilityNavigationTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static UIIncrementDto Run(
        Type uiClass, string route, string actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        new SyncHandler(new MateuRegistry(typeof(PlainBooks).Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = route,
            ServerSideType = uiClass.FullName,
            ActionId = actionId,
            InitiatorComponentId = "cap_app",
            ComponentState = state ?? new Dictionary<string, object?>(),
            Parameters = parameters ?? new Dictionary<string, object?>(),
        });

    private static JsonElement El(object value) => JsonSerializer.SerializeToElement(value, Json);

    [Fact]
    public void An_editable_listing_opens_new_in_a_drawer_and_cancel_closes_it()
    {
        var drawer = Run(typeof(DrawerFullBooks), "/drawer-full-books", "new");
        var fragment = Assert.Single(drawer.Fragments);
        Assert.Equal("Add", fragment.Action);
        var json = JsonSerializer.Serialize(drawer, Json);
        Assert.Contains("\"type\":\"Drawer\"", json);
        Assert.Contains("New book", json);
        Assert.DoesNotContain(drawer.Commands, c => c.Type == "NavigateTo");

        var cancelled = Run(typeof(DrawerFullBooks), "/drawer-full-books", "cancel-new");
        Assert.Single(cancelled.Commands, c => c.Type == "CloseModal");
        Assert.Single(cancelled.Commands, c => c.Type == "MarkAsClean");
    }

    [Fact]
    public void A_navigable_listing_routes_edit_new_and_cancel()
    {
        var edit = Run(typeof(NavFullBooks), "/nav-full-books", "edit",
            new Dictionary<string, object?> { ["id"] = El("b2") });
        Assert.Equal("/nav-full-books/b2/edit",
            Assert.Single(edit.Commands, c => c.Type == "NavigateTo").Data);

        var create = Run(typeof(NavFullBooks), "/nav-full-books", "new");
        Assert.Equal("/nav-full-books/new",
            Assert.Single(create.Commands, c => c.Type == "NavigateTo").Data);

        var cancel = Run(typeof(NavFullBooks), "/nav-full-books/b2/edit", "cancel-edit");
        Assert.DoesNotContain(cancel.Commands, c => c.Type == "CloseModal");
        Assert.Contains("/nav-full-books", JsonSerializer.Serialize(cancel, Json));
    }

    [Fact]
    public void The_edit_route_of_a_navigable_editable_listing_loads_the_editor()
    {
        var editor = Run(typeof(NavFullBooks), "/nav-full-books/b1/edit", "");
        var json = JsonSerializer.Serialize(editor, Json);
        Assert.Contains("El Quijote", json);
        Assert.Contains("\"save\"", json);
    }

    [Fact]
    public void A_delete_hands_the_listing_its_ids_typed()
    {
        Run(typeof(NumberedBooks), "/numbered-books", "delete",
            new Dictionary<string, object?> { ["crud_selected_items"] = El(new[] { new { id = 7 } }) });
        Assert.Equal([7], NumberedBooks.LastDeleted);
    }
}
