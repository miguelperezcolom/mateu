---
title: "Scroller"
---

Wraps a single component in a scrollable container. Useful when the inner content is larger than the available viewport space.

## Basic usage

```java
Scroller.builder()
    .content(longListComponent)
    .style("height: 300px;")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | The component to make scrollable |
| `style` | String | — | Inline CSS — typically sets `height` or `width` |
| `cssClasses` | String | — | CSS class names |

## Horizontal scroller

```java
var items = new ArrayList<Component>();
for (int i = 0; i < 100; i++) {
    items.add(new Text("Item " + i));
}

Scroller.builder()
    .content(HorizontalLayout.builder()
            .content(items)
            .build())
    .style("width: 20rem;")
    .build()
```

## Vertical scroller with fixed height

```java
Scroller.builder()
    .content(VerticalLayout.builder()
            .content(manyRows)
            .build())
    .style("height: 400px; overflow-y: auto;")
    .build()
```

## Tip

Set an explicit `height` or `width` on the `Scroller` via `style`, otherwise the browser may not know when to show the scrollbar.
