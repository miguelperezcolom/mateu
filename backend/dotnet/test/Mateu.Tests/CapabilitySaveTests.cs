using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>An editor with no id of its own: the record it edits is named by the ROW id the drawer
/// was opened with.</summary>
public class CapBookNote
{
    public string Title { get; set; } = "";
}

[UI("note-books"), Title("Note Books")]
public class NoteBooks : IListing<CapBook>, IEditable<CapBookNote, string>
{
    public static volatile string? LastSaved;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    // the LINQ way: a record the listing does not hold throws
    public CapBookNote Edit(string id) =>
        new() { Title = CapBooks.All().Single(b => b.Id == id).Title };

    public string Save(CapBookNote editor)
    {
        LastSaved = editor.Title;
        return "saved";
    }
}

[UI("int-books"), Title("Int Books")]
public class IntBooks : IListing<CapNumberedBook>, IEditable<CapNumberedBook, int>
{
    public static volatile int SaveCalls;

    public ListingData<CapNumberedBook> Search(SearchRequest request) =>
        ListingData.From(new List<CapNumberedBook> { new() { Id = 7, Title = "Siete" } });

    public CapNumberedBook Edit(int id) =>
        id == 7 ? new CapNumberedBook { Id = 7, Title = "Siete" } : throw new KeyNotFoundException();

    public int Save(CapNumberedBook editor)
    {
        SaveCalls++;
        return editor.Id;
    }
}

public enum Shelf { Fiction, Poetry }

public class CapShelvedBook
{
    public Shelf Id { get; set; }
    public string Title { get; set; } = "";
}

[UI("shelves"), Title("Shelves")]
public class Shelves : IListing<CapShelvedBook>, IDeletable<Shelf>
{
    public static volatile IReadOnlyList<Shelf>? LastDeleted;

    public ListingData<CapShelvedBook> Search(SearchRequest request) =>
        ListingData.From(new List<CapShelvedBook> { new() { Id = Shelf.Poetry, Title = "Poesía" } });

    public void DeleteAllById(IReadOnlyList<Shelf> selectedIds) => LastDeleted = selectedIds;
}

public class CapGuidBook
{
    public Guid Id { get; set; }
}

[UI("guid-books"), Title("Guid Books")]
public class GuidBooks : IListing<CapGuidBook>, IDeletable<Guid>
{
    public static volatile IReadOnlyList<Guid>? LastDeleted;

    public ListingData<CapGuidBook> Search(SearchRequest request) => ListingData.From(new List<CapGuidBook>());

    public void DeleteAllById(IReadOnlyList<Guid> selectedIds) => LastDeleted = selectedIds;
}

/// <summary>A capability save edits a record the listing HOLDS — named by the route, the editor's own id
/// or the row's — and is refused otherwise; and ids reach the listing typed.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class CapabilitySaveTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static object? El(object value) => JsonSerializer.SerializeToElement(value, Json);

    private static UIIncrementDto Run(Type uiClass, string route, string actionId,
        Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(typeof(PlainBooks).Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = route,
            ServerSideType = uiClass.FullName,
            ActionId = actionId,
            InitiatorComponentId = "cap_app",
            ComponentState = state ?? new Dictionary<string, object?>(),
        });

    [Fact]
    public void An_editor_without_an_id_saves_the_record_the_row_id_names()
    {
        NoteBooks.LastSaved = null;
        var saved = Run(typeof(NoteBooks), "/note-books", "save",
            new() { ["id"] = El("b2"), ["title"] = El("Rayuela (2ª ed.)") });
        Assert.Equal("Rayuela (2ª ed.)", NoteBooks.LastSaved);
        Assert.Contains(saved.Messages, m => m.Text == "Saved");
    }

    [Fact]
    public void A_record_the_listing_no_longer_holds_is_refused()
    {
        NoteBooks.LastSaved = null;
        var refused = Assert.Throws<UserFacingException>(() => Run(typeof(NoteBooks), "/note-books", "save",
            new() { ["id"] = El("b9"), ["title"] = El("Nobody") }));
        Assert.Equal(SyncHandler.RecordNoLongerExists, refused.Message);
        Assert.Null(NoteBooks.LastSaved);

        // nothing names a record at all: refused the same way, never run as a creation
        Assert.Throws<UserFacingException>(() => Run(typeof(NoteBooks), "/note-books", "save",
            new() { ["title"] = El("Nobody") }));
    }

    [Fact]
    public void An_id_that_is_not_of_the_listings_id_type_names_no_record()
    {
        IntBooks.SaveCalls = 0;
        var refused = Assert.Throws<UserFacingException>(() => Run(typeof(IntBooks), "/int-books", "save",
            new() { ["id"] = El("seven"), ["title"] = El("x") }));
        Assert.Equal(SyncHandler.RecordNoLongerExists, refused.Message);
        Assert.Throws<UserFacingException>(() => Run(typeof(IntBooks), "/int-books", "save",
            new() { ["id"] = El(8), ["title"] = El("x") }));
        Assert.Equal(0, IntBooks.SaveCalls);

        Run(typeof(IntBooks), "/int-books", "save", new() { ["id"] = El(7), ["title"] = El("Seven") });
        Assert.Equal(1, IntBooks.SaveCalls);
    }

    [Fact]
    public void A_routed_save_on_a_navigable_listing_goes_back_to_the_record()
    {
        var saved = Run(typeof(NavFullBooks), "/nav-full-books/b1/edit", "save",
            new() { ["title"] = El("Don Quijote") });
        Assert.Equal("/nav-full-books/b1", Assert.Single(saved.Commands, c => c.Type == "NavigateTo").Data);
        Assert.DoesNotContain(saved.Commands, c => c.Type == "CloseModal");
    }

    [Fact]
    public void Enum_and_guid_ids_reach_the_listing_typed()
    {
        Run(typeof(Shelves), "/shelves", "delete",
            new() { ["crud_selected_items"] = El(new[] { new { id = "poetry" } }) });
        Assert.Equal([Shelf.Poetry], Shelves.LastDeleted);

        var id = Guid.NewGuid();
        Run(typeof(GuidBooks), "/guid-books", "delete",
            new() { ["crud_selected_items"] = El(new[] { new { id = id.ToString() } }) });
        Assert.Equal([id], GuidBooks.LastDeleted);
    }
}
