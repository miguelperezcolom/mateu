---
title: "AutoCrud<T>"
description: "The simplest way to get a working CRUD or read-only listing on screen, with a single entity type."
---

`AutoCrud<T>` uses a single type parameter `T` for filters, rows, view, and edit forms. It is the fastest way to get a working CRUD on screen. Capability annotations let you strip write operations one by one — turning the same class into a listing, a read-only catalogue, or any combination in between.

---

## Class signature

```java
public abstract class AutoCrud<T extends Identifiable>
    extends FilteredAutoCrud<T, T>
```

### Methods to implement

| Method | Where | Purpose |
|---|---|---|
| `simpleAdapter()` | AutoCrud | Return your `AutoCrudAdapter<T>` |
| `repository()` | Adapter | Return the `CrudRepository<T>` used for all operations |

---

## Minimal example — full CRUD

```java
@Service
@UI("/products")
public class ProductCrud extends AutoCrud<Product> {

    private final ProductAdapter adapter;

    public ProductCrud(ProductAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return adapter;
    }
}
```

```java
@Service
public class ProductAdapter extends AutoCrudAdapter<Product> {

    private final ProductRepository repository;

    public ProductAdapter(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public CrudRepository<Product> repository() {
        return repository;
    }
}
```

```java
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

This gives you:

| Route | Screen |
|---|---|
| `/products` | Listing with New and Delete buttons |
| `/products/:id` | Read-only detail view with Edit button |
| `/products/:id/edit` | Edit form |
| `/products/new` | Create form |

---

## Controlling capabilities with annotations

Add any combination of these class-level annotations to restrict what users can do:

| Annotation | Effect |
|---|---|
| `@ReadOnly` | Shorthand for `@NotCreatable @NotEditable @NotDeletable` |
| `@NotCreatable` | Hides the New button in the list |
| `@NotEditable` | Hides the Edit button in the detail view |
| `@NotDeletable` | Hides the Delete button in the list |
| `@NotNavigable` | Hides the View button column — rows are not clickable |

These combine freely. A few common patterns:

| Intent | Annotations |
|---|---|
| Full CRUD | *(nothing)* |
| Read-only with detail view | `@ReadOnly` |
| Simple read-only list (no detail) | `@ReadOnly @NotNavigable` |
| List you can add to, but not click into | `@NotNavigable` |
| List you can edit but not create | `@NotCreatable` |
| List you can edit but not delete | `@NotDeletable` |

### Read-only listing example

```java
@Service
@UI("/audit-log")
@ReadOnly
@NotNavigable
public class AuditLog extends AutoCrud<AuditEntry> {

    private final AuditAdapter adapter;

    public AuditLog(AuditAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public AutoCrudAdapter<AuditEntry> simpleAdapter() {
        return adapter;
    }
}
```

The adapter for a read-only `AutoCrud` is still `AutoCrudAdapter<T>`. The write operations are simply never invoked.

---

## What AutoCrudAdapter provides out of the box

| Operation | Behaviour |
|---|---|
| `search` | Filters by `toString()` or `Searchable.searchableText()` |
| `getView` | Loads entity by id and wraps in `AutoNamedView` |
| `getEditor` | Same as view — entity fields become editable inputs |
| `getCreationForm` | Instantiates a new T and wraps in `AutoNamedView` |
| `deleteAllById` | Delegates to `repository().deleteAllById()` |

Override any of these in the adapter to customise individual operations.

### Custom search behaviour

`AutoCrudAdapter` filters by calling `item.toString().toLowerCase().contains(searchText)`, or by using `Searchable.searchableText()` if `T` implements `Searchable`. Override `search()` in the adapter to replace this with a database query.

```java
@Service
public class ProductAdapter extends AutoCrudAdapter<Product> {

    @Override
    public ListingData<Product> search(
            String searchText, Product filters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(repository().findAll().stream()
            .filter(p -> p.name().toLowerCase().contains(searchText.toLowerCase()))
            .toList());
    }

    @Override
    public CrudRepository<Product> repository() {
        return productRepository;
    }
}
```

---

## Limitations of the single-type approach

`AutoCrud<T>` uses `T` for every screen, which means:

- The filter bar shows the same fields as the grid rows.
- The edit form shows the same fields as the detail view.
- The create form is identical to the edit form.

When this is too restrictive, move to:

- [`FilteredAutoCrud<Filters, T>`](/java-user-manual/build/filtered-orchestrators/) — separate filter type, same entity for everything else.
- [`Crud<View,Editor,CreationForm,Filters,Row,Id>`](/java-user-manual/build/full-control-crud-orchestrator/) — full control over every screen.

---

## Next

- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — annotations and layout adjustments before reaching for a custom adapter
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model without leaving the auto variants
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — when each screen needs a separate model
- [EditableView](/java-user-manual/build/editable-view/) — single-entity view with an Edit button, no list
