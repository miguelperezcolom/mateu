---
title: "Listing<Filters, Row>"
description: "A standalone filterable listing with toolbar actions, export, and optional selector support."
---

`Listing<Filters, Row>` is the base class for standalone listings that need custom filters, toolbar actions, or export — without routing to a detail view.

Unlike the orchestrators, a `Listing` is a self-contained component: it handles its own search and actions, but clicking a row does not navigate anywhere (unless you also implement `Selector`). Use it when you need a list on screen but no CRUD flow around it.

```java
public abstract class Listing<Filters, Row>
    implements ListingBackend<Filters, Row>, ActionSupplier
```

---

## What you implement

| Method | Purpose |
|---|---|
| `search(searchText, filters, pageable, httpRequest)` | Return the rows to display |

Everything else is optional.

---

## Minimal example

```java
@Service
@UI("/orders")
public class OrderListing extends Listing<OrderFilters, OrderRow> {

    private final OrderQueryService queryService;

    public OrderListing(OrderQueryService queryService) {
        this.queryService = queryService;
    }

    @Override
    public ListingData<OrderRow> search(
            String searchText, OrderFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return queryService.search(searchText, filters, pageable);
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

The filter bar is generated from `OrderFilters`, the grid columns from `OrderRow`. Both are inferred from the generic parameters via reflection.

---

## Toolbar actions

Annotate methods with `@Toolbar` to add buttons to the listing toolbar. The method receives the HTTP request and can return any action result (message, navigation, etc.).

```java
@Service
@UI("/orders")
public class OrderListing extends Listing<OrderFilters, OrderRow> {

    @Toolbar
    public Object exportSelected(HttpRequest httpRequest) {
        var selectedIds = httpRequest.getSelectedIds();
        exportService.export(selectedIds);
        return new Message("Export started for " + selectedIds.size() + " orders");
    }

    @Override
    public ListingData<OrderRow> search(...) { ... }
}
```

---

## Export

Override any of the three export methods to add the corresponding button to the toolbar. The framework reuses `search()` to gather the data — no additional implementation needed.

| Method | Default | Effect |
|---|---|---|
| `pdfExportable()` | `false` | Adds an "Export PDF" button |
| `excelExportable()` | `false` | Adds an "Export Excel" button |
| `csvExportable()` | `false` | Adds an "Export CSV" button |

```java
@Override public boolean pdfExportable()   { return true; }
@Override public boolean excelExportable() { return true; }
@Override public boolean csvExportable()   { return true; }
```

Excel and PDF require optional modules on the classpath. See [ListingBackend](/java-ui-definition/interfaces/listing-backend/) for the dependency details.

---

## Selector support

When a `Listing` also implements `Selector<IdType>`, it can be used as the search modal for a `@Searchable` field. Clicking a row closes the modal and sets the field value.

```java
@Service
@Scope("prototype")
@Style("min-width: 40rem;")
public class ProductSelector extends Listing<ProductFilters, ProductRow>
        implements Selector<String> {

    @Override
    public ListingData<ProductRow> search(
            String searchText, ProductFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return productService.search(searchText, filters, pageable);
    }

    @Override
    public SelectedItem<String> selected(HttpRequest httpRequest) {
        var row = httpRequest.getClickedRow(ProductRow.class);
        return new SelectedItem<>(row.id(), row.name());
    }
}
```

```java
// In a form that uses the selector
@Searchable(selector = ProductSelector.class, label = ProductLabelSupplier.class)
String productId;
```

---

## Listing vs AutoCrud

| | `Listing<F,R>` | `AutoCrud<T>` |
|---|---|---|
| Filter bar | ✓ | ✓ |
| Custom row type | ✓ | with `FilteredAutoCrud<F,T>` |
| Toolbar actions (`@Toolbar`) | ✓ | — |
| Navigation to detail on row click | — | ✓ |
| Export (PDF/Excel/CSV) | ✓ | — |
| Selector support | ✓ | — |

Use `Listing` when:
- You need toolbar actions or export.
- There is no detail view to navigate to.
- The listing is used as a lookup selector for a `@Searchable` field.
- The listing is embedded inside a form via a `Callable<?>` field.

Use `AutoCrud<T> + @ReadOnly` (or `FilteredAutoCrud<Filters,T> + @ReadOnly`) when you need the same filter flexibility but also want row-click navigation to a detail view.

---

## Bulk import

Implement `UploadEnabled` to add an import button to the toolbar. See [ListingBackend — Bulk import](/java-ui-definition/interfaces/listing-backend/#bulk-import----uploadenabled) for the full pattern.

---

## Next

- [FilteredAutoCrud](/java-user-manual/build/filtered-orchestrators/) — when you need both separate filter types and detail navigation
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — per-row `ColumnAction` and `ColumnActionGroup`
- [ListingBackend reference](/java-ui-definition/interfaces/listing-backend/) — full API reference for `ListingData`, `Pageable`, `Page`, and export modules
