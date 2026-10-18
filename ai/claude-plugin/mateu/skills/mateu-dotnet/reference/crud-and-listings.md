# C# CRUDs and listings

## `Crud<T>` — the full pack

```csharp
public class Product
{
    [Required] public string Id { get; set; } = "";           // the id: `Id`, or mark another property [Id]
    [Required] public string Name { get; set; } = "";
    [Range(0, double.MaxValue), Money] public double Price { get; set; }
    public ProductStatus Status { get; set; }                  // enum → multi-select filter
    public DateOnly Since { get; set; }                        // date-range filter
}

[UI("products"), Title("Products")]
public class Products : Crud<Product>
{
    private static readonly List<Product> Store = [];          // views are per request: keep data static/injected

    public override IEnumerable<Product> Fetch(string? search) =>
        Store.Where(p => string.IsNullOrWhiteSpace(search) || p.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
    public override Product? Get(string id) => Store.FirstOrDefault(p => p.Id == id);
    public override void Save(Product p) { Store.RemoveAll(x => x.Id == p.Id); Store.Add(p); }   // REQUIRED to write
    public override void Delete(string id) => Store.RemoveAll(p => p.Id == id);                 // REQUIRED to delete
}
```

You get the listing (smart search bar; filters derived from the entity — enums multi-select,
`DateOnly`/`DateTime` ranges, `[RangeFilter]` numeric ranges — applied in memory over `Fetch`),
detail `/products/{id}`, edit `/products/{id}/edit`, new `/products/new`, delete, validation.

Narrow it: `public override bool CanDelete => false;` (also `CanView`/`CanEdit`/`CanCreate`), or
`public override CrudDisplay Display => CrudDisplay.Defaults with { Create = Toggle.Off };`
(`Toggle.Disabled` shows it inert). There are no `@NotCreatable`-style attributes in this port.
`public override bool EditInDrawer => true;` opens create/edit in a drawer over the listing.

**Database pushdown** — override `Find` and the in-memory pipeline is skipped:

```csharp
public override PageResult<Product>? Find(string? searchText,
    IReadOnlyDictionary<string, object?> filters, Pageable pageable)
{
    // filters = raw component state: <field>, <field>_from/_to bounds, multi-selects as lists
    var query = Store.Where(p => searchText == null || p.Name.Contains(searchText));
    var page = query.Skip(pageable.Page * pageable.Size).Take(pageable.Size).ToList();
    return new PageResult<Product>(page, query.Count());
}
```

**Exports**: override `CsvExportable => true` (built-in writer); Excel/PDF buttons appear only when
you register an `IListingExporter` service for that `ExportFormat` (Mateu ships no Excel/PDF engine).

## Capability listings — grow à la carte

```csharp
[UI("orders"), Title("Orders")]
public class Orders : IListing<OrderRow>, ISearchable, IFilterable<OrderFilters>,
    INavigable<OrderView, string>, IDeletable<string>
{
    public ListingData<OrderRow> Search(SearchRequest request)
    {
        var text = request.SearchText ?? "";                     // filled because ISearchable
        var f = request.Filters<OrderFilters>();                 // typed, because IFilterable
        return ListingData.From(Repo.Where(o => o.Customer.Contains(text, StringComparison.OrdinalIgnoreCase)
            && (string.IsNullOrEmpty(f?.Customer) || o.Customer == f.Customer)));
    }
    public OrderView View(string id) => new() { Customer = Repo.First(o => o.Id == id).Customer };
    public void DeleteAllById(IReadOnlyList<string> ids) => Repo.RemoveAll(o => ids.Contains(o.Id));

    private static readonly List<OrderRow> Repo = [];
}
public class OrderRow { public string Id { get; set; } = ""; public string Customer { get; set; } = ""; }
public class OrderFilters { public string? Customer { get; set; } }
public class OrderView { public string Customer { get; set; } = ""; }
```

| Declare | Implement | You get |
|---|---|---|
| (bare `IListing<TRow>`) | `Search(SearchRequest)` | table with sorting + paging |
| `ISearchable` | — | search box (`request.SearchText`) |
| `IFilterable<TFilters>` | — | filter bar built from `TFilters` |
| `INavigable<TDetail, TId>` | `View(id)` | clickable rows + `/:id` |
| `IEditable<TEditor, TId>` | `Edit(id)`, `Save(editor)` → id | edit; in a drawer when not navigable |
| `ICreatable<TForm, TId>` | `CreationForm()`, `Create(form)` → id | New + `/new` |
| `IDeletable<TId>` | `DeleteAllById(ids)` | row selection + Delete |

`ListingData.From(rows)` sorts and pages in memory; `new ListingData<T>(page, totalElements)`
means the rows are already the page. `Listing<TFilters, TRow>` is an abstract base that is
already `ISearchable` + `IFilterable`; `SmartSearchPage<TFilters, TRow>` is the search-first page.

Grouping/totals: `[GroupBy]` on a row property groups the listing; `[GroupAction("Label")]` on a
method adds a button per group header (its `string` parameter receives the group value).
