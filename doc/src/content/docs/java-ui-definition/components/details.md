---
title: "Details"
---

An expand/collapse disclosure widget. The summary is always visible; the content is shown or hidden by the user.

## Basic usage

```java
Details.builder()
    .summary(new Text("More information"))
    .content(new Text("Here is the hidden content."))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `summary` | `Component` | — | Always-visible toggle header |
| `content` | `Component` | — | Content shown when expanded |
| `opened` | boolean | false | Whether the panel starts expanded |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Initially open

```java
Details.builder()
    .summary(new Text("Invoices"))
    .content(invoiceList)
    .opened(true)
    .build()
```

## Rich summary and content

```java
Details.builder()
    .summary(new HorizontalLayout(
        new Icon(IconKey.Document),
        new Text("Pending invoices")
    ))
    .content(VerticalLayout.builder()
        .spacing(true)
        .content(List.of(
            new Text("1,000 invoices pending."),
            new Text("Total: €34,213.01"),
            new Anchor("View all", "/invoices")
        ))
        .build())
    .opened(false)
    .build()
```
