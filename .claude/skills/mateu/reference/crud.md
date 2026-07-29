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
in-memory). The old `CrudRepository`/`repository()` names were removed — always `CrudStore`/`store()`.

```java
class ProductStore implements CrudStore<Product> {
    public Optional<Product> findById(String id) { /* ... */ }
    public String save(Product e) { /* persist */ return e.id(); } // gen id if null
    public List<Product> findAll() { /* ... */ }
    public void deleteAllById(List<String> ids) { /* ... */ }
    // find(searchText, filters, pageable) -> Page<T> is a DEFAULT method:
    //   in-memory over findAll() (text match + sort + page). Override for DB-side paging.
    // public Page<Product> find(String text, Product filters, Pageable p) { ... }
}
```

- The entity implements `Identifiable` (`String id()`).
- `save` returns the id; generate a `UUID.randomUUID().toString()` when it's null/blank.
- `toString()` is the row label in the list.
- `find(String searchText, T filters, Pageable pageable)` returns `Page<T>` (which carries
  `totalElements` — no separate `count` needed). It has a **default** in-memory implementation
  (filters by `searchText` via `SearchableText.searchableText()`/`toString()`, sorts by
  `pageable.sort()` reflectively, then paginates), so you only implement it to push
  search/filter/sort/paging to the database. `AutoCrud` calls `find` to fill the listing.

## Filters

Add `@Filterable` to fields → Mateu renders a filter bar and search automatically:

```java
@NotEmpty @Filterable String name;
@Filterable String department;
```

## Relations (foreign keys)

Use `@Lookup` with server-side suppliers — no DTO duplication:

```java
@Lookup(search = CustomerOptions.class, label = CustomerLabel.class)
String customerId;
```

`CustomerOptions implements LookupOptionsSupplier`, `CustomerLabel implements LookupLabelSupplier`.

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
public class Orders implements Listing<OrderRow>, Searchable, Filterable<OrderFilters> {
    @Override
    public ListingData<OrderRow> search(SearchRequest request, HttpRequest http) {
        var text = request.searchText();      // filled because Searchable
        var filters = filters(request);       // typed OrderFilters, from Filterable
        return ListingData.of(repo.findAll(text, filters, request.pageable()));
    }
    @Override public GridLayout gridLayout() { return GridLayout.table; }
}
record OrderFilters(String status, LocalDate from, LocalDate to) {}
record OrderRow(String id, String customer, double total, String status) {}
```

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
public class StockCrud extends AutoCrud<StockItem> {
    @Override public GridLayout gridLayout() { return GridLayout.table; }
    @Override public CrudStore<StockItem> store() { /* … */ }
}
```
