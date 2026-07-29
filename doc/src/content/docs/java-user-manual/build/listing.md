---
title: "Listing<Row>"
description: "A standalone listing with toolbar actions, export, and optional selector support."
---

`Listing<Row>` is the interface behind every standalone listing: implement its single `search(SearchRequest, HttpRequest)` method and Mateu renders a sortable, paginated grid of `Row` objects. Search box, filter bar, and every interaction (navigation, editing, creation, deletion) are **capabilities** you declare on the same class — see [Listings and capabilities](/java-user-manual/build/capability-listings/) for the full model.

This page covers the standalone-listing extras: toolbar actions, export, and using a listing as a lookup selector.

```java
public interface Listing<Row> extends ActionHandler, ActionSupplier {
    ListingData<Row> search(SearchRequest request, HttpRequest httpRequest);
}
```

---

## What you implement

| Method | Purpose |
|---|---|
| `search(request, httpRequest)` | Return the rows to display — `request` carries `searchText()`, `filters()`, `criteria()`, and `pageable()` |

Everything else is optional.

---

## Minimal example

```java
@UI("/orders")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class OrderListing implements Listing<OrderRow>, Searchable, Filterable<OrderFilters> {

    private final OrderQueryService queryService;

    public OrderListing(OrderQueryService queryService) {
        this.queryService = queryService;
    }

    @Override
    public ListingData<OrderRow> search(SearchRequest request, HttpRequest httpRequest) {
        return queryService.search(request.searchText(), filters(request), request.pageable());
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

`Searchable` shows the free-text search box, `Filterable<OrderFilters>` generates the filter bar from `OrderFilters` (and `filters(request)` returns the hydrated instance, typed), and the grid columns come from `OrderRow` — all inferred via reflection.

---

## Toolbar actions

Annotate methods with `@Toolbar` to add buttons to the listing toolbar. The method receives the HTTP request and can return any action result (message, navigation, etc.).

```java
@UI("/orders")
public class OrderListing implements Listing<OrderRow>, Searchable {

    @Toolbar
    public Object exportSelected(HttpRequest httpRequest) {
        var selectedIds = httpRequest.getSelectedIds();
        exportService.export(selectedIds);
        return new Message("Export started for " + selectedIds.size() + " orders");
    }

    @Override
    public ListingData<OrderRow> search(SearchRequest request, HttpRequest httpRequest) { ... }
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

Excel and PDF require optional modules on the classpath. See [Listing (reference)](/java-ui-definition/interfaces/listing/) for the dependency details.

---

## Selector support

When a `Listing` also implements `Selector<IdType>`, it can be used as the search modal for a `@Searchable` field. Clicking a row closes the modal and sets the field value.

```java
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 40rem;")
public class ProductSelector implements Listing<ProductRow>, Searchable,
        Filterable<ProductFilters>, Selector<String> {

    private String _fieldId;

    @Override
    public String fieldId() { return _fieldId; }

    @Override
    public Selector withFieldId(String fieldId) {
        _fieldId = fieldId;
        return this;
    }

    @Override
    public ListingData<ProductRow> search(SearchRequest request, HttpRequest httpRequest) {
        return productService.search(request.searchText(), filters(request), request.pageable());
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

> Note: the `@Searchable` **annotation** (lookup fields) and the `Searchable` **capability interface** (search box on a listing) are different things that share a name — the annotation goes on the form field, the interface on the listing class.

---

## Listing vs AutoCrud

| | `Listing<Row>` + capabilities | `AutoCrud<T>` |
|---|---|---|
| Search box / filter bar | declare `Searchable` / `Filterable<F>` | ✓ (entity doubles as filters) |
| Custom row type | ✓ | with `FilteredAutoCrud<F,T>` |
| Toolbar actions (`@Toolbar`) | ✓ | — |
| Navigation to detail on row click | declare `Navigable<Detail,Id>` | ✓ |
| Editing / creation / deletion | declare `Editable` / `Creatable` / `Deletable` | ✓ (or `@Not*` / `@ReadOnly`) |
| Export (PDF/Excel/CSV) | ✓ | — |
| Selector support | ✓ | — |

Use `Listing` when:
- You need toolbar actions or export.
- The rows come from a query service and differ from your domain entity.
- The listing is used as a lookup selector for a `@Searchable` field.
- The listing is embedded inside a form via a `Callable<?>` field.
- You want only *some* interactions — declare exactly the capabilities you need.

Use `AutoCrud<T>` (or `FilteredAutoCrud<Filters,T>`) when a single entity backed by a `CrudStore` is the right model for every screen.

---

## Bulk import

Implement `UploadEnabled` to add an import button to the toolbar. See [Listing (reference) — Bulk import](/java-ui-definition/interfaces/listing/#bulk-import----uploadenabled) for the full pattern.

---

## Next

- [Listings and capabilities](/java-user-manual/build/capability-listings/) — the capability model: search, filters, navigation, editing, creation, deletion
- [FilteredAutoCrud](/java-user-manual/build/filtered-orchestrators/) — when you need both separate filter types and detail navigation
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — per-row `ColumnAction` and `ColumnActionGroup`
- [Listing reference](/java-ui-definition/interfaces/listing/) — full API reference for `ListingData`, `Pageable`, `Page`, and export modules
