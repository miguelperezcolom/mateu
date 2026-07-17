using System.Reflection;

namespace Mateu.Uidl;

/// <summary>
/// Base for a CRUD view of <typeparamref name="T"/>. The framework renders a searchable listing and
/// detail/edit/new forms, calling these methods. (C# analogue of Java's AutoCrud&lt;T&gt;.)
/// </summary>
public abstract class Crud<T> where T : class, new()
{
    /// <summary>Rows to show, optionally filtered by the search box text.</summary>
    public abstract IEnumerable<T> Fetch(string? search);

    /// <summary>Database pushdown: override to run the search+filter+sort+paginate as ONE query
    /// (count + page inside) and return the page with its real total — the framework then skips
    /// its in-memory pipeline entirely. Filters arrive as the raw component state (camelCase
    /// keys; range bounds as &lt;field&gt;_from/&lt;field&gt;_to, multi-selects as value lists).
    /// Default null = keep the in-memory Fetch pipeline. (C# analogue of Java's
    /// CrudRepository.find.)</summary>
    public virtual PageResult<T>? Find(
        string? searchText, IReadOnlyDictionary<string, object?> filters, Pageable pageable) => null;

    /// <summary>Loads one entity by id (default: linear scan of <see cref="Fetch"/>).</summary>
    public virtual T? Get(string id) => Fetch(null).FirstOrDefault(e => IdOf(e) == id);

    /// <summary>Persists a created/edited entity. Override to store it.</summary>
    public virtual void Save(T entity) { }

    /// <summary>Removes an entity by id. Override to store it.</summary>
    public virtual void Delete(string id) { }

    /// <summary>The value of the entity's <c>Id</c> property as a string.</summary>
    public static string? IdOf(T entity) =>
        typeof(T).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance)?.GetValue(entity)?.ToString();

    /// <summary>When true, New and row clicks open the create/edit form in a Drawer sliding over
    /// the listing (the Redwood "Create and Edit - Drawer" template) instead of navigating to the
    /// /new — /{id}/edit routes; saving persists, closes the drawer and re-runs the listing's
    /// search in place. (C# analogue of Java's Crud.editInDrawer.)</summary>
    public virtual bool EditInDrawer => false;

    /// <summary>Width of the create/edit drawer when <see cref="EditInDrawer"/> is on.</summary>
    public virtual string EditDrawerWidth => "36rem";
}

/// <summary>The hero header of a <see cref="HeroSearch{T}"/> page (non-generic view of it).</summary>
public interface IHeroSearch
{
    string? HeroTitle();
    string? HeroSubtitle();
    string? HeroImage();
}

/// <summary>
/// A search-first page: a centered hero header (title, subtitle, background image) over the
/// standard crud listing, results as cards. Starts empty — the user searches. (C# analogue of
/// Java's HeroSearch archetype.)
/// </summary>
public abstract class HeroSearch<T> : Crud<T>, IHeroSearch where T : class, new()
{
    public virtual string? HeroTitle() => null;
    public virtual string? HeroSubtitle() => null;
    /// <summary>Background image URL, rendered with a dark overlay.</summary>
    public virtual string? HeroImage() => null;
}

/// <summary>A from/to date interval for TYPED filter fields on declarative listings: declare a
/// DateRange property in the Filters class and the smart search bar renders a from–to date
/// widget; on search the &lt;field&gt;_from/&lt;field&gt;_to state keys are assembled back into a
/// DateRange, so Search(...) receives it ready to apply. Either bound may be null (open-ended).
/// (C# analogue of io.mateu.uidl.data.DateRange.)</summary>
public sealed record DateRange(DateOnly? From = null, DateOnly? To = null)
{
    public bool IsEmpty => From is null && To is null;

    /// <summary>True when <paramref name="date"/> falls inside the interval (null bounds open).</summary>
    public bool Contains(DateOnly date) =>
        (From is null || date >= From) && (To is null || date <= To);
}

/// <summary>A min/max numeric interval for TYPED filter fields on declarative listings (the
/// numeric counterpart of <see cref="DateRange"/>).</summary>
public sealed record NumberRange(decimal? From = null, decimal? To = null)
{
    public bool IsEmpty => From is null && To is null;

    public bool Contains(decimal value) =>
        (From is null || value >= From) && (To is null || value <= To);
}

/// <summary>
/// A declarative read-only listing: a Filters class (its properties become the smart search bar,
/// with DateRange/NumberRange/ISet&lt;TEnum&gt; properties rendering range and multi-select
/// widgets) and a Row class (its properties become the columns). Implement Search — it receives
/// the hydrated typed filters; the framework sorts and paginates the returned rows.
/// (C# analogue of Java's declarative Listing&lt;Filters, Row&gt;.)
/// </summary>
public abstract class Listing<TFilters, TRow> where TFilters : class, new() where TRow : class
{
    /// <summary>Rows matching the free-text search and the applied filters.</summary>
    public abstract IEnumerable<TRow> Search(string? searchText, TFilters filters);

    /// <summary>The grid layout the renderer uses: "auto" (renderer decides), "table", "list",
    /// "cards", "masterDetail" or "tree" — tree shows hierarchical rows whose row type carries a
    /// self-referential children list, and is never auto-selected.
    /// (C# analogue of ListingBackend.gridLayout.)</summary>
    public virtual string GridLayout() => "auto";
}

/// <summary>The item a <see cref="ISelector{TRow}"/> reports as chosen: its id (stored as the
/// field value) and its human label (shown next to it). (C# analogue of
/// io.mateu.uidl.interfaces.SelectedItem.)</summary>
public sealed record SelectedItem(object? Id, string Label);

/// <summary>Implemented by a Listing that acts as a [Searchable] field's selector dialog: the
/// listing opens in a modal, every row shows a Select button, and Selected maps the clicked row
/// to the (id, label) pair written back into the field. (C# analogue of Java's Selector.)</summary>
public interface ISelector<in TRow>
{
    SelectedItem Selected(TRow row);
}

/// <summary>One sort criterion of a listing request.</summary>
public sealed record SortSpec(string Field, bool Descending);

/// <summary>The page a listing request asks for (0-based page, page size, sort criteria).</summary>
public sealed record Pageable(int Page, int Size, IReadOnlyList<SortSpec> Sort);

/// <summary>One page of results plus the total count — what a database-backed
/// <see cref="Crud{T}.Find"/> returns (run the count + page queries inside).</summary>
public sealed record PageResult<T>(IReadOnlyList<T> Content, long TotalElements);
