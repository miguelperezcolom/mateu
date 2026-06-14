---
title: "AutoListOrchestrator and AutoCrudOrchestrator"
description: "The two simplest orchestrators for read-only listings and full CRUD with a single entity type."
---

Both classes use a single type parameter `T` for everything — filters, rows, view, and edit forms. They are the fastest way to get a working listing or CRUD on screen.

---

## AutoListOrchestrator&lt;T extends Identifiable&gt;

A read-only listing with detail view. No create, edit, or delete. The user provides an `AutoListAdapter<T>` that supplies data from a `CrudRepository<T>`.

```java
public abstract class AutoListOrchestrator<T extends Identifiable>
```

### Routes generated

| Route | Purpose |
|---|---|
| `/your-route` | Listing (no New / Delete buttons) |
| `/your-route/:id` | Read-only detail view |

### Methods to implement

| Method | Where | Purpose |
|---|---|---|
| `simpleAdapter()` | Orchestrator | Return your `AutoListAdapter<T>` |
| `repository()` | Adapter | Return the `CrudRepository<T>` used to load data |

### Minimal example

```java
@Service
@UI("/products")
public class ProductListing extends AutoListOrchestrator<Product> {

    private final ProductAdapter adapter;

    public ProductListing(ProductAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public AutoListAdapter<Product> simpleAdapter() {
        return adapter;
    }
}
```

```java
@Service
public class ProductAdapter extends AutoListAdapter<Product> {

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
    @PrimaryKey String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

### Default search behaviour

`AutoListAdapter` filters by calling `item.toString().toLowerCase().contains(searchText)`, or by using `Searchable.searchableText()` if `T` implements `Searchable`. Override `search()` in the adapter to replace this with a database query.

```java
@Service
public class ProductAdapter extends AutoListAdapter<Product> {

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

## AutoCrudOrchestrator&lt;T extends Identifiable&gt;

Full CRUD with list, view, edit, and create. Uses the same entity type `T` for all four screens. The user provides an `AutoCrudAdapter<T>` that supplies a `CrudRepository<T>`.

```java
public abstract class AutoCrudOrchestrator<T extends Identifiable>
```

### Routes generated

| Route | Purpose |
|---|---|
| `/your-route` | Listing |
| `/your-route/:id` | Read-only detail view |
| `/your-route/:id/edit` | Edit form |
| `/your-route/new` | Create form |

### Methods to implement

| Method | Where | Purpose |
|---|---|---|
| `simpleAdapter()` | Orchestrator | Return your `AutoCrudAdapter<T>` |
| `repository()` | Adapter | Return the `CrudRepository<T>` used for all operations |

### Minimal example

```java
@Service
@UI("/products")
public class ProductCrud extends AutoCrudOrchestrator<Product> {

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

### What AutoCrudAdapter provides out of the box

| Operation | Behaviour |
|---|---|
| `search` | Filters by `toString()` or `Searchable.searchableText()` |
| `getView` | Loads entity by id and wraps in `AutoNamedView` |
| `getEditor` | Same as view — entity fields become editable inputs |
| `getCreationForm` | Instantiates a new T and wraps in `AutoNamedView` |
| `deleteAllById` | Delegates to `repository().deleteAllById()` |

Override any of these in the adapter to customise individual operations.

---

## Choosing between the two

| | `AutoListOrchestrator<T>` | `AutoCrudOrchestrator<T>` |
|---|---|---|
| List | ✓ | ✓ |
| Read-only detail | ✓ | ✓ |
| Edit | — | ✓ |
| Create | — | ✓ |
| Delete | — | ✓ |
| Adapter base class | `AutoListAdapter<T>` | `AutoCrudAdapter<T>` |

Use `AutoListOrchestrator` for reference data, audit logs, reporting, or any listing where users should not modify records.

Use `AutoCrudOrchestrator` whenever the listing needs full create / edit / delete capability.

---

## Limitations of the single-type approach

Both orchestrators use `T` for every screen, which means:

- The filter bar shows the same fields as the grid rows.
- The edit form shows the same fields as the detail view.
- The create form is identical to the edit form.

When this is too restrictive, move to:

- [`FilteredAutoListOrchestrator<Filters, Row>`](/java-user-manual/build/filtered-orchestrators/) — separate filter and row types, read-only.
- [`FilteredAutoCrudOrchestrator<Filters, Row>`](/java-user-manual/build/filtered-orchestrators/) — separate filter and row types, full CRUD.
- [`CrudOrchestrator<V,E,C,F,R,Id>`](/java-user-manual/build/full-control-crud-orchestrator/) — full control over every screen.

---

## Next

- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — annotations and layout adjustments before reaching for a custom adapter
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model without leaving the auto variants
- [Full control with CrudOrchestrator](/java-user-manual/build/full-control-crud-orchestrator/) — when each screen needs a separate model
