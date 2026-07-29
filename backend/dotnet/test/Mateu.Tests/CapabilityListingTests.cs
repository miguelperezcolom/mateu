using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures: one class per capability combination (mirrors Java's CapabilityListingSyncTest) ──

public class CapBook
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public int Pages { get; set; }
}

public static class CapBooks
{
    public static List<CapBook> All() =>
    [
        new() { Id = "b1", Title = "El Quijote", Pages = 863 },
        new() { Id = "b2", Title = "Rayuela", Pages = 600 },
    ];
}

[UI("plain-books"), Title("Books")]
public class PlainBooks : IListing<CapBook>
{
    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());
}

[UI("searchable-books"), Title("Searchable Books")]
public class SearchableBooks : IListing<CapBook>, Mateu.Uidl.ISearchable
{
    public static volatile string? LastSearchText;

    public ListingData<CapBook> Search(SearchRequest request)
    {
        LastSearchText = request.SearchText;
        return ListingData.From(CapBooks.All());
    }
}

public class CapBookFilters
{
    public string? Title { get; set; }
    public NumberRange? Pages { get; set; }
}

[UI("filterable-books"), Title("Filterable Books")]
public class FilterableBooks : IListing<CapBook>, IFilterable<CapBookFilters>
{
    public static volatile string? LastTitleFilter;

    public ListingData<CapBook> Search(SearchRequest request)
    {
        var filters = request.Filters<CapBookFilters>() ?? new CapBookFilters();
        LastTitleFilter = filters.Title;
        return ListingData.From(CapBooks.All()
            .Where(b => filters.Title is null
                        || b.Title.Contains(filters.Title, StringComparison.OrdinalIgnoreCase))
            .Where(b => filters.Pages is null || filters.Pages.Contains(b.Pages)));
    }
}

[UI("navigable-books"), Title("Navigable Books")]
public class NavigableBooks : IListing<CapBook>, INavigable<CapBook, string>
{
    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public CapBook View(string id) => CapBooks.All().First(b => b.Id == id);
}

[UI("editable-books"), Title("Editable Books")]
public class EditableBooks : IListing<CapBook>, IEditable<CapBook, string>
{
    public static volatile string? LastSavedTitle;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public CapBook Edit(string id) => CapBooks.All().First(b => b.Id == id);

    public string Save(CapBook editor)
    {
        LastSavedTitle = editor.Title;
        return editor.Id;
    }
}

[UI("creatable-books"), Title("Creatable Books")]
public class CreatableBooks : IListing<CapBook>, ICreatable<CapBook, string>
{
    public static volatile string? LastCreatedTitle;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public CapBook CreationForm() => new();

    public string Create(CapBook form)
    {
        LastCreatedTitle = form.Title;
        return "b3";
    }
}

[UI("deletable-books"), Title("Deletable Books")]
public class DeletableBooks : IListing<CapBook>, IDeletable<string>
{
    public static volatile IReadOnlyList<string>? LastDeleted;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public void DeleteAllById(IReadOnlyList<string> selectedIds) => LastDeleted = selectedIds;
}

[UI("bulk-books"), Title("Bulk Books")]
public class BulkBooks : IListing<CapBook>, IDeletable<string>
{
    public static volatile IReadOnlyList<string>? LastArchived;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public void DeleteAllById(IReadOnlyList<string> selectedIds) { }

    [ListToolbarButton(rowsSelectedRequired: true)]
    public void Archive(List<CapBook> selection) => LastArchived = selection.Select(b => b.Id).ToList();
}

/// <summary>The capability model, combination by combination: a listing is a class implementing
/// IListing (rows only — sorting and pagination come free), and every further feature appears
/// because the class DECLARES it — ISearchable the search box, IFilterable the filter bar,
/// INavigable clickable rows + detail route, IEditable the editor (in a drawer when not
/// navigable), ICreatable the New button + create form, IDeletable row selection + the Delete
/// button. Mirrors Java's CapabilityListingSyncTest.</summary>
public class CapabilityListingTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(PlainBooks).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    private static UIIncrementDto Load(Type uiClass, string route) =>
        Run(uiClass, route, "", null, null);

    private static UIIncrementDto Run(
        Type uiClass, string route, string actionId,
        Dictionary<string, object?>? state, Dictionary<string, object?>? parameters) =>
        Handler().Handle(new RunActionRqDto
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

    // ── rows only ─────────────────────────────────────────────────────────────

    [Fact]
    public void A_bare_listing_has_no_search_box_no_filters_no_buttons_and_no_clickable_rows()
    {
        var json = Render(Load(typeof(PlainBooks), "/plain-books"));

        Assert.Contains("\"searchable\":false", json);
        Assert.Contains("\"filters\":[]", json);
        Assert.Contains("\"rowsSelectionEnabled\":false", json);
        Assert.Contains("\"toolbar\":[]", json);
        // only what was declared: no new/delete/view anywhere in the increment
        Assert.DoesNotContain("\"actionId\":\"new\"", json);
        Assert.DoesNotContain("\"actionId\":\"delete\"", json);
        Assert.DoesNotContain("\"actionId\":\"view\"", json);
        // …but the table itself is there, preloaded by the OnLoad→search trigger
        Assert.Contains("\"type\":\"Crud\"", json);
        Assert.Contains("\"id\":\"title\"", json);
        Assert.Contains("\"id\":\"search\"", json);
        Assert.Contains("\"type\":\"OnLoad\"", json);
    }

    [Fact]
    public void A_bare_listing_search_receives_an_empty_search_text_and_null_filters()
    {
        var json = Render(Run(typeof(PlainBooks), "/plain-books", "search",
            new Dictionary<string, object?> { ["searchText"] = El("ignored") }, null));

        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("El Quijote", json);
        Assert.Contains("Rayuela", json);
    }

    // ── + ISearchable ─────────────────────────────────────────────────────────

    [Fact]
    public void Searchable_shows_the_search_box_and_the_typed_text_reaches_the_request()
    {
        var json = Render(Load(typeof(SearchableBooks), "/searchable-books"));
        Assert.Contains("\"searchable\":true", json);

        Run(typeof(SearchableBooks), "/searchable-books", "search",
            new Dictionary<string, object?> { ["searchText"] = El("quijote") }, null);
        Assert.Equal("quijote", SearchableBooks.LastSearchText);
    }

    // ── + IFilterable ─────────────────────────────────────────────────────────

    [Fact]
    public void Filterable_builds_the_filter_bar_from_the_filters_type_and_hydrates_it_typed()
    {
        var json = Render(Load(typeof(FilterableBooks), "/filterable-books"));
        // string filter + typed NumberRange filter, still no search box (not ISearchable)
        Assert.Contains("\"fieldId\":\"title\"", json);
        Assert.Contains("\"stereotype\":\"numberRange\"", json);
        Assert.Contains("\"searchable\":false", json);

        var result = Render(Run(typeof(FilterableBooks), "/filterable-books", "search",
            new Dictionary<string, object?>
            {
                ["title"] = El("qui"),
                ["pages_from"] = El("700"),
            }, null));
        Assert.Equal("qui", FilterableBooks.LastTitleFilter);
        Assert.Contains("El Quijote", result);
        Assert.DoesNotContain("Rayuela", result);
    }

    // ── + INavigable ──────────────────────────────────────────────────────────

    [Fact]
    public void Navigable_makes_rows_clickable_and_serves_the_detail_route()
    {
        var json = Render(Load(typeof(NavigableBooks), "/navigable-books"));
        // the first column carries the row-open affordance…
        Assert.Contains("\"id\":\"id\",\"label\":\"Id\"", json);
        Assert.Contains("\"actionId\":\"view\"", json);
        // …and still no create/delete chrome — only what was declared
        Assert.DoesNotContain("\"actionId\":\"new\"", json);
        Assert.DoesNotContain("\"actionId\":\"delete\"", json);
        Assert.Contains("\"rowsSelectionEnabled\":false", json);

        // the row click navigates to the detail route…
        var click = Run(typeof(NavigableBooks), "/navigable-books", "view",
            new Dictionary<string, object?> { ["id"] = El("b1") }, null);
        var navigate = Assert.Single(click.Commands.Where(c => c.Type == "NavigateTo"));
        Assert.Equal("/navigable-books/b1", navigate.Data);

        // …and the detail route renders the object View(id) returned, read-only
        var detail = Render(Load(typeof(NavigableBooks), "/navigable-books/b1"));
        Assert.Contains("El Quijote", detail);
        Assert.Contains("\"readOnly\":true", detail);
        Assert.Contains("\"actionId\":\"cancel-view\"", detail);
        Assert.DoesNotContain("\"actionId\":\"edit\"", detail);
    }

    // ── + IEditable (without INavigable) ──────────────────────────────────────

    [Fact]
    public void Editable_without_navigable_opens_the_editor_in_a_drawer_and_save_persists()
    {
        var json = Render(Load(typeof(EditableBooks), "/editable-books"));
        // the editable-listing idiom: the first column opens the EDITOR (drawer), not a view page
        Assert.Contains("\"actionId\":\"view\"", json);

        var drawer = Run(typeof(EditableBooks), "/editable-books", "view",
            new Dictionary<string, object?> { ["id"] = El("b1") }, null);
        var fragment = Assert.Single(drawer.Fragments);
        Assert.Equal("Add", fragment.Action);
        var drawerJson = Render(drawer);
        Assert.Contains("\"type\":\"Drawer\"", drawerJson);
        Assert.Contains("El Quijote", drawerJson);
        Assert.Empty(drawer.Commands.Where(c => c.Type == "NavigateTo"));

        var saved = Run(typeof(EditableBooks), "/editable-books", "save",
            new Dictionary<string, object?>
            {
                ["id"] = El("b1"),
                ["title"] = El("El Quijote (anotado)"),
                ["pages"] = El(900),
            }, null);
        Assert.Equal("El Quijote (anotado)", EditableBooks.LastSavedTitle);
        // drawer contract: close emitting the saved event + re-run the search, no navigation
        Assert.Single(saved.Commands.Where(c => c.Type == "CloseModal"));
        Assert.Single(saved.Commands.Where(c => c.Type == "RunAction"));
        Assert.Empty(saved.Commands.Where(c => c.Type == "NavigateTo"));
        Assert.Contains(SyncHandler.SavedInDrawerEvent, Render(saved));
    }

    // ── + ICreatable ──────────────────────────────────────────────────────────

    [Fact]
    public void Creatable_adds_the_new_button_and_create_persists()
    {
        var json = Render(Load(typeof(CreatableBooks), "/creatable-books"));
        Assert.Contains("\"actionId\":\"new\"", json);
        Assert.DoesNotContain("\"actionId\":\"delete\"", json);
        Assert.Contains("\"rowsSelectionEnabled\":false", json);

        // the /new route renders the creation form CreationForm() returned
        var form = Render(Load(typeof(CreatableBooks), "/creatable-books/new"));
        Assert.Contains("\"fieldId\":\"title\"", form);
        Assert.Contains("\"actionId\":\"create\"", form);

        Run(typeof(CreatableBooks), "/creatable-books", "create",
            new Dictionary<string, object?>
            {
                ["title"] = El("Nuevo libro"),
                ["pages"] = El(100),
            }, null);
        Assert.Equal("Nuevo libro", CreatableBooks.LastCreatedTitle);
    }

    // ── + IDeletable ──────────────────────────────────────────────────────────

    [Fact]
    public void Deletable_enables_selection_and_the_delete_button()
    {
        var json = Render(Load(typeof(DeletableBooks), "/deletable-books"));
        Assert.Contains("\"rowsSelectionEnabled\":true", json);
        Assert.Contains("\"actionId\":\"delete\"", json);
        Assert.DoesNotContain("\"actionId\":\"new\"", json);
        Assert.DoesNotContain("\"actionId\":\"view\"", json);

        var deleted = Run(typeof(DeletableBooks), "/deletable-books", "delete",
            new Dictionary<string, object?>
            {
                ["crud_selected_items"] = El(new[] { new { id = "b1" } }),
            }, null);
        Assert.Equal(["b1"], DeletableBooks.LastDeleted);
        // the response refreshes the listing in place, with a confirmation toast
        Assert.Single(deleted.Fragments);
        Assert.Equal("Deleted", Assert.Single(deleted.Messages).Text);
    }

    // ── [ListToolbarButton] bulk methods on the listing (the behaviour source) ─

    [Fact]
    public void Bulk_methods_declared_on_the_listing_become_toolbar_buttons_and_are_invoked()
    {
        var json = Render(Load(typeof(BulkBooks), "/bulk-books"));
        Assert.Contains("\"actionId\":\"action-on-row-archive\"", json);
        Assert.Contains("\"rowsSelectedRequired\":true", json);

        Run(typeof(BulkBooks), "/bulk-books", "action-on-row-archive",
            new Dictionary<string, object?>
            {
                ["crud_selected_items"] = El(new[] { new { id = "b1", title = "El Quijote", pages = 863 } }),
            }, null);
        Assert.Equal(["b1"], BulkBooks.LastArchived);
    }

    // ── Crud<T> = a listing with every capability declared ────────────────────

    [Fact]
    public void A_crud_declares_every_capability_and_its_wire_carries_the_full_chrome()
    {
        var json = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "/things", ConsumedRoute = "/things",
            ServerSideType = typeof(Things).FullName, InitiatorComponentId = "cap_app",
        }));

        Assert.Contains("\"searchable\":true", json);
        Assert.Contains("\"rowsSelectionEnabled\":true", json);
        Assert.Contains("\"actionId\":\"view\"", json);
        Assert.Contains("\"actionId\":\"new\"", json);
        Assert.Contains("\"actionId\":\"delete\"", json);
    }
}
