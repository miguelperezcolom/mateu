---
title: "MasterDetailLayout"
---

A two-panel layout where the master panel (typically a list or grid) sits alongside a detail panel. Row selection in the master panel drives what is shown in the detail panel.

## Basic usage

```java
new MasterDetailLayout(masterComponent, detailComponent)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `master` | `Component` | — | Primary panel — usually a `Grid` or `Listing` |
| `detail` | `Component` | — | Secondary panel — shows the selected item's detail |
| `orientation` | `Orientation` | horizontal | `horizontal` (side by side) or `vertical` |
| `variant` | `SplitLayoutVariant` | minimal | Visual style |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Example

```java
var grid = Grid.builder()
    .content(List.of(
        GridColumn.builder().id("name").label("Name").build(),
        GridColumn.builder().id("email").label("Email").build()
    ))
    .page(new Page<>("", 10, 1, rows.size(), rows))
    .build();

var detail = FormLayout.builder()
    .content(List.of(
        FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
        FormField.builder().id("email").label("Email").dataType(FieldDataType.string).build()
    ))
    .build();

MasterDetailLayout.builder()
    .master(grid)
    .detail(detail)
    .build()
```

## Tip

The default constructor sets `orientation = horizontal` and `variant = minimal`, which is the most common configuration. Use the builder only when you need a different orientation or variant.
