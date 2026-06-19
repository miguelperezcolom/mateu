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
