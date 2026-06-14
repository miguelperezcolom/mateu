---
title: "Filtered orchestrators"
description: "Add a dedicated filter model to your listing or CRUD without switching to the full CrudOrchestrator."
---

`AutoListOrchestrator<T>` and `AutoCrudOrchestrator<T>` use the same type `T` for everything — including the filter bar. This works when the entity fields are a reasonable filter form, but breaks down when you need:

- A dedicated filter DTO with fewer or different fields.
- Computed or derived filter parameters that don't exist on the entity.
- A clean separation between what the grid shows and what the filter bar exposes.

Mateu provides two intermediate orchestrators that add a separate `Filters` type while keeping the simplicity of the auto variants.

---

## FilteredAutoListOrchestrator&lt;Filters, Row&gt;

A read-only listing with separate filter and row types. The user implements `doSearch()` for the listing and `view()` for the detail panel.

```java
public abstract class FilteredAutoListOrchestrator<Filters, Row extends Identifiable>
```

### Methods to implement

| Method | Purpose |
|---|---|
| `doSearch(searchText, filters, pageable, httpRequest)` | Return the matching rows |
| `view(id, httpRequest)` | Return the object shown in the detail panel when a row is clicked |

### Example

```java
@UI("/orders")
public class OrderListing extends FilteredAutoListOrchestrator<OrderFilters, OrderRow> {

    @Override
    public ListingData<OrderRow> doSearch(
            String searchText, OrderFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return orderService.search(searchText, filters, pageable);
    }

    @Override
    public Object view(String id, HttpRequest httpRequest) {
        return orderService.findDetail(id);
    }
}
```

```java
public record OrderFilters(
    OrderStatus status,
    LocalDate from,
    LocalDate to
) {}
```

```java
public record OrderRow(
    @PrimaryKey String id,
    String customer,
    LocalDate date,
    OrderStatus status,
    BigDecimal total
) implements Identifiable {}
```

---

## FilteredAutoCrudOrchestrator&lt;Filters, Row&gt;

Full CRUD with separate filter and row types. The user implements `doSearch()` for the listing and provides a `repository()` for create, edit, delete, and view operations. The row type is reused as the view and edit form.

```java
public abstract class FilteredAutoCrudOrchestrator<Filters, Row extends Identifiable>
```

### Methods to implement

| Method | Purpose |
|---|---|
| `doSearch(searchText, filters, pageable, httpRequest)` | Return the matching rows |
| `repository()` | Provides the `CrudRepository<Row>` used for load, save, and delete |

### Example

```java
@UI("/products")
public class ProductCrud extends FilteredAutoCrudOrchestrator<ProductFilters, Product> {

    private final ProductRepository productRepository;

    public ProductCrud(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ListingData<Product> doSearch(
            String searchText, ProductFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return productRepository.search(searchText, filters.category(), filters.active(), pageable);
    }

    @Override
    public CrudRepository<Product> repository() {
        return productRepository;
    }
}
```

```java
public record ProductFilters(
    String category,
    boolean active
) {}
```

```java
public record Product(
    @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    String category,
    boolean active,
    BigDecimal price
) implements Identifiable {}
```

---

## Choosing the right orchestrator

| Orchestrator | Filter type | Row type | Write operations |
|---|---|---|---|
| `AutoListOrchestrator<T>` | T | T | — |
| `FilteredAutoListOrchestrator<F,R>` | F | R | — |
| `AutoCrudOrchestrator<T>` | T | T | ✓ |
| `FilteredAutoCrudOrchestrator<F,R>` | F | R | ✓ |
| `CrudOrchestrator<V,E,C,F,R,Id>` | F | R | ✓ (full control) |

Use `FilteredAutoListOrchestrator` when:
- You need a dedicated filter model but no write operations.
- The row DTO differs from the entity (e.g., a projection from a query).

Use `FilteredAutoCrudOrchestrator` when:
- You need a dedicated filter model and full CRUD.
- The entity itself is the right form for view and edit.
- You don't need separate view/editor/creation forms (use `CrudOrchestrator` for that).

---

## Next

- [Full control with CrudOrchestrator](/java-user-manual/build/full-control-crud-orchestrator/) — explicit separate models for view, editor, creation form, filters, and rows
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — add per-row contextual actions
