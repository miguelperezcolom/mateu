---
title: "VirtualList"
---

A high-performance scrollable list that only renders visible items. Designed for large datasets where a full `Grid` would be excessive.

## Basic usage

```java
VirtualList.builder()
    .page(new Page<>("", 20, 1, items.size(), items.stream()
        .map(i -> (Component) new Text(i.getName()))
        .toList()))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `page` | `Page<Component>` | — | The current page of rendered components |
| `style` | String | — | Inline CSS — set a fixed height for virtual scrolling |
| `cssClasses` | String | — | CSS class names |

## Page object

Each item in the page is a `Component` — you control exactly how each row looks.

```java
new Page<>(
    sortProperty,   // String
    pageSize,       // int
    pageNumber,     // int (1-based)
    totalItems,     // int
    List<Component> // rendered rows
)
```

## Example with custom row components

```java
List<Component> rows = products.stream()
    .map(p -> HorizontalLayout.builder()
        .spacing(true)
        .content(List.of(
            new Image(p.getImageUrl()),
            new Text(p.getName()),
            new Badge("€ " + p.getPrice())
        ))
        .build())
    .map(Component.class::cast)
    .toList();

VirtualList.builder()
    .page(new Page<>("", 20, 1, products.size(), rows))
    .style("height: 500px;")
    .build()
```

## Tip

Always set an explicit `height` on the `VirtualList` container so the browser knows when to start virtualising.
