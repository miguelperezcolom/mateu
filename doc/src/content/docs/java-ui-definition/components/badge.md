---
title: "Badge"
---

A small, inline label used to display status, counts, or tags.

## Basic usage

```java
new Badge("Active")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `text` | String | — | Badge text |
| `iconOnLeft` | String | — | Icon name rendered before the text |
| `iconOnRight` | String | — | Icon name rendered after the text |
| `color` | `BadgeColor` | normal | Color theme |
| `primary` | boolean | false | Uses the primary colour fill |
| `small` | boolean | false | Renders a smaller badge |
| `pill` | boolean | false | Rounds the badge into a pill shape |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Colors (`BadgeColor`)

| Value | Typical meaning |
|---|---|
| `normal` | Default grey |
| `success` | Green — positive / active |
| `warning` | Yellow / amber — caution |
| `error` | Red — problem / inactive |
| `info` | Blue — informational |
| `contrast` | High-contrast for accessibility |

## Examples

```java
// Success pill badge
Badge.builder()
    .text("Active")
    .color(BadgeColor.success)
    .pill(true)
    .primary(true)
    .build()

// Small error badge
Badge.builder()
    .text("Failed")
    .color(BadgeColor.error)
    .small(true)
    .build()

// With icon
Badge.builder()
    .text("Verified")
    .iconOnLeft(IconKey.Checkmark.iconName)
    .color(BadgeColor.success)
    .build()
```

## In a list or grid

Badges work well inside grid cell renderers or alongside text:

```java
new HorizontalLayout(
    new Text("Order #1234"),
    Badge.builder().text("Shipped").color(BadgeColor.info).pill(true).build()
)
```
