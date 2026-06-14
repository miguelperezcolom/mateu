---
title: "AutoListAdapter and AutoCrudAdapter"
description: "The data layer behind AutoListOrchestrator and AutoCrudOrchestrator."
---

Both adapters implement the `CrudAdapter` interface and back the auto orchestrators. They provide default implementations for every operation so you only have to supply a `CrudRepository<T>`. Override individual methods to customise specific operations without touching the rest.

---

## AutoListAdapter&lt;T extends Identifiable&gt;

The adapter used by `AutoListOrchestrator<T>`. Read-only: `deleteAllById`, `getEditor`, and `getCreationForm` all throw `UnsupportedOperationException`.

```java
public abstract class AutoListAdapter<T extends Identifiable>
    implements CrudAdapter<Object, Object, Object, T, T, String>
```

### The one required method

```java
public abstract CrudRepository<T> repository();
```

### Default operation behaviour

| Operation | Default behaviour | Override to… |
|---|---|---|
| `search` | Filters in memory: `toString()` or `Searchable.searchableText()` contains search text | Query a database or external service |
| `getView` | Loads via `repository().findById(id)`, wraps in `AutoNamedView` | Return a projection or a custom view object |
| `deleteAllById` | Throws `UnsupportedOperationException` | — (read-only) |
| `getEditor` | Throws `UnsupportedOperationException` | — (read-only) |
| `getCreationForm` | Throws `UnsupportedOperationException` | — (read-only) |

### Example — repository only

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

### Example — custom search

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

    @Override
    public ListingData<Product> search(
            String searchText, Product filters,
            Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(
            repository.findAll().stream()
                .filter(p -> searchText == null
                    || p.name().toLowerCase().contains(searchText.toLowerCase()))
                .toList());
    }
}
```

---

## AutoCrudAdapter&lt;T extends Identifiable&gt;

The adapter used by `AutoCrudOrchestrator<T>`. Provides full CRUD: the entity itself is used as the view, editor, and creation form via `AutoNamedView<T>`.

```java
public abstract class AutoCrudAdapter<T extends Identifiable>
    implements CrudAdapter<NamedView<T>, NamedView<T>, NamedView<T>, T, T, String>
```

### The one required method

```java
public abstract CrudRepository<T> repository();
```

### Default operation behaviour

| Operation | Default behaviour | Override to… |
|---|---|---|
| `search` | Filters in memory: `toString()` or `Searchable.searchableText()` contains search text | Query a database or external service |
| `getView` | Loads via `repository().findById(id)`, wraps in `AutoNamedView` | Return a custom read-only view |
| `getEditor` | Loads via `repository().findById(id)`, wraps in `AutoNamedView` | Return a custom editor form |
| `getCreationForm` | Instantiates a new `T`, wraps in `AutoNamedView` | Pre-populate the creation form |
| `deleteAllById` | Delegates to `repository().deleteAllById(ids)` | Add custom pre/post delete logic |

### Example — repository only

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

### Example — pre-populated creation form

```java
@Service
public class OrderAdapter extends AutoCrudAdapter<Order> {

    @Override
    public CrudRepository<Order> repository() {
        return orderRepository;
    }

    @Override
    public NamedView<Order> getCreationForm(HttpRequest httpRequest) {
        var order = new Order();
        order.setDate(LocalDate.now());
        order.setStatus(OrderStatus.DRAFT);
        return new AutoNamedView<>(Order.class, order, repository());
    }
}
```

### Example — custom search with database query

```java
@Override
public ListingData<Product> search(
        String searchText, Product filters,
        Pageable pageable, HttpRequest httpRequest) {
    return ListingData.of(
        productJpaRepository.findByNameContainingIgnoreCase(searchText));
}
```

---

## AutoNamedView

Both adapters wrap entities in `AutoNamedView<T>` when returning views, editors, and creation forms. `AutoNamedView` is the bridge between the entity and the form:

- Uses the entity's fields as form inputs.
- Calls `repository().save(entity)` on save.
- Uses `entity.id()` for navigation after save.
- Uses `entity.toString()` (or `Named.name()` if implemented) as the page title.

You rarely interact with `AutoNamedView` directly — the adapters create it for you. You only need it when overriding `getView`, `getEditor`, or `getCreationForm`:

```java
return new AutoNamedView<>(T.class, entity, repository());
```

---

## Choosing between the two

| | `AutoListAdapter<T>` | `AutoCrudAdapter<T>` |
|---|---|---|
| Used with | `AutoListOrchestrator<T>` | `AutoCrudOrchestrator<T>` |
| Read-only detail | ✓ | ✓ |
| Edit | — | ✓ |
| Create | — | ✓ |
| Delete | — | ✓ |

---

## Next

- [AutoListOrchestrator and AutoCrudOrchestrator](/java-user-manual/build/auto-orchestrators/) — the orchestrators that use these adapters
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — when you need a separate filter type with a custom `search()` but still want the rest auto-managed
- [CrudRepository](/java-ui-definition/interfaces/crud-repository/) — the repository interface both adapters depend on
