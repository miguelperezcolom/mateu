namespace Mateu.Uidl;

// ── The capability listing model (C# mirror of Java's Listing + capabilities) ──
//
// A listing is a class implementing IListing<TRow> — rows only; column sorting and pagination
// come free. Every further feature is an optional capability, activated by DECLARING it on the
// same class:
//
//   ISearchable            → the free-text search box (request.SearchText)
//   IFilterable<TFilters>  → the filter bar, built reflectively from TFilters
//   INavigable<TDetail,TId>→ rows open a read-only detail page (/:id)
//   IEditable<TEditor,TId> → records can be edited (in a Drawer over the listing when the class
//                            is NOT INavigable — the "editable listing" idiom)
//   ICreatable<TForm,TId>  → the New button + creation form (/new)
//   IDeletable<TId>        → row selection + the Delete button
//
// Crud<T> is simply a listing with ALL the capabilities declared. A listing without interaction
// capabilities is just the table: no buttons, no clickable rows, no selection.

/// <summary>Everything a listing search receives, in one object: the free-text
/// <see cref="SearchText"/> (populated when the listing is <see cref="ISearchable"/>, else empty),
/// the hydrated <see cref="Filters"/> object (when it is <see cref="IFilterable{TFilters}"/> —
/// read it typed via <c>request.Filters&lt;TFilters&gt;()</c>), the range/multi-select
/// <see cref="Criteria"/> the filters object cannot carry, and the <see cref="Pageable"/>
/// (page/size/sort). Adding a new search input in the future means adding a component here — the
/// <c>Search(SearchRequest)</c> signature never changes. (C# mirror of
/// io.mateu.uidl.data.SearchRequest.)</summary>
public sealed record SearchRequest
{
    public string SearchText { get; init; } = "";
    public object? Filters { get; init; }
    public IReadOnlyList<FilterCriterion> Criteria { get; init; } = [];
    public Pageable Pageable { get; init; } = new(0, int.MaxValue, []);

    public SearchRequest() { }

    public SearchRequest(
        string? searchText,
        object? filters = null,
        IReadOnlyList<FilterCriterion>? criteria = null,
        Pageable? pageable = null)
    {
        SearchText = searchText ?? "";
        Filters = filters;
        Criteria = criteria ?? [];
        Pageable = pageable ?? new Pageable(0, int.MaxValue, []);
    }
}

public static class SearchRequestExtensions
{
    /// <summary>The hydrated filters object carried by the request, typed (the C# idiom for
    /// Java's <c>Filterable.filters(request)</c>): <c>request.Filters&lt;MyFilters&gt;()</c>.</summary>
    public static TFilters? Filters<TFilters>(this SearchRequest request) where TFilters : class =>
        request.Filters as TFilters;
}

/// <summary>The condition semantics of a <see cref="FilterCriterion"/> (mirrors
/// io.mateu.uidl.data.FilterOperator).</summary>
public enum FilterOperator { Between, Gte, Lte, In }

/// <summary>A listing filter condition the entity-shaped filters object cannot express:
/// date/number ranges and value lists. Between: [from, to] — Gte/Lte: [bound] — In: the accepted
/// values. (C# mirror of io.mateu.uidl.data.FilterCriterion.)</summary>
public sealed record FilterCriterion(string Field, FilterOperator Operator, IReadOnlyList<object?> Values);

/// <summary>Non-generic factory helpers so <c>ListingData.From(rows)</c> infers the row type
/// (the C# spelling of Java's <c>ListingData.from(...)</c>).</summary>
public static class ListingData
{
    public static ListingData<TRow> From<TRow>(IEnumerable<TRow> rows) where TRow : class =>
        ListingData<TRow>.From(rows);

    public static ListingData<TRow> Of<TRow>(params TRow[] rows) where TRow : class =>
        ListingData<TRow>.From(rows);
}

/// <summary>What a listing search returns. <see cref="From"/> hands the framework the WHOLE
/// filtered result set (TotalElements null = unpaged) and the engine sorts + paginates it in
/// memory; a database-backed listing that ran the count + page queries itself constructs
/// <c>new ListingData&lt;TRow&gt;(pageContent, totalElements)</c> and the page goes to the wire
/// as-is. (C# mirror of io.mateu.uidl.data.ListingData — the aggregates/groups companion stays
/// engine-side in this port.)</summary>
public sealed record ListingData<TRow>(IReadOnlyList<TRow> Content, long? TotalElements = null)
    where TRow : class
{
    public static ListingData<TRow> From(IEnumerable<TRow> rows) => new(rows.ToList());

    /// <summary>True when the content is already one page of a larger result set.</summary>
    public bool Paged => TotalElements is not null;
}

/// <summary>A listing: rows shown as a sortable, paginated grid. Implement
/// <see cref="Search"/> to return the matching rows — that alone gives you the listing; every
/// further feature is a capability declared on the same class (see the file header). (C# mirror
/// of io.mateu.uidl.interfaces.Listing.)</summary>
public interface IListing<TRow> where TRow : class
{
    ListingData<TRow> Search(SearchRequest request);
}

/// <summary>Input capability: declaring it on an <see cref="IListing{TRow}"/> shows the free-text
/// search box, and the typed text arrives as <c>request.SearchText</c>. A listing that does not
/// implement it shows no search box and always receives an empty SearchText. (C# mirror of
/// io.mateu.uidl.interfaces.Searchable — not to be confused with the [Searchable] field
/// attribute.)</summary>
public interface ISearchable;

/// <summary>Input capability: declaring it on an <see cref="IListing{TRow}"/> shows the filter
/// bar, built reflectively from <typeparamref name="TFilters"/> — each property becomes a filter
/// widget (DateRange/NumberRange/ISet&lt;TEnum&gt; properties render range and multi-select
/// widgets). The hydrated filters object travels inside the <see cref="SearchRequest"/>; read it
/// typed via <c>request.Filters&lt;TFilters&gt;()</c>. A listing that does not implement it shows
/// no filter bar and receives null Filters. (C# mirror of
/// io.mateu.uidl.interfaces.Filterable.)</summary>
public interface IFilterable<TFilters> where TFilters : class, new();

/// <summary>Interaction capability: declaring it on an <see cref="IListing{TRow}"/> makes rows
/// clickable — clicking opens the read-only detail page (/:id) rendered from the object
/// <see cref="View"/> returns. (C# mirror of io.mateu.uidl.interfaces.Navigable.)</summary>
public interface INavigable<TDetail, TId>
{
    TDetail View(TId id);
}

/// <summary>Interaction capability: declaring it on an <see cref="IListing{TRow}"/> makes records
/// editable — the detail gains an Edit button opening the form <see cref="Edit"/> returns
/// (/:id/edit), and submitting it calls <see cref="Save"/> with the form state bound into the
/// editor. WITHOUT <see cref="INavigable{TDetail,TId}"/> the editor opens in a Drawer over the
/// listing instead (the "editable listing" idiom). (C# mirror of
/// io.mateu.uidl.interfaces.Editable.)</summary>
public interface IEditable<TEditor, TId>
{
    TEditor Edit(TId id);

    /// <summary>Persists the submitted editor and returns the record id (to navigate back).</summary>
    TId Save(TEditor editor);
}

/// <summary>Interaction capability: declaring it on an <see cref="IListing{TRow}"/> adds the New
/// button — it opens the blank (or pre-populated) form <see cref="CreationForm"/> returns (/new),
/// and submitting it calls <see cref="Create"/> with the form state bound in. (C# mirror of
/// io.mateu.uidl.interfaces.Creatable.)</summary>
public interface ICreatable<TForm, TId>
{
    TForm CreationForm();

    /// <summary>Persists the submitted creation form and returns the new record's id.</summary>
    TId Create(TForm form);
}

/// <summary>Interaction capability: declaring it on an <see cref="IListing{TRow}"/> enables row
/// selection and the Delete button — deleting calls <see cref="DeleteAllById"/> with the selected
/// ids. (C# mirror of io.mateu.uidl.interfaces.Deletable.)</summary>
public interface IDeletable<TId>
{
    void DeleteAllById(IReadOnlyList<TId> selectedIds);
}
