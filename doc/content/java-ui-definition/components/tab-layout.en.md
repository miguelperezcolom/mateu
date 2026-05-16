---
title: "TabLayout"
weight: 6
---

# TabLayout

Organises content into switchable tabs.

## Basic usage

```java
TabLayout.builder()
    .tabs(List.of(
        Tab.builder()
            .label("General")
            .content(generalContent)
            .build(),
        Tab.builder()
            .label("Settings")
            .content(settingsContent)
            .build()
    ))
    .build()
```

## Properties

### TabLayout

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `tabs` | `List<Tab>` | — | Tab definitions |
| `orientation` | `Orientation` | — | `horizontal` (default) or `vertical` |
| `variant` | `TabLayoutVariant` | — | Visual style variant |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

### Tab

| Property | Type | Default | Description |
|---|---|---|---|
| `label` | String | — | Tab header label |
| `content` | `Component` | — | Tab body content |
| `iconOnLeft` | String | — | Icon name rendered before the label |
| `iconOnRight` | String | — | Icon name rendered after the label |
| `selected` | boolean | false | Whether this tab is initially selected |

## Vertical tabs

```java
TabLayout.builder()
    .orientation(Orientation.vertical)
    .tabs(List.of(
        Tab.builder().label("Profile").content(profileForm).build(),
        Tab.builder().label("Security").content(securityForm).build()
    ))
    .build()
```

## Tabs with icons

```java
TabLayout.builder()
    .tabs(List.of(
        Tab.builder()
            .label("Orders")
            .iconOnLeft(IconKey.Cart.iconName)
            .content(ordersGrid)
            .selected(true)
            .build(),
        Tab.builder()
            .label("Invoices")
            .iconOnLeft(IconKey.Document.iconName)
            .content(invoicesGrid)
            .build()
    ))
    .build()
```
