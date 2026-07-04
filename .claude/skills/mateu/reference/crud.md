# Mateu CRUD

A full list + create + edit + view + delete from one class: `extends AutoCrud<T>`,
where `T extends Identifiable`, plus a `CrudRepository<T>`.

```java
@UI("/products")
public class Products extends AutoCrud<Products.Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository(); // or a Spring @Service you inject
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

## Repository

Implement `CrudRepository<T>` over any store (JPA, Mongo, a REST client, in-memory):

```java
class ProductRepository implements CrudRepository<Product> {
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
  (filters by `searchText` via `Searchable.searchableText()`/`toString()`, sorts by
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

## Advanced / custom listing

For server paging/sorting/custom queries on a standalone page, **extend
`Listing<Filters, Row>`** and override `search(...)` (and optionally `gridLayout()`):

```java
@UI("/orders")
public class Orders extends Listing<OrderFilters, OrderRow> {
    @Override
    public ListingData<OrderRow> search(String text, OrderFilters f,
                                        Pageable pageable, HttpRequest req) {
        return ListingData.of(repo.findAll(text, f, pageable));
    }
    @Override public GridLayout gridLayout() { return GridLayout.table; }
}
record OrderFilters(String status, LocalDate from, LocalDate to) {}
record OrderRow(String id, String customer, double total, String status) {}
```

`ListingBackend<Filters, Row>` is the same contract as an **interface** — implement it
when you add listing behaviour to a class that already extends something else (e.g. a
fluent `ComponentTreeSupplier`).

## Inline editing on the listing (class-level @InlineEditing)

Annotate the AutoCrud class with `@InlineEditing` to edit rows directly in the listing grid
(table layout): every data column becomes an in-place editor (`@ReadOnly` fields stay
display-only) and each committed cell persists its row immediately via
`repository().save(entity)` (update-row action). Override `updateRow(Map, HttpRequest)` to
customise persistence.

```java
@UI("/stock") @InlineEditing
public class StockCrud extends AutoCrud<StockItem> {
    @Override public GridLayout gridLayout() { return GridLayout.table; }
    @Override public CrudRepository<StockItem> repository() { /* … */ }
}
```
