---
title: "Page"
---

A rich page wrapper that adds breadcrumbs, badges, KPI tiles, toolbar, and header/footer slots around its content. Use it when you need more than `Form` provides.

```java
@Builder
public record Page(
    String id,
    String pageTitle,
    String favicon,
    String title,
    String subtitle,
    List<Breadcrumb> breadcrumbs,
    Component avatar,
    List<Component> content,
    List<Component> header,
    List<Component> footer,
    List<UserTrigger> toolbar,
    List<UserTrigger> buttons,
    List<Badge> badges,
    List<KPI> kpis,
    String style,
    String cssClasses,
    List<Action> actions)
    implements Component, ActionSupplier { }
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Component ID |
| `pageTitle` | String | — | Browser tab title |
| `favicon` | String | — | Browser favicon URL |
| `title` | String | — | Page heading |
| `subtitle` | String | — | Subheading |
| `breadcrumbs` | `List<Breadcrumb>` | — | Navigation breadcrumb trail |
| `avatar` | `Component` | — | Avatar shown in the header |
| `content` | `List<Component>` | — | Main body |
| `header` | `List<Component>` | — | Above the content |
| `footer` | `List<Component>` | — | Below the content |
| `toolbar` | `List<UserTrigger>` | — | Toolbar action buttons |
| `buttons` | `List<UserTrigger>` | — | Bottom action buttons |
| `badges` | `List<Badge>` | — | Status badges in the header |
| `kpis` | `List<KPI>` | — | KPI tiles shown below the title |
| `actions` | `List<Action>` | — | Registered actions for this page |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Basic usage

```java
return Page.builder()
    .title("Invoice #1234")
    .subtitle("Created 2025-01-15")
    .breadcrumb(new Breadcrumb("Home", "/"))
    .breadcrumb(new Breadcrumb("Invoices", "/invoices"))
    .breadcrumb(new Breadcrumb("#1234", "/invoices/1234"))
    .contentItem(invoiceContent)
    .build();
```

## With KPIs and badges

```java
return Page.builder()
    .title("Order #5678")
    .kpiItem(KPI.builder().label("Total").value("€ 1,250").build())
    .kpiItem(KPI.builder().label("Items").value("7").build())
    .badgeItem(Badge.builder().label("PAID").variant(BadgeVariant.success).build())
    .contentItem(orderContent)
    .build();
```

## With actions

```java
return Page.builder()
    .title("Customer")
    .actionItem(Action.builder().id("save").build())
    .actionItem(Action.builder().id("delete").confirmationRequired(true).build())
    .contentItem(customerForm)
    .build();
```
