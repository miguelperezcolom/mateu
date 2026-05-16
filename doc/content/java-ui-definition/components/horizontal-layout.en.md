---
title: "HorizontalLayout"
weight: 2
---

# HorizontalLayout

Arranges its children side by side in a row.

## Basic usage

```java
new HorizontalLayout(new Text("Left"), new Text("Right"))
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `content` | `List<Component>` | — | Child components placed left to right |
| `spacing` | boolean | false | Adds gap between children |
| `padding` | boolean | false | Adds inner padding |
| `margin` | boolean | false | Adds outer margin |
| `spacingVariant` | `SpacingVariant` | — | Controls spacing size |
| `verticalAlignment` | `VerticalAlignment` | — | Aligns children vertically (start, center, end, stretch) |
| `justification` | `HorizontalLayoutJustification` | — | Space distribution (start, end, between, around, evenly) |
| `wrap` | boolean | false | Wraps children to the next row when they overflow |
| `flexGrows` | `List<Integer>` | `[]` | Flex-grow values per child |
| `fullWidth` | boolean | false | Stretches to full width |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Convenience constructors

```java
// varargs
new HorizontalLayout(comp1, comp2)

// from list
new HorizontalLayout(List.of(comp1, comp2))
```

## Spacing and alignment

```java
HorizontalLayout.builder()
    .content(List.of(new Text("A"), new Text("B"), new Text("C")))
    .spacing(true)
    .verticalAlignment(VerticalAlignment.center)
    .justification(HorizontalLayoutJustification.between)
    .build()
```

## Space-between distribution

```java
HorizontalLayout.builder()
    .content(List.of(new Text("Left"), new Text("Right")))
    .fullWidth(true)
    .justification(HorizontalLayoutJustification.between)
    .build()
```

## Custom flex-grow

Assign different widths by setting `flexGrows`. The values map positionally to each child.

```java
HorizontalLayout.builder()
    .content(List.of(col1, col2, col3))
    .flexGrows(List.of(2, 1, 1))  // col1 gets twice as much space
    .build()
```
