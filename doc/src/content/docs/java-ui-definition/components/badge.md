---
title: "Badge"
---

A small, inline label used to display status, counts, or tags.

## Two ways to show badges

| Approach | Where it appears | How to use |
|---|---|---|
| `@Badge` / `@Stereotype(FieldStereotype.badge)` | **Inside the form body**, inline with other fields | Annotate a field |
| `@BadgeInHeader` / `BadgeSupplier` | **Page header strip** alongside the title | Annotate a field or implement the interface |

### `@Badge` — inline field badge

Annotating a boolean field with `@Badge` (shorthand for `@Stereotype(FieldStereotype.badge)`) renders it as a coloured chip in the form body — lit when `true`, muted when `false`.

```java
@ReadOnly @Badge @Label("VIP") boolean vip;
```

### `@BadgeInHeader` — header status chip

Annotating a field with `@BadgeInHeader` moves it to the page header strip and hides it from the form layout. See the [display annotations](/java-ui-definition/annotations/display/#badgeinheader) for full details.

```java
@BadgeInHeader(label = "VIP", color = "success")
boolean vip;
```

For runtime-computed badges implement `BadgeSupplier` — see [metadata suppliers](/java-ui-definition/interfaces/metadata-suppliers/#badgesupplier).

---

## Fluent `Badge` component

### Basic usage

```java
new Badge("Active")
```

### Properties

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

### Colors (`BadgeColor`)

| Value | Typical meaning |
|---|---|
| `normal` | Default grey |
| `success` | Green — positive / active |
| `warning` | Yellow / amber — caution |
| `error` | Red — problem / inactive |
| `info` | Blue — informational |
| `contrast` | High-contrast for accessibility |

### Examples

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

### In a list or grid

Badges work well inside grid cell renderers or alongside text:

```java
new HorizontalLayout(
    new Text("Order #1234"),
    Badge.builder().text("Shipped").color(BadgeColor.info).pill(true).build()
)
```
