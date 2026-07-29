---
title: "Listing"
description: "Interface for implementing paginated, searchable list views."
---

`Listing<Row>` is the server-side contract for a grid. Implement it to supply paginated rows; declare the input capabilities (`Searchable`, `Filterable<F>`) on the same class to add the search box and the filter bar. The only method you must provide is `search`; everything else has sensible defaults.

```java
public interface Listing<Row> extends ActionHandler, ActionSupplier {

    ListingData<Row> search(SearchRequest request, HttpRequest httpRequest);

    default boolean selectionEnabled() { return false; }
    default Class<Row> rowClass() { /* auto-inferred via generics */ }
    default GridLayout gridLayout() { return GridLayout.auto; }
    default boolean pdfExportable()   { return false; }
    default boolean excelExportable() { return false; }
    default boolean csvExportable()   { return false; }
}
```

## Type parameter

| Parameter | Description |
|---|---|
| `Row` | A class or record whose fields become the grid columns |

## The `SearchRequest`

Everything a search receives travels in one object, so the signature never changes as inputs grow:

```java
public record SearchRequest(
    String searchText,              // populated when the listing is Searchable
    Object filters,                 // populated when the listing is Filterable<F>
    List<FilterCriterion> criteria, // range / multi-select conditions (CRUD path)
    Pageable pageable)              // page, size, sort
```

| Component | Filled when |
|---|---|
| `searchText()` | The class declares the `Searchable` marker interface — otherwise always empty |
| `filters()` | The class declares `Filterable<F>` — read it typed via `filters(request)`; `null` otherwise |
| `criteria()` | Range/multi-select filter conditions that don't fit the filters object (see [Filters & Listing](/ux-patterns/filters-and-listing/)) |
| `pageable()` | Always — page number, page size, and sort state of the grid |

## Methods

| Method | Description |
|---|---|
| `search(request, httpRequest)` | **Required.** Return a page of rows matching the search criteria |
| `selectionEnabled()` | Return `true` to enable row checkbox selection |
| `rowClass()` | Returns the `Row` class; auto-inferred via generics, rarely overridden |
| `gridLayout()` | Force a specific grid layout. Defaults to `GridLayout.auto` (auto-selection based on column weights). Override to pin a layout: `GridLayout.table`, `.list`, `.cards`, `.masterDetail`, or `.tree` (hierarchical rows with a self-referential `children` list) |

Interaction capabilities — clickable rows, editing, creation, deletion — are separate interfaces (`Navigable`, `Editable`, `Creatable`, `Deletable`) declared on the same class. See [Listings and capabilities](/java-user-manual/build/capability-listings/).

### Overriding `gridLayout()`

```java
@UI("/arrivals")
public class Arrivals implements Listing<ArrivalRow>, Searchable, Filterable<ArrivalFilters> {

    @Override
    public GridLayout gridLayout() {
        return GridLayout.table;   // always render as a classic table
    }

    @Override
    public ListingData<ArrivalRow> search(SearchRequest request, HttpRequest httpRequest) {
        // ...
    }
}
```

See [Listing layout](/java-user-manual/build/listing-layout/) for the full auto-selection algorithm and all available `GridLayout` values.

## Export support

Enable export buttons by overriding any of three boolean methods. The framework reuses `search()` to gather the data and produces the file on the server — no extra query code needed.

| Method | Default | Effect when `true` |
|---|---|---|
| `pdfExportable()` | `false` | Shows an "Export PDF" button in the listing toolbar |
| `excelExportable()` | `false` | Shows an "Export Excel" button in the listing toolbar |
| `csvExportable()` | `false` | Shows an "Export CSV" button in the listing toolbar |

Override one or more to enable the corresponding button:

```java
public class OrdersListing implements Listing<OrderRow>, Searchable, Filterable<OrderFilters> {

    @Override public boolean pdfExportable()   { return true; }
    @Override public boolean excelExportable() { return true; }
    @Override public boolean csvExportable()   { return true; }

    @Override
    public ListingData<OrderRow> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.of(repository.findAll(
            request.searchText(), filters(request), request.pageable()));
    }
}
```

### Required dependencies

**CSV** is built into the `core` module — no extra dependency needed.

**Excel** and **PDF** are in separate optional modules. A button is shown only when its module is on the classpath; if the dependency is absent the button is hidden automatically.

Add the modules you need to `pom.xml`:

```xml
<!-- Excel export via Apache POI -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>export-excel</artifactId>
    <version>${mateu.version}</version>
</dependency>

<!-- PDF export via Apache PDFBox -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>export-pdf</artifactId>
    <version>${mateu.version}</version>
</dependency>
```

Both libraries are Apache 2.0 licensed. If you need a different library (e.g. iText for PDF) you can implement the `PdfExporter` or `ExcelExporter` interface yourself and register it as a CDI bean — the framework will pick it up instead.

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
public class Changes implements Listing<ChangeRow>, Searchable {

    final ChangeQueryService queryService;
    final CreateReleaseForm createReleaseForm;

    @Override
    public ListingData<ChangeRow> search(SearchRequest request, HttpRequest httpRequest) {

        var found = queryService.findAll(request.searchText(), null, request.pageable());

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
public ListingData<CustomerRow> search(SearchRequest request, HttpRequest httpRequest) {

    var rows = repository.findAll().stream()
        .filter(c -> request.searchText().isBlank() || c.name().contains(request.searchText()))
        .map(c -> new CustomerRow(c.id(), c.name(), c.email()))
        .toList();

    return ListingData.of(rows);
}
```

## Bulk import — `UploadEnabled`

If your `Listing` class also implements `UploadEnabled`, the framework adds an "Import" button to the listing toolbar. Clicking it opens an upload widget; the file is sent to `POST /upload` (the same endpoint used by file fields) and, once the upload completes, the framework calls `processUpload()` with the returned file id.

```java
public interface UploadEnabled {
    Object processUpload(String fileId, HttpRequest httpRequest);
}
```

The return value follows the same conventions as any action: a `Message` for a summary, a background job for large imports, or a `ListingData` to refresh the grid immediately.

### Example — synchronous CSV import

```java
public class ProductsListing implements Listing<ProductRow>, Searchable,
        Filterable<ProductFilters>, UploadEnabled {

    final ProductImportService importService;

    @Override
    public Object processUpload(String fileId, HttpRequest httpRequest) {
        var result = importService.importCsv(fileId);
        return Message.success(result.imported() + " records imported, "
                             + result.errors() + " errors.");
    }

    @Override
    public ListingData<ProductRow> search(SearchRequest request, HttpRequest httpRequest) { ... }
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

## ReactiveListing

`ReactiveListing<Row>` is the Project Reactor variant. Use it when your data source is reactive (R2DBC, WebClient, etc.). The contract is identical to `Listing` except that `search` returns `Mono<ListingData<Row>>` and `handleAction` returns `Flux<Object>`. The same input capabilities apply: `Searchable` shows the search box, `Filterable<F>` the filter bar.

```java
public interface ReactiveListing<Row> extends ActionHandler {

    Mono<ListingData<Row>> search(SearchRequest request, HttpRequest httpRequest);

    default boolean selectionEnabled() { return false; }
}
```

### Usage

```java
@Override
public Mono<ListingData<ProductRow>> search(SearchRequest request, HttpRequest httpRequest) {

    return productRepository.findAll(request.searchText(), request.pageable())
        .collectList()
        .map(rows -> ListingData.of(rows));
}
```
