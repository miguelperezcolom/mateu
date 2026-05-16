---
title: "Listings"
weight: 10
---

# Listings

`Listing` is the fluent API's data grid component. Combined with `ListingBackend`, it powers searchable, filterable, paginated tables with optional row actions.

---

## The pattern

```java
@Route(value = "/my-listing", parentRoute = "")
public class MyListing implements ComponentTreeSupplier, ListingBackend<MyFilters, MyRow>, TriggersSupplier {

    @Override
    public Listing component(HttpRequest httpRequest) {
        return Listing.builder()
                .title("My listing")
                .id("crud")
                .columns(List.of(
                        GridColumn.builder().id("name").label("Name").sortable(true).build(),
                        GridColumn.builder().id("age").dataType(FieldDataType.integer).label("Age").build()
                ))
                .searchable(true)
                .emptyStateMessage("No results found.")
                .build();
    }

    @Override
    public Class<MyFilters> filtersClass() {
        return MyFilters.class;
    }

    @Override
    public ListingData<MyRow> search(String searchText, MyFilters filters, Pageable pageable, HttpRequest httpRequest) {
        // fetch and filter your data
        var rows = fetchRows(searchText, filters, pageable);
        return new ListingData<>(new Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                rows.totalCount(),
                rows.items()
        ), "No items found.");
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(new OnLoadTrigger("search"));   // auto-load on page open
    }
}
```

---

## Columns

```java
GridColumn.builder()
        .id("name")           // field name in the row record
        .label("Name")        // column header
        .sortable(true)       // enable column sorting
        .build()

// Typed column
GridColumn.builder()
        .id("age")
        .dataType(FieldDataType.integer)
        .label("Age")
        .sortable(true)
        .tooltipPath("description")   // show tooltip from another field
        .build()

// Money column
GridColumn.builder()
        .id("balance")
        .dataType(FieldDataType.money)
        .label("Balance")
        .build()

// Boolean column
GridColumn.builder()
        .id("active")
        .dataType(FieldDataType.bool)
        .label("Active")
        .build()

// Icon column
GridColumn.builder()
        .id("icon")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.icon)
        .label("Icon")
        .build()

// Clickable link column
GridColumn.builder()
        .id("link")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.link)
        .label("Link")
        .build()
```

---

## Filters

Declare filter fields in the listing definition:

```java
Listing.builder()
        .filters(List.of(
                FormField.builder()
                        .id("age")
                        .label("Age")
                        .dataType(FieldDataType.integer)
                        .build()
        ))
        ...
        .build()
```

The filter values are passed to `search()` as a typed `filters` object:

```java
record MyFilters(int age) {}

@Override
public ListingData<MyRow> search(String searchText, MyFilters filters, Pageable pageable, HttpRequest httpRequest) {
    return allItems.stream()
            .filter(item -> filters.age() == 0 || item.age() == filters.age())
            ...
}
```

---

## Sorting

`Pageable` carries the sort state. Use it to sort your data:

```java
@Override
public ListingData<MyRow> search(String searchText, MyFilters filters, Pageable pageable, HttpRequest httpRequest) {
    var sorted = allItems.stream()
            .sorted((a, b) -> {
                for (Sort sort : pageable.sort()) {
                    if ("age".equals(sort.field())) {
                        int compare = Integer.compare(a.age(), b.age());
                        return Direction.ascending.equals(sort.direction()) ? -compare : compare;
                    }
                }
                return 0;
            })
            .toList();
    // paginate
    return new ListingData<>(new Page<>(
            searchText,
            pageable.size(),
            pageable.page(),
            sorted.size(),
            sorted.stream()
                    .skip((long) pageable.size() * pageable.page())
                    .limit(pageable.size())
                    .toList()
    ), "No results.");
}
```

---

## Toolbar buttons

Add buttons above the listing:

```java
Listing.builder()
        .toolbar(List.of(
                Button.builder()
                        .label("Export")
                        .actionId("export")
                        .build()
        ))
        ...
        .build()
```

Handle the action in `handleAction` (override `supportsAction` too):

```java
@Override
public boolean supportsAction(String actionId) {
    if ("export".equals(actionId)) return true;
    return ListingBackend.super.supportsAction(actionId);
}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("export".equals(actionId)) {
        // run export
        return Message.builder().text("Exported!").build();
    }
    return ListingBackend.super.handleAction(actionId, httpRequest);
}
```

---

## Row selection

Enable multi-row selection and respond to selection changes:

```java
Listing.builder()
        .rowsSelectionEnabled(true)
        .onRowSelectionChangedActionId("row-selected")
        ...
        .build()
```

In the action handler, read the selected rows:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("row-selected".equals(actionId)) {
        var selected = httpRequest.getSelectedRows(MyRow.class);
        return Message.builder().text("Selected: " + selected).build();
    }
    return ListingBackend.super.handleAction(actionId, httpRequest);
}
```

---

## Row actions (context menu)

Add per-row action menus using `ColumnActionGroup` in your row record:

```java
@Serdeable
record MyRow(
        String name,
        int age,
        ColumnActionGroup actions   // appears as a context menu in each row
) {}

// Build the rows with different actions per row
new MyRow(
        "Alice",
        30,
        new ColumnActionGroup(new ColumnAction[] {
                new ColumnAction("edit", "Edit", IconKey.Edit.iconName),
                new ColumnAction("delete", "Delete", IconKey.Trash.iconName)
        })
)
```

Add an `actions` column with `dataType(FieldDataType.menu)`:

```java
GridColumn.builder()
        .id("actions")
        .dataType(FieldDataType.menu)
        .label("Actions")
        .build()
```

Handle row actions using `httpRequest.getClickedRow()`:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (List.of("edit", "delete").contains(actionId)) {
        var row = httpRequest.getClickedRow(MyRow.class);
        return Message.builder().text(actionId + " on " + row.name()).build();
    }
    return ListingBackend.super.handleAction(actionId, httpRequest);
}
```

---

## Row detail

Show a detail component when a row is expanded or clicked:

```java
// The detail is stored as a ComponentDto in each row
@Serdeable
record MyRow(String name, ComponentDto detail) {}

// Build rows with detail buttons
new MyRow("Alice",
        mapButtonToDto(Button.builder()
                .label("View")
                .actionId("view-detail")
                .parameters(new Params("Alice"))
                .build()))

// Declare the detail path on the Listing
Listing.builder()
        .detailPath("detail")
        .useButtonForDetail(true)
        ...
        .build()
```

---

## Visual options

```java
Listing.builder()
        .compact(true)            // compact row height
        .rowStripes(true)         // alternate row background
        .columnBorders(true)      // show column dividers
        .noRowBorder(true)        // hide row borders
        .noBorder(true)           // hide all borders
        .allRowsVisible(true)     // show all rows without virtualization
        .gridStyle("height: 400px;")  // inline CSS on the grid element
        .style("width: 100%;")    // inline CSS on the container
        ...
        .build()
```

---

## Listing.builder() summary

| Property | Effect |
|---|---|
| `title` | Heading above the listing |
| `id` | Component id for targeting |
| `columns` | List of `GridColumn` definitions |
| `filters` | Filter form fields |
| `searchable` | Show a search text input |
| `toolbar` | Buttons above the grid |
| `emptyStateMessage` | Text shown when no rows |
| `rowsSelectionEnabled` | Allow row multi-selection |
| `onRowSelectionChangedActionId` | Action to fire on selection change |
| `detailPath` | Field in row holding a detail component |
| `useButtonForDetail` | Show a button to expand the detail |
| `compact` / `rowStripes` / `columnBorders` | Visual style variants |
| `allRowsVisible` | Disable virtualization |
| `gridStyle` / `style` | Inline CSS |

---

## Next

- [Nested apps](/java-user-manual/concepts/fluent-components/fluent-nested-apps/)
- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
