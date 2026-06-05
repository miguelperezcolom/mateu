---
title: "ListingBackend"
description: "Interface for implementing paginated, searchable list views."
---

`ListingBackend<Filters, Row>` is the server-side contract for a grid. Implement it to supply paginated, searchable, and filterable rows to a `Listing` component. The only method you must provide is `search`; everything else has sensible defaults.

```java
public interface ListingBackend<Filters, Row> extends ActionHandler, ActionSupplier {

    ListingData<Row> search(
        String searchText,
        Filters filters,
        Pageable pageable,
        HttpRequest httpRequest);

    default boolean selectionEnabled() { return false; }
    default Class<Filters> filtersClass() { /* auto-inferred via generics */ }
}
```

## Type parameters

| Parameter | Description |
|---|---|
| `Filters` | A class or record whose fields become the filter form rendered above the grid |
| `Row` | A class or record whose fields become the grid columns |

## Methods

| Method | Description |
|---|---|
| `search(searchText, filters, pageable, httpRequest)` | **Required.** Return a page of rows matching the search criteria |
| `selectionEnabled()` | Return `true` to enable row checkbox selection |
| `filtersClass()` | Returns the `Filters` class; auto-inferred via generics, rarely overridden |

## Export support

When extending the `Listing<Filters, Row>` abstract class, you can enable export buttons by overriding any of three boolean methods. The framework reuses `search()` to gather the data and produces the file on the server.

| Method | Default | Effect when `true` |
|---|---|---|
| `pdfExportable()` | `false` | Shows a "Export PDF" button in the listing toolbar |
| `excelExportable()` | `false` | Shows a "Export Excel" button in the listing toolbar |
| `csvExportable()` | `false` | Shows a "Export CSV" button in the listing toolbar |

Override one or more to enable the corresponding button:

```java
public class OrdersListing extends Listing<OrderFilters, OrderRow> {

    @Override
    public boolean pdfExportable() { return true; }

    @Override
    public boolean excelExportable() { return true; }

    @Override
    public boolean csvExportable() { return true; }

    @Override
    public ListingData<OrderRow> search(String searchText, OrderFilters filters,
                                        Pageable pageable, HttpRequest httpRequest) {
        // same method used for both display and export
        return ListingData.of(repository.findAll(searchText, filters, pageable));
    }
}
```

You can also return `true` from all three to offer all formats at once:

```java
@Override public boolean pdfExportable()   { return true; }
@Override public boolean excelExportable() { return true; }
@Override public boolean csvExportable()   { return true; }
```

## Key supporting types

### Pageable

```java
public record Pageable(int page, int size, List<Sort> sort) {}
```

Mateu populates this from the grid state automatically. `sort` contains zero or more `Sort` entries, each with a `fieldId` and a `Direction` (`ASC` or `DESC`).

### ListingData

```java
public record ListingData<Row>(Page<Row> page, String emptyStateMessage) {}
```

`emptyStateMessage` is optional; when set it is shown in the grid when there are no rows.

**Factory methods:**

| Method | Description |
|---|---|
| `ListingData.of(rows...)` | Wrap a varargs array of rows into a single-page result |
| `ListingData.of(List<Row>)` | Wrap a list of rows into a single-page result |
| `ListingData.from(List<Row>)` | Alias for `of(List<Row>)` |
| `ListingData.builder()...build()` | Builder pattern — use when you need to set all `Page` fields manually |

### Page

```java
public record Page<T>(
    String searchSignature,
    int pageSize,
    int pageNumber,
    long totalElements,
    List<T> content) {}
```

`searchSignature` is an opaque token (typically the search text) used by the grid to detect when the result set has changed. `totalElements` drives the pagination footer.

## Full example

From the Changes demo — a listing of content changes with a toolbar action that reads JWT claims from the `Authorization` header:

```java
@Title("Changes")
@Service
@Scope("prototype")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("max-width:900px;margin: auto;")
public class Changes extends Listing<NoFilters, ChangeRow> {

    final ChangeQueryService queryService;
    final CreateReleaseForm createReleaseForm;

    @Override
    public ListingData<ChangeRow> search(
            String searchText, NoFilters filters, Pageable pageable, HttpRequest httpRequest) {

        var found = queryService.findAll(searchText, filters, pageable);

        return ListingData.<ChangeRow>builder()
                .page(Page.<ChangeRow>builder()
                        .searchSignature(found.page().searchSignature())
                        .totalElements(found.page().totalElements())
                        .pageSize(found.page().pageSize())
                        .pageNumber(found.page().pageNumber())
                        .content(found.page().content().stream()
                                .map(dto -> new ChangeRow(
                                        dto.pageId(), dto.page(), dto.country(), dto.language(),
                                        new Status(mapStatus(dto.status()), dto.status().name()),
                                        new ColumnAction("compare", "Compare")))
                                .toList())
                        .build())
                .build();
    }
}
```

### Minimal example with factory method

When all rows fit in memory and you do not need server-side pagination:

```java
@Override
public ListingData<CustomerRow> search(
        String searchText, CustomerFilters filters,
        Pageable pageable, HttpRequest httpRequest) {

    var rows = repository.findAll().stream()
        .filter(c -> searchText == null || c.name().contains(searchText))
        .map(c -> new CustomerRow(c.id(), c.name(), c.email()))
        .toList();

    return ListingData.of(rows);
}
```

## Bulk import — `UploadEnabled`

If your `Listing` subclass also implements `UploadEnabled`, the framework adds an "Import" button to the listing toolbar. Clicking it opens an upload widget; the file is sent to `POST /upload` (the same endpoint used by file fields) and, once the upload completes, the framework calls `processUpload()` with the returned file id.

```java
public interface UploadEnabled {
    Object processUpload(String fileId, HttpRequest httpRequest);
}
```

The return value follows the same conventions as any action: a `Message` for a summary, a background job for large imports, or a `ListingData` to refresh the grid immediately.

### Example — synchronous CSV import

```java
public class ProductsListing extends Listing<ProductFilters, ProductRow>
        implements UploadEnabled {

    final ProductImportService importService;

    @Override
    public Object processUpload(String fileId, HttpRequest httpRequest) {
        var result = importService.importCsv(fileId);
        return Message.success(result.imported() + " records imported, "
                             + result.errors() + " errors.");
    }

    @Override
    public ListingData<ProductRow> search(...) { ... }
}
```

### Example — background import for large files

```java
@Override
@Action(background = true, sse = true)
public Object processUpload(String fileId, HttpRequest httpRequest) {
    return importService.startAsyncImport(fileId);
}
```

The `/upload` endpoint must be provided by your application — see [File Upload](/java-ui-definition/components/file-upload/) for Spring Boot, Micronaut, and Quarkus examples.

---

## ReactiveListingBackend

`ReactiveListingBackend<Filters, Row>` is the Project Reactor variant. Use it when your data source is reactive (R2DBC, WebClient, etc.). The contract is identical to `ListingBackend` except that `search` returns `Mono<ListingData<Row>>` and `handleAction` returns `Flux<Object>`.

```java
public interface ReactiveListingBackend<Filters, Row> extends ActionHandler {

    Mono<ListingData<Row>> search(
        String searchText,
        Filters filters,
        Pageable pageable,
        HttpRequest httpRequest);

    default boolean selectionEnabled() { return false; }
}
```

### Usage

```java
@Override
public Mono<ListingData<ProductRow>> search(
        String searchText, ProductFilters filters,
        Pageable pageable, HttpRequest httpRequest) {

    return productRepository.findAll(searchText, pageable)
        .collectList()
        .map(rows -> ListingData.of(rows));
}
```
