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

| Method | Purpose |
|---|---|
| `store()` | Return the `CrudStore<T>` used for all operations |

---

## Minimal example — full CRUD

```java
@Service
@UI("/products")
public class ProductCrud extends AutoCrud<Product> {

    private final ProductStore repository;

    public ProductCrud(ProductStore repository) {
        this.repository = repository;
    }

    @Override
    public CrudStore<Product> store() {
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

    private final AuditRepository repository;

    public AuditLog(AuditRepository repository) {
        this.repository = repository;
    }

    @Override
    public CrudStore<AuditEntry> store() {
        return repository;
    }
}
```

The write operations are simply never invoked for a read-only `AutoCrud`.

---

## What AutoCrud provides out of the box

| Operation | Behaviour |
|---|---|
| `search` | Delegates to `store().find(searchText, filters, pageable)` → `Page<T>` (default: filters by `Searchable.searchableText()`/`toString()`, sorts by `pageable.sort()`, paginates in memory) |
| `getView` | Loads entity by id and wraps in `AutoNamedView` |
| `getEditor` | Same as view — entity fields become editable inputs |
| `getCreationForm` | Instantiates a new T and wraps in `AutoNamedView` |
| `deleteAllById` | Delegates to `store().deleteAllById()` |

For most use cases `store()` is the only method you need to implement. To push search, filtering, sorting and pagination to the database, override [`CrudStore.find(...)`](/java-ui-definition/interfaces/crud-store/#the-find-method) — `AutoCrud` calls it automatically. To customise other operations (pre-populated creation forms, etc.) override the protected hooks `fetchRows()`, `buildNamedView()`, or `buildCreationForm()` directly in your subclass — see [Customising AutoCrud behaviour](/java-user-manual/build/auto-adapters/).

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

- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — annotations and layout adjustments before overriding hooks
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model without leaving the auto variants
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — when each screen needs a separate model
- [EditableView](/java-user-manual/build/editable-view/) — single-entity view with an Edit button, no list
