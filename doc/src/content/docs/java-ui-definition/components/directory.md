---
title: "Directory"
---

A categorised navigation directory rendered as a nested menu of labelled links. Useful for landing pages that list available sections.

## Basic usage

```java
Directory.builder()
    .menu(List.of(
        Menu.builder()
            .label("Invoices")
            .submenu(List.of(
                RouteLink.builder().label("All invoices").build(),
                RouteLink.builder().label("Drafts").build()
            ))
            .build()
    ))
    .build()
```

## Properties

### Directory

| Property | Type | Default | Description |
|---|---|---|---|
| `menu` | `List<Menu>` | — | Top-level menu sections |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

### Menu

| Property | Type | Description |
|---|---|---|
| `label` | String | Section heading |
| `submenu` | `List<RouteLink>` | Links within this section |

### RouteLink

| Property | Type | Description |
|---|---|---|
| `label` | String | Link text |
| `href` | String | Target path |

## Full example

```java
Directory.builder()
    .menu(List.of(
        Menu.builder()
            .label("Finance")
            .submenu(List.of(
                RouteLink.builder().label("Invoices").build(),
                RouteLink.builder().label("Payments").build(),
                RouteLink.builder().label("Credit notes").build()
            ))
            .build(),
        Menu.builder()
            .label("Customers")
            .submenu(List.of(
                RouteLink.builder().label("Customer list").build(),
                RouteLink.builder().label("Contacts").build()
            ))
            .build(),
        Menu.builder()
            .label("Reports")
            .submenu(List.of(
                RouteLink.builder().label("Monthly summary").build(),
                RouteLink.builder().label("Annual report").build()
            ))
            .build()
    ))
    .build()
```
