---
title: "SplitLayout"
---

Divides the available space into two resizable panels: a master (primary) panel and a detail (secondary) panel.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
new SplitLayout(masterComponent, detailComponent)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `master` | `Component` | — | Primary panel (left / top) |
| `detail` | `Component` | — | Secondary panel (right / bottom) |
| `orientation` | `Orientation` | — | `horizontal` (side by side) or `vertical` (top/bottom) |
| `variant` | `SplitLayoutVariant` | — | Visual style (`minimal`, etc.) |
| `fullWidth` | boolean | false | Stretches the layout to full width |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Horizontal split (default)

```java
SplitLayout.builder()
    .master(new Text("Navigation / list"))
    .detail(new Text("Detail view"))
    .orientation(Orientation.horizontal)
    .build()
```

## Vertical split

```java
SplitLayout.builder()
    .master(new Text("Top content"))
    .detail(new Text("Bottom content"))
    .orientation(Orientation.vertical)
    .build()
```

## Minimal variant

```java
SplitLayout.builder()
    .master(masterPanel)
    .detail(detailPanel)
    .variant(SplitLayoutVariant.minimal)
    .fullWidth(true)
    .build()
```

## Tip

`SplitLayout` is ideal for list-detail UIs where the user selects an item on one side and sees its detail on the other. For an integrated master-detail pattern with row selection wired automatically, use [MasterDetailLayout](/java-ui-definition/components/master-detail-layout/) instead.
