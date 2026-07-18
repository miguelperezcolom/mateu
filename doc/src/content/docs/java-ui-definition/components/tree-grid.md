---
title: "TreeGrid"
---

A hierarchical grid where rows can have child rows, displayed as an expandable tree. Built on top of `Grid` by setting `tree(true)`.

## Basic usage

```java
Grid.builder()
    .content(List.of(
        GridColumn.builder().id("id").label("Id").build(),
        GridColumn.builder().id("name").label("Name").build(),
        GridColumn.builder().id("age").label("Age").build()
    ))
    .page(new Page<>("", 10, 1, 2, List.of(
        Map.of("id", "1000", "name", "VIP", "children", List.of(
            Map.of("id", "1", "name", "Mateu", "age", "17"),
            Map.of("id", "2", "name", "Antònia", "age", "49")
        )),
        Map.of("id", "1001", "name", "Regular", "children", List.of(
            Map.of("id", "3", "name", "Miguel", "age", "56")
        ))
    )))
    .tree(true)
    .build()
```

## How it works

A tree grid is a regular `Grid` with two differences:

1. `tree(true)` enables the hierarchical view.
2. Each row map may include a `"children"` key whose value is a `List` of child row maps. Child rows use the same column definitions as the parent.

Parent rows without a `"children"` key (or with an empty list) are rendered as leaf nodes.

## Properties

See [Grid](./grid/) for the full property reference. The tree-specific property is:

| Property | Type | Default | Description |
|---|---|---|---|
| `tree` | boolean | false | Enables hierarchical/tree display mode |

## Full example

```java
Grid.builder()
    .content(List.of(
        GridColumn.builder().id("id").label("ID").build(),
        GridColumn.builder().id("name").label("Name").build(),
        GridColumn.builder().id("age").label("Age").build()
    ))
    .page(new Page<>("", 10, 1, 3, List.of(
        Map.of("id", "G1", "name", "Group Alpha", "children", List.of(
            Map.of("id", "1", "name", "Alice", "age", "30"),
            Map.of("id", "2", "name", "Bob", "age", "25")
        )),
        Map.of("id", "G2", "name", "Group Beta", "children", List.of(
            Map.of("id", "3", "name", "Charlie", "age", "40")
        )),
        Map.of("id", "4", "name", "Standalone", "age", "55")
    )))
    .tree(true)
    .build()
```

## Note

`TreeGrid` is not a separate class — it is `Grid` with `tree(true)`. All other `Grid` properties (columns, pagination, selection, actions) apply as normal.
