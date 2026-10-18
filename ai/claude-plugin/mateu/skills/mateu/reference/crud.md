# Mateu CRUD

A full list + create + edit + view + delete from one class: `extends AutoCrud<T>`,
where `T extends Identifiable`, plus a `CrudStore<T>`.

```java
@UI("/products")
public class Products extends AutoCrud<Products.Product> {

    @Override
    public CrudStore<Product> store() {
        return new ProductStore(); // or a Spring @Service you inject
    }

    enum ProductStatus { Available, OutOfStock }

    record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
        @NotEmpty String name,
        @Stereotype(FieldStereotype.textarea) @HiddenInList String description,
        @NotNull
        @Status(defaultStatus = StatusType.NONE, mappings = {
            @StatusMapping(from = "Available",  to = StatusType.SUCCESS),
            @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
        })
        ProductStatus status
    ) implements Identifiable {
        @Override public String toString() {
            return name != null ? "Product " + name : "New product";
        }
    }
}
```

## Store

Implement `CrudStore<T>` (the data-access port) over any backing store (JPA, Mongo, a REST client,
in-memory). `store()` is abstract — every `AutoCrud` overrides it. The old
`CrudRepository`/`repository()` names were removed — always `CrudStore`/`store()`.

```java
// nested in Products (or a Spring @Service you return from store())
static class ProductStore implements CrudStore<Product> {
    private static final Map<String, Product> db = new LinkedHashMap<>(); // static: the view model is per request
    public Optional<Product> findById(String id) { return Optional.ofNullable(db.get(id)); }
    public String save(Product e) {
        var id = (e.id() == null || e.id().isBlank()) ? UUID.randomUUID().toString() : e.id();
        db.put(id, new Product(id, e.name(), e.description(), e.status()));
        return id;
    }
    public List<Product> findAll() { return new ArrayList<>(db.values()); }
    public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
    // find(searchText, filters, pageable) -> Page<Product> is a DEFAULT method; override it for DB-side paging
}
```

- The entity implements `Identifiable` (`String id()`).
- `save` returns the id; generate a `UUID.randomUUID().toString()` when it's null/blank.
- `toString()` is the row label in the list.
- `find(String searchText, T filters, Pageable pageable)` returns `Page<T>` (which carries
  `totalElements` — no separate `count` needed). It has a **default** in-memory implementation
  over `findAll()`: every word of the search text must appear in `SearchableText.searchableText()`
  (else `toString()`), then the filter values the user set are applied (strings by
  containment, other values by equality; dates become ranges, enums multi-selects), then it sorts
  by `pageable.sort()` and pages. Override it only to push search/filter/sort/paging to the
  database. `AutoCrud` calls `find` to fill the listing.

## Filters

On an `AutoCrud<T>` the entity IS the filters type: **every basic field** (strings, numbers,
booleans, enums, dates) becomes a filter in the smart search bar — dates as ranges, enums as
multi-selects, `@RangeFilter` numerics as ranges. Nothing to annotate. To offer only some filters,
extend `FilteredAutoCrud<MyFilters, T>` with a filters record holding just those fields, and
override `fetchRows(String searchText, MyFilters filters, Pageable pageable, HttpRequest rq)` to
apply them (the default `find` only understands filters of the entity's own type).

(`@Filterable` on a field is a different thing: it makes a COLUMN of a grid field filterable.)

## Relations (foreign keys)

Use `@Lookup` with server-side suppliers — no DTO duplication:

```java
@Lookup(search = CustomerOptions.class, label = CustomerLabel.class)
String customerId;
```

```java
public class CustomerOptions implements LookupOptionsSupplier {
    public ListingData<Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest rq) {
        return ListingData.of(new Option("c1", "ACME"), new Option("c2", "Globex"));
    }
}
public class CustomerLabel implements LookupLabelSupplier {
    public String label(String fieldName, Object id, HttpRequest rq) { return "Customer " + id; }
}
```

## Column / field control

`@HiddenInList`, `@HiddenInCreate`, `@HiddenInView`, `@HiddenInEditor`,
`@NotEditable`, `@EditableOnlyWhenCreating`, `@NotCreatable`, `@NotDeletable`,
`@ColumnWidth("200px")`, `@Weight(2)`, `@Label("…")`.

## Capability listings — a listing that grows (additive)

When you don't want the whole CRUD pack, implement `Listing<Row>` (interface, uidl) with the
single `search(SearchRequest, HttpRequest)` and DECLARE capabilities — each one adds only its
own UI. Never switch base class as the screen grows: add an interface.

```java
@UI("/orders")
public class Orders implements Listing<Orders.OrderRow>, Searchable, Filterable<Orders.OrderFilters> {

    public record OrderFilters(String status, LocalDate from, LocalDate to) {}
    public record OrderRow(String id, String customer, double total, String status) {}

    static final List<OrderRow> ROWS = List.of(
        new OrderRow("1", "Ada", 10, "open"), new OrderRow("2", "Bob", 20, "closed"));

    @Override
    public ListingData<OrderRow> search(SearchRequest request, HttpRequest http) {
        var text = request.searchText();      // filled because Searchable
        var filters = filters(request);       // typed OrderFilters, from Filterable
        return ListingData.of(ROWS.stream()
            .filter(r -> text == null || text.isBlank() || r.customer().contains(text))
            .filter(r -> filters == null || filters.status() == null || filters.status().equals(r.status()))
            .toList());
    }
}
```

`Searchable`/`Filterable` here are the **interfaces** (`io.mateu.uidl.interfaces`), not the
annotations of the same name. `ListingData.of(list)` hands Mateu the whole list (it sorts and
pages in memory); for database paging return `new ListingData<>(new Page<>(signature, pageSize,
pageNumber, totalElements, rows))` built from `request.pageable()`. A listing renders as a table
by default (`gridLayout()` = `auto` = table); override it for `cards`, `list`, `masterDetail` or
`tree`.

- Bare `Listing<Row>`: just the table (sorting + pagination free). No search box, no buttons.
- Input capabilities (declare): `Searchable` → search box; `Filterable<F>` → filter bar built
  reflectively from `F` (`filters(request)` typed accessor).
- Interaction capabilities (implement — the page auto-promotes to a CRUD mediator serving ONLY
  what's declared): `Navigable<Detail,Id>` (`view(id)` → clickable rows + `/:id`),
  `Editable<Editor,Id>` (`edit(id)`+`save()`; WITHOUT Navigable the editor opens in a drawer
  over the listing — the "editable listing" idiom), `Creatable<Form,Id>`
  (`creationForm()`+`create()` → New + `/new`), `Deletable<Id>` (`deleteAllById(ids)` →
  selection + Delete).
- `SearchRequest` carries `searchText/filters/criteria/pageable` — the signature never changes.
- `ReactiveListing<Row>` is the Reactor twin. `@ListToolbarButton` bulk methods work on
  capability listings too.

Rule of thumb: listing that may grow → `Listing` + capabilities (additive). Entity CRUD →
`AutoCrud<T>` (one line). CRUD with distinct per-screen models → `extends Crud<V,E,C,F,R,Id>`
(the full pack — literally a Listing implementing ALL capabilities; its lifecycle is
`search(SearchRequest)`, `view`, `edit`, `save`→id, `creationForm`, `create`→id,
`deleteAllById`) and subtract with `@Not*`/`@ReadOnly`.

## Inline editing on the listing (class-level @InlineEditing)

Annotate the AutoCrud class with `@InlineEditing` to edit rows directly in the listing grid
(table layout): every data column becomes an in-place editor (`@ReadOnly` fields stay
display-only) and each committed cell persists its row immediately via
`store().save(entity)` (update-row action). Override `updateRow(Map, HttpRequest)` to
customise persistence.

```java
@UI("/stock") @InlineEditing
public class StockCrud extends AutoCrud<StockCrud.StockItem> {
    public record StockItem(String id, String name, int units) implements Identifiable {}
    @Override public CrudStore<StockItem> store() { return stockStore; } // a CrudStore<StockItem>
}
```
