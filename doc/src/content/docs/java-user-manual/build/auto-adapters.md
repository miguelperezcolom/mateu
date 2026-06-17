---
title: "AutoCrudAdapter<T>"
description: "Advanced customisation layer for AutoCrud. Use when you need custom search, pre-populated forms, or custom delete logic."
---

For the common case — supplying a repository — you do **not** need `AutoCrudAdapter`. Just override `repository()` directly in your `AutoCrud<T>` subclass:

```java
@Service
@UI("/products")
public class ProductCrud extends AutoCrud<Product> {

    private final ProductRepository repository;

    public ProductCrud(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public CrudRepository<Product> repository() {
        return repository;
    }
}
```

Use `AutoCrudAdapter<T>` when you need to customise individual CRUD operations (search, view, editor, creation form, or delete) without implementing the full `CrudAdapter` interface.

```java
public abstract class AutoCrudAdapter<T extends Identifiable>
    implements CrudAdapter<NamedView<T>, NamedView<T>, NamedView<T>, T, T, String>
```

---

## Overridable operations

| Operation | Default behaviour | Override to… |
|---|---|---|
| `search` | Filters in memory: `toString()` or `Searchable.searchableText()` contains search text | Query a database or external service |
| `getView` | Loads via `repository().findById(id)`, wraps in `AutoNamedView` | Return a custom read-only view |
| `getEditor` | Loads via `repository().findById(id)`, wraps in `AutoNamedView` | Return a custom editor form |
| `getCreationForm` | Instantiates a new `T`, wraps in `AutoNamedView` | Pre-populate the creation form |
| `deleteAllById` | Delegates to `repository().deleteAllById(ids)` | Add custom pre/post delete logic |

When `@ReadOnly` (or `@NotEditable`, `@NotCreatable`, `@NotDeletable`) is applied to the orchestrator, the framework simply never calls the corresponding write operations — the adapter does not need to do anything special.

---

## Example — custom search

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

## Example — pre-populated creation form

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

---

## AutoNamedView

`AutoCrudAdapter` wraps entities in `AutoNamedView<T>` when returning views, editors, and creation forms. `AutoNamedView` is the bridge between the entity and the form:

- Uses the entity's fields as form inputs.
- Calls `repository().save(entity)` on save.
- Uses `entity.id()` for navigation after save.
- Uses `entity.toString()` (or `Named.name()` if implemented) as the page title.

You rarely interact with `AutoNamedView` directly. You only need it when overriding `getView`, `getEditor`, or `getCreationForm`:

```java
return new AutoNamedView<>(T.class, entity, repository());
```

---

## Next

- [AutoCrud&lt;T&gt;](/java-user-manual/build/auto-orchestrators/) — the orchestrator that uses this adapter
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — when you need a separate filter type with a custom `search()` but still want the rest auto-managed
- [CrudRepository](/java-ui-definition/interfaces/crud-repository/) — the repository interface this adapter depends on
