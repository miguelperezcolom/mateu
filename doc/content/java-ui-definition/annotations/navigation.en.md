---
title: "Navigation annotations"
weight: 9
---

# Navigation annotations

---

# @Menu

Marks a field as a navigation menu entry in a declarative app class.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Menu {
    boolean selected() default false;
    String description() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `selected` | boolean | `false` | Whether this menu item is highlighted as active |
| `description` | String | `""` | Description for AI assistants about this menu entry |

## Usage

```java
@App(AppVariant.DRAWER)
public class MyApplication implements MenuSupplier {

    @Menu
    Component invoices = new Text("Invoices");

    @Menu(selected = true)
    Component dashboard = new Text("Dashboard");
}
```

---

# @Breadcrumb / @Breadcrumbs

`@Breadcrumbs` placed on a class defines a breadcrumb trail. Each entry is a `@Breadcrumb`.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Breadcrumb {
    String label();
    String url();
}

@Retention(RetentionPolicy.RUNTIME)
public @interface Breadcrumbs {
    Breadcrumb[] value();
}
```

## @Breadcrumb attributes

| Attribute | Type | Description |
|---|---|---|
| `label` | String | Displayed link text |
| `url` | String | Navigation target |

## Usage

```java
@UI("/invoices/detail")
@Breadcrumbs({
    @Breadcrumb(label = "Home", url = "/"),
    @Breadcrumb(label = "Invoices", url = "/invoices"),
    @Breadcrumb(label = "Detail", url = "/invoices/detail")
})
public class InvoiceDetailPage implements ComponentTreeSupplier { ... }
```

---

# @Header

Places the annotated field in the page header slot.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Header {}
```

## Usage

```java
public class DashboardPage {
    @Header
    Component topBar = HorizontalLayout.builder()
        .content(List.of(new Text("Welcome back")))
        .build();

    String mainContent;
}
```

---

# @Footer

Places the annotated field in the page footer slot.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Footer {}
```

## Usage

```java
public class ReportPage {
    Component reportBody;

    @Footer
    Component disclaimer = new Text("Generated automatically. Not for legal use.");
}
```
