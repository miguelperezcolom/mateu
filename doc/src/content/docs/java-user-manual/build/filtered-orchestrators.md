---
title: "FilteredAutoCrud"
description: "Add a dedicated filter model to your CRUD without switching to the full Crud class."
---

`AutoCrud<T>` uses the same type `T` for everything — including the filter bar. This works when the entity fields are a reasonable filter form, but breaks down when you need:

- A dedicated filter DTO with fewer or different fields.
- Computed or derived filter parameters that don't exist on the entity.
- A clean separation between what the grid shows and what the filter bar exposes.

`FilteredAutoCrud<Filters, T>` adds a separate `Filters` type while keeping the simplicity of `AutoCrud`.

---

## FilteredAutoCrud&lt;Filters, T&gt;

Separate filter and entity types. Everything else — view, edit form, creation form, and row — still uses `T`.

```java
public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<AutoNamedView<T>, AutoNamedView<T>, AutoNamedView<T>, Filters, T, String>
```

### What to implement

Override `filtersClass()` to tell Mateu which class to use for the filter bar, provide a `repository()` for save/delete/view operations, and override `fetchRows()` to apply the custom filters:

```java
@Service
@UI("/products")
public class ProductCrud extends FilteredAutoCrud<ProductFilters, Product> {

    private final ProductRepository repository;

    public ProductCrud(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public Class filtersClass() {
        return ProductFilters.class;
    }

    @Override
    public CrudRepository<Product> repository() {
        return repository;
    }

    @Override
    public ListingData<Product> fetchRows(
            String searchText, ProductFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return repository.search(searchText, filters.category(), filters.active(), pageable);
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

## Read-only filtered listing

Add `@ReadOnly` (and optionally `@NotNavigable`) to make the listing read-only:

```java
@Service
@UI("/audit-log")
@ReadOnly
public class AuditLog extends FilteredAutoCrud<AuditFilters, AuditEntry> {

    private final AuditRepository repository;

    public AuditLog(AuditRepository repository) { this.repository = repository; }

    @Override
    public Class filtersClass() { return AuditFilters.class; }

    @Override
    public CrudRepository<AuditEntry> repository() { return repository; }
}
```

---

## Choosing the right class

| Class | Filter type | Row type | Write operations |
|---|---|---|---|
| `AutoCrud<T>` | T | T | ✓ (or `@ReadOnly`) |
| `FilteredAutoCrud<Filters,T>` | Filters | T | ✓ (or `@ReadOnly`) |
| `Crud<V,E,C,F,R,Id>` | F | R | ✓ (or `@ReadOnly`, full control) |

Use `FilteredAutoCrud` when:
- The entity itself is the right form for view, edit, and create.
- You need a dedicated filter model (separate DTO with different fields).
- You don't need separate view/editor/creation form types (use `Crud` for that).

---

## Next

- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — explicit separate models for view, editor, creation form, filters, and rows
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — add per-row contextual actions
