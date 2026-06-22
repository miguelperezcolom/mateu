---
title: "Grids"
---

Grids display collections of data.

## Example

```java
@UI("")
public class Users {

  List<User> users = userService.findAll();

}
```

Mateu renders a table automatically.

## Key idea

Collections = tables.

## Column widths

Annotate a column field with [`@ColumnWidth`](/java-ui-definition/annotations/layout/#columnwidth) to pin it to a fixed width. Columns with an explicit width no longer flex-grow, so the unannotated columns share the remaining space — annotate the narrow columns (codes, flags, dates) and leave the free-text column unannotated.

```java
record GuestRow(
    @ColumnWidth("9rem") String lastName,
    @ColumnWidth("4rem") String paxType,
    String observations            // no width → fills the rest
) {}
```

## Choosing the layout (`gridLayout()`)

A declarative listing (`extends Listing<Filters, Row>`) can force how its rows are laid out by overriding `gridLayout()`. By default the renderer picks a layout from the column weights (`GridLayout.auto`), which for a wide, many-column row can fall back to `masterDetail`. Return `GridLayout.table` (or `list`, `cards`) to force it:

```java
@UI("/arrivals")
public class Arrivals extends Listing<ArrivalFilters, ArrivalRow> {

    @Override
    public GridLayout gridLayout() {
        return GridLayout.table;   // always a classic table
    }

    @Override
    public ListingData<ArrivalRow> search(...) { ... }
}
```

A row class that drives a list/master-detail layout should mark its identifier column with `@Priority(value = 1, identifier = true)` so each row has a visible label.

## URL-based pagination and sorting

CRUD and listing pages sync their pagination, sort, and filter state to the browser URL. This means:

- Sharing or bookmarking a URL preserves the exact page, sort order, and active filters.
- Navigating back in the browser restores the previous listing state.
- Deep-linking directly to `?page=2&sort=name:asc` opens the listing at that page and sort.

The URL parameters are read automatically on component load; no extra code is needed in `search()`.

```
/customers?page=2&sort=lastName:asc
/orders?page=0&sort=createdAt:desc&status=PENDING
```

Query parameters that match filter field names in the `Filters` class are applied to the filter form as well.
