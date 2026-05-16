---
title: "Anchor"
weight: 33
---

# Anchor

A standard hyperlink rendered as a clickable text element.

## Basic usage

```java
new Anchor("Mateu documentation", "https://mateu.io")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `text` | String | — | Link text |
| `url` | String | — | Target URL (absolute or relative) |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Examples

```java
// External link
new Anchor("Visit our website", "https://example.com")

// Internal navigation
new Anchor("View all orders", "/orders")

// Builder form
Anchor.builder()
    .text("Download PDF")
    .url("/reports/monthly.pdf")
    .build()
```

## Inside other components

```java
VerticalLayout.builder()
    .spacing(true)
    .content(List.of(
        new Text("Need help?"),
        new Anchor("Read the documentation", "https://mateu.io/docs"),
        new Anchor("Contact support", "mailto:support@example.com")
    ))
    .build()
```
