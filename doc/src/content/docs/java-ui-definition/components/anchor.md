---
title: "Anchor"
---

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
| `target` | String | `null` | Browser target, e.g. `_blank` to open the link in a new tab. `_blank` links are emitted with `rel="noopener"` automatically. |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Examples

```java
// External link
new Anchor("Visit our website", "https://example.com")

// Internal navigation
new Anchor("View all orders", "/orders")

// Open in a new tab (rendered with rel="noopener")
Anchor.builder()
    .text("Visit our website")
    .url("https://example.com")
    .target("_blank")
    .build()

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
