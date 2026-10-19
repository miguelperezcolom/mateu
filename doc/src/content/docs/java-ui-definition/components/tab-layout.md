---
title: "TabLayout"
---

Organises content into switchable tabs.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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
| `badge` | String | — | Small chip next to the label (a count, a status) |
| `active` | boolean | false | Whether this tab is initially selected |
| `shortcut` | String | — | Keyboard shortcut that selects the tab (`alt+1`) |

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

## Tabs with a badge

A tab's header is its text label, optionally with a small `badge` (a count, a status):

```java
TabLayout.builder()
    .tabs(List.of(
        Tab.builder()
            .label("Orders")
            .badge("12")
            .content(ordersGrid)
            .active(true)
            .build(),
        Tab.builder()
            .label("Invoices")
            .content(invoicesGrid)
            .build()
    ))
    .build()
```
