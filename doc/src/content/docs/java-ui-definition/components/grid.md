---
title: "Grid"
---

A paginated data table. Define columns, supply a `Page` of rows, and Mateu renders the table with optional sorting, filtering, frozen columns, and tree mode.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
Grid.builder()
    .content(List.of(
        GridColumn.builder().id("id").label("ID").build(),
        GridColumn.builder().id("name").label("Name").build(),
        GridColumn.builder().id("age").label("Age").build()
    ))
    .page(new Page<>("", 10, 1, rows.size(), rows))
    .build()
```

Rows are `List<Map<String, Object>>` where each key matches a column `id`.

## Grid properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `content` | `List<GridContent>` | — | Column definitions (and optionally group columns) |
| `page` | `Page<?>` | — | Current page of data |
| `tree` | boolean | false | Enables tree/hierarchical mode |
| `size` | int | 0 | Row count hint |
| `wrapCellContent` | boolean | false | Wraps long text inside cells |
| `compact` | boolean | false | Reduces row height |
| `noBorder` | boolean | false | Removes the outer border |
| `noRowBorder` | boolean | false | Removes row separators |
| `columnBorders` | boolean | false | Shows column separators |
| `rowStripes` | boolean | false | Alternates row background colours |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Page object

```java
new Page<>(
    sortProperty,   // String — current sort column
    pageSize,       // int
    pageNumber,     // int (1-based)
    totalItems,     // int
    rows            // List<Map<String, Object>>
)
```

## GridColumn properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Maps to the row map key |
| `label` | String | — | Column header text |
| `dataType` | `FieldDataType` | string | Data type for formatting |
| `stereotype` | `FieldStereotype` | regular | Rendering hint |
| `sortable` | boolean | false | Enables column sorting |
| `sortingProperty` | String | — | Alternative sort property |
| `filterable` | boolean | false | Shows a column filter |
| `frozen` | boolean | false | Freezes the column on the left |
| `frozenToEnd` | boolean | false | Freezes the column on the right |
| `autoWidth` | boolean | false | Sizes column to content |
| `flexGrow` | String | — | CSS flex-grow for column width |
| `width` | String | — | Fixed CSS column width |
| `resizable` | boolean | false | Allows the user to resize the column |
| `align` | `ColumnAlignment` | — | `start`, `center`, `end` |
| `actionId` | String | — | Makes cells clickable and fires this action |
| `tooltipPath` | String | — | Row property shown as a tooltip |

## Column groups

A `GridGroupColumn` puts a header over several columns. It sits in `content` next to the plain
columns:

```java
Grid.builder()
    .content(List.of(
        GridColumn.builder().id("room").label("Room").build(),
        GridGroupColumn.builder()
            .id("occupancy")
            .label("Occupancy")
            .columns(List.of(
                GridColumn.builder().id("adults").label("Adults").build(),
                GridColumn.builder().id("children").label("Children").build()))
            .build()))
    .page(new Page<>("", rows.size(), 0, rows.size(), rows))
    .build()
```

The Vaadin renderer draws a real header group (`vaadin-grid-column-group`). Redwood's `oj-table`,
Swing tables in the IntelliJ plugin and the React Native tables have flat headers, so they show each
grouped column with the group label in front of its own, e.g. "Occupancy · Adults". No column is
dropped. In YAML a group is `type: GridGroupColumn` with its own `columns:` list.

## Sortable and filterable columns

```java
GridColumn.builder()
    .id("name").label("Name")
    .sortable(true)
    .filterable(true)
    .build()
```

## Frozen columns

```java
GridColumn.builder().id("id").label("ID").frozen(true).width("80px").build()
```

## Clickable cell (action on click)

```java
GridColumn.builder()
    .id("name").label("Name")
    .actionId("open_detail")
    .build()
```

## Compact style

```java
Grid.builder()
    .content(columns)
    .page(page)
    .compact(true)
    .rowStripes(true)
    .build()
```

## Tree grid

Supply rows with a `children` key containing nested rows:

```java
List<Map<String, Object>> rows = List.of(
    Map.of("id", "1", "name", "Category A", "children", List.of(
        Map.of("id", "1.1", "name", "Item 1"),
        Map.of("id", "1.2", "name", "Item 2")
    )),
    Map.of("id", "2", "name", "Category B", "children", List.of(
        Map.of("id", "2.1", "name", "Item 3")
    ))
);

Grid.builder()
    .content(columns)
    .page(new Page<>("", 10, 1, rows.size(), rows))
    .tree(true)
    .build()
```
