---
title: "Listing"
---

A configurable grid-based list view with integrated search, filters, column definitions, pagination, and toolbar. Use it in combination with `ListingBackend` to wire it to a data source.

```java
@Builder
public record Listing(
    ListingType listingType,
    String id,
    String title,
    String subtitle,
    List<Trigger> triggers,
    List<UserTrigger> toolbar,
    List<GridContent> columns,
    boolean searchable,
    List<FormField> filters,
    String style,
    String cssClasses,
    String emptyStateMessage,
    Boolean searchOnEnter,
    Boolean autoFocusOnSearchText,
    boolean allRowsVisible,
    int size,
    boolean lazyLoading,
    boolean lazyColumnRendering,
    boolean infiniteScrolling,
    boolean useButtonForDetail,
    boolean columnReorderingAllowed,
    int pageSize,
    boolean rowsSelectionEnabled,
    List<Component> header,
    List<Component> footer,
    boolean wrapCellContent,
    boolean compact,
    boolean noBorder,
    boolean noRowBorder,
    boolean columnBorders,
    boolean rowStripes,
    String vaadinGridCellBackground,
    String vaadinGridCellPadding,
    String gridStyle,
    String detailPath,
    String onRowSelectionChangedActionId,
    String contentHeight)
    implements Component, PageMainContent { }
```

## Key properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Component ID |
| `title` | String | — | List heading |
| `subtitle` | String | — | Subheading |
| `columns` | `List<GridContent>` | `[]` | Column definitions |
| `searchable` | boolean | `false` | Shows a search text input |
| `filters` | `List<FormField>` | `[]` | Filter form fields above the grid |
| `pageSize` | int | `10` | Rows per page |
| `rowsSelectionEnabled` | boolean | `false` | Enables row checkbox selection |
| `searchOnEnter` | Boolean | `true` | Search on Enter key press |
| `autoFocusOnSearchText` | Boolean | `true` | Auto-focus the search box |
| `emptyStateMessage` | String | — | Message shown when there are no results |
| `contentHeight` | String | — | CSS height for the grid area |
| `compact` | boolean | `false` | Compact row density |
| `noBorder` | boolean | `false` | Removes the outer border |
| `rowStripes` | boolean | `false` | Alternating row background colour |
| `columnBorders` | boolean | `false` | Vertical column separators |
| `infiniteScrolling` | boolean | `false` | Enables infinite scroll instead of pagination |
| `detailPath` | String | — | URL prefix for row detail navigation |
| `toolbar` | `List<UserTrigger>` | `[]` | Toolbar action buttons |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Basic usage

```java
@Route("/customers")
public class CustomerListing implements ComponentTreeSupplier, ListingBackend<CustomerFilters, CustomerRow> {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Listing.builder()
            .title("Customers")
            .searchable(true)
            .pageSize(20)
            .rowsSelectionEnabled(true)
            .emptyStateMessage("No customers found")
            .build();
    }

    @Override
    public ListingData<CustomerRow> search(String searchText, CustomerFilters filters, Pageable pageable, HttpRequest httpRequest) {
        // return data
    }
}
```

## With explicit columns

```java
return Listing.builder()
    .title("Orders")
    .column(GridColumn.builder().id("id").label("Order #").build())
    .column(GridColumn.builder().id("customer").label("Customer").build())
    .column(GridColumn.builder().id("total").label("Total").build())
    .searchable(true)
    .build();
```

## With filters

```java
return Listing.builder()
    .title("Invoices")
    .filter(FormField.builder().id("status").label("Status").dataType(FieldDataType.enumeration).build())
    .filter(FormField.builder().id("dateFrom").label("From").dataType(FieldDataType.date).build())
    .searchable(true)
    .build();
```

## Notes

- If no columns are specified, Mateu infers them from the `Row` generic type of `ListingBackend`.
- `Listing` is the fluent equivalent of `Grid` but is designed to work as a full-page component with integrated search and backend data loading.
