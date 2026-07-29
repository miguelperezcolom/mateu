---
title: "Customising AutoCrud behaviour"
description: "Override fetchRows, buildNamedView, or buildCreationForm in your AutoCrud or FilteredAutoCrud subclass to add custom search, pre-populated forms, or custom view logic."
---

`AutoCrud<T>` and `FilteredAutoCrud<Filters, T>` cover the common case out of the box. When you need to go further — custom search queries, pre-populated creation forms, or a custom read-only view — override the protected hooks directly in your subclass. No extra class is needed.

---

## Override points in FilteredAutoCrud

These methods are `public` in `FilteredAutoCrud` and can be overridden in any `AutoCrud` or `FilteredAutoCrud` subclass:

| Method | Default behaviour | Override to… |
|---|---|---|
| `fetchRows(searchText, filters, pageable, httpRequest)` | In-memory filter via `toString()` / `Searchable.searchableText()` | Query a database or external service |
| `buildNamedView(id, httpRequest)` | Loads the entity via `store().findById(id)` | Return a customised entity (pre-loaded data, extra context, etc.) |
| `buildCreationForm(httpRequest)` | Instantiates a new `T` | Return a pre-populated entity for the creation form |

---

## Example — custom search

```java
@Service
@UI("/products")
public class ProductCrud extends FilteredAutoCrud<ProductFilters, Product> {

    private final ProductStore repository;

    public ProductCrud(ProductStore repository) {
        this.repository = repository;
    }

    @Override
    public Class filtersClass() {
        return ProductFilters.class;
    }

    @Override
    public CrudStore<Product> store() {
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

---

## Example — pre-populated creation form

```java
@Service
@UI("/orders")
public class OrderCrud extends AutoCrud<Order> {

    private final OrderStore repository;

    public OrderCrud(OrderStore repository) {
        this.repository = repository;
    }

    @Override
    public CrudStore<Order> store() {
        return repository;
    }

    @Override
    public Order buildCreationForm(HttpRequest httpRequest) {
        var order = new Order();
        order.setDate(LocalDate.now());
        order.setStatus(OrderStatus.DRAFT);
        return order;
    }
}
```

Both hooks return the **entity itself** — Mateu renders its fields, serialises it as the form state, and persists the submitted state through `store()` in the orchestrator's `save()`/`saveNew()`.

---

## When these hooks are not enough

If the view, editor, and creation form need to be **genuinely different types** (different fields, different DTOs), step up to [`Crud<View,Editor,CreationForm,Filters,Row,Id>`](/java-user-manual/build/full-control-crud-orchestrator/) and implement its lifecycle methods directly.

---

## Next

- [FilteredAutoCrud](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — the orchestrator for a fully custom lifecycle
- [CrudStore](/java-ui-definition/interfaces/crud-store/) — the repository contract these hooks delegate to
