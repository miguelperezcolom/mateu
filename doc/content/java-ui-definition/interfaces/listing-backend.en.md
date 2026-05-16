---
title: "ListingBackend / ReactiveListingBackend"
weight: 2
---

# ListingBackend

Provides paginated, searchable, and filterable data for a `Listing` or `Grid` component. Implement this interface to wire a server-side data source to a list view.

```java
public interface ListingBackend<Filters, Row> extends ActionHandler, ActionSupplier {

    ListingData<Row> search(
        String searchText,
        Filters filters,
        Pageable pageable,
        HttpRequest httpRequest);

    default boolean selectionEnabled() { return false; }

    default Class<Filters> filtersClass() { ... }
}
```

## Type parameters

| Parameter | Description |
|---|---|
| `Filters` | A class whose fields map to filter inputs shown above the grid |
| `Row` | A class (or record) whose fields map to grid columns |

## Methods

| Method | Description |
|---|---|
| `search(searchText, filters, pageable, httpRequest)` | **Required.** Returns a page of rows matching the search parameters |
| `selectionEnabled()` | Return `true` to enable row checkbox selection |
| `filtersClass()` | Returns the `Filters` class (auto-inferred via generics) |

## Key types

### Pageable

```java
public record Pageable(int page, int size, List<Sort> sort) {}
```

### Sort

```java
public record Sort(String fieldId, Direction direction) {}
```

Direction is `ASC` or `DESC`.

### ListingData

```java
public record ListingData<Row>(Page<Row> page) {}
```

### Page

```java
public record Page<T>(String searchText, int size, int page, int totalPages, List<T> rows) {}
```

## Basic usage

```java
@Route("/customers")
public class CustomerListingPage implements ComponentTreeSupplier, ListingBackend<CustomerFilters, CustomerRow> {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Listing.builder()
            .title("Customers")
            .searchable(true)
            .build();
    }

    @Override
    public ListingData<CustomerRow> search(
            String searchText,
            CustomerFilters filters,
            Pageable pageable,
            HttpRequest httpRequest) {
        var rows = customerRepository.findAll(searchText, filters, pageable);
        return new ListingData<>(new Page<>(searchText, pageable.size(), pageable.page(), rows.totalPages(), rows.content()));
    }
}
```

## Filters class example

```java
public class CustomerFilters {
    @Filterable
    String name;

    @Filterable
    String country;
}
```

## Row class example

```java
public class CustomerRow {
    @PrimaryKey
    String id;

    String name;
    String email;
    String country;

    @Status(
        mappings = @StatusMapping(from = "ACTIVE", to = StatusType.success),
        defaultStatus = StatusType.contrast
    )
    String status;
}
```

---

# ReactiveListingBackend

Reactive variant of `ListingBackend` using Project Reactor. Use when the data source is reactive (e.g. R2DBC).

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

## Usage

```java
@Route("/products")
public class ProductListingPage implements ComponentTreeSupplier, ReactiveListingBackend<ProductFilters, ProductRow> {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Listing.builder().title("Products").searchable(true).build();
    }

    @Override
    public Mono<ListingData<ProductRow>> search(
            String searchText, ProductFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return productRepository.findAll(searchText, pageable)
            .collectList()
            .map(rows -> new ListingData<>(new Page<>(searchText, pageable.size(), pageable.page(), 1, rows)));
    }
}
```
