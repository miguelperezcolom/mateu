---
title: "Breadcrumbs"
---

A navigation trail showing the user's current location within the application hierarchy.

## Basic usage

```java
Breadcrumbs.builder()
    .breadcrumbs(List.of(
        new Breadcrumb("Home", "/"),
        new Breadcrumb("Orders", "/orders")
    ))
    .currentItemText("Order #1234")
    .build()
```

## Properties

### Breadcrumbs

| Property | Type | Default | Description |
|---|---|---|---|
| `breadcrumbs` | `List<Breadcrumb>` | — | Ancestor links in order from root to parent |
| `currentItemText` | String | — | Label for the current page (not a link) |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

### Breadcrumb

| Property | Type | Description |
|---|---|---|
| `text` | String | Link label |
| `href` | String | Target URL (empty string = disabled link) |

## Constructors

```java
new Breadcrumb("Home", "/")
new Breadcrumb("Orders", "/orders")
```

## Example: detail page breadcrumb

```java
Breadcrumbs.builder()
    .breadcrumbs(List.of(
        new Breadcrumb("Home", "/"),
        new Breadcrumb("Customers", "/customers"),
        new Breadcrumb("Mateu Pérez", "/customers/42")
    ))
    .currentItemText("Edit")
    .build()
```
