---
title: "PageView"
---

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

A rich page wrapper that adds breadcrumbs, badges, KPI tiles, toolbar, and header/footer slots around its content. Use it when you need more than `Form` provides.

The record is `io.mateu.uidl.fluent.PageView` (it used to be called `Page`; the name now belongs to
`io.mateu.uidl.data.Page<T>`, the paged result of a `CrudStore` search). Main components:

```java
@Builder
public record PageView(
    String id,
    String pageTitle,
    String favicon,
    String title,
    String subtitle,
    List<Breadcrumb> breadcrumbs,
    Component avatar,
    @Singular("contentItem") List<Component> content,
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<UserTrigger> buttons,
    @Singular("badgeItem") List<Badge> badges,
    @Singular("kpiItem") List<KPI> kpis,
    String style,
    String cssClasses,
    @Singular("actionItem") List<Action> actions)
    implements Component, ActionSupplier { /* … more components … */ }
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
return PageView.builder()
    .title("Invoice #1234")
    .subtitle("Created 2025-01-15")
    .breadcrumbs(List.of(
        new Breadcrumb("Home", "/"),
        new Breadcrumb("Invoices", "/invoices"),
        new Breadcrumb("#1234", "/invoices/1234")))
    .contentItem(invoiceContent)
    .build();
```

## With KPIs and badges

```java
return PageView.builder()
    .title("Order #5678")
    .kpiItem(KPI.builder().title("Total").text("€ 1,250").build())
    .kpiItem(KPI.builder().title("Items").text("7").build())
    .badgeItem(Badge.builder().text("PAID").color(BadgeColor.success.name()).build())
    .contentItem(orderContent)
    .build();
```

## With actions

```java
return PageView.builder()
    .title("Customer")
    .actionItem(Action.builder().id("save").build())
    .actionItem(Action.builder().id("delete").confirmationRequired(true).build())
    .contentItem(customerForm)
    .build();
```
