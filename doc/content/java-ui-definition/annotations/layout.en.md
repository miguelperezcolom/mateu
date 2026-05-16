---
title: "Layout annotations"
weight: 6
---

# Layout annotations

These annotations control the top-level layout of a declarative page class.

---

# @FormLayout

Renders the page fields in a responsive multi-column grid, the standard layout for forms.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface FormLayout {
    String theme() default "";
    String style() default "";
    int columns() default 2;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `columns` | int | `2` | Number of columns |
| `style` | String | `""` | Inline CSS for the layout container |
| `theme` | String | `""` | Theme variant string |

## Usage

```java
@UI("/customers")
@FormLayout(columns = 3)
public class CustomerForm {
    String firstName;
    String lastName;
    String email;
    String phone;
    LocalDate birthDate;
}
```

---

# @HorizontalLayout

Renders the page content in a horizontal row.

```java
public @interface HorizontalLayout {
    String theme() default "";
    String style() default "";
}
```

## Usage

```java
@UI("/summary")
@HorizontalLayout(style = "gap: 1rem;")
public class SummaryPage {
    Component salesChart;
    Component revenueChart;
}
```

---

# @VerticalLayout

Renders the page content in a vertical column.

```java
public @interface VerticalLayout {
    String theme() default "";
    String style() default "";
}
```

## Usage

```java
@UI("/profile")
@VerticalLayout
public class ProfilePage {
    Component avatar;
    String bio;
}
```

---

# @SplitLayout

Renders the page as a two-panel split layout with a resizable divider.

```java
public @interface SplitLayout {
    String theme() default "";
    String style() default "";
}
```

## Usage

Place `@SplitLayout` on the class. The first field becomes the master panel and the second becomes the detail panel.

```java
@UI("/orders")
@SplitLayout
public class OrdersPage {
    Component orderList;
    Component orderDetail;
}
```

---

# @Scroller

Wraps the page content in a scrollable container.

```java
public @interface Scroller {
    String direction() default "";
    String style() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `direction` | String | `""` | Scroll direction (`"vertical"`, `"horizontal"`, `"both"`) |
| `style` | String | `""` | Inline CSS for the scroller container |

## Usage

```java
@UI("/feed")
@Scroller(direction = "vertical")
public class FeedPage {
    Component items;
}
```
