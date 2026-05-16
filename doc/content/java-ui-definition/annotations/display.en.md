---
title: "Display annotations"
weight: 14
---

# Display annotations

These annotations control how field values are presented visually.

---

# @H1 – @H5

Render the annotated field value as an HTML heading of the given level.

```java
public @interface H1 { String style() default ""; }
public @interface H2 { String style() default ""; }
public @interface H3 { String style() default ""; }
public @interface H4 { String style() default ""; }
public @interface H5 { String style() default ""; }
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `style` | String | `""` | Inline CSS applied to the heading element |

## Usage

```java
public class ReportPage {
    @H1
    String reportTitle = "Annual Revenue Report";

    @H2
    String sectionTitle = "Q1 Results";
}
```

---

# @KPI

Renders a field as a KPI (Key Performance Indicator) tile with a large numeric display.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface KPI {}
```

## Usage

```java
public class DashboardPage {
    @KPI
    int totalInvoices = 142;

    @KPI
    String totalRevenue = "€ 48,320";

    @KPI
    double averageOrderValue = 340.28;
}
```

---

# @Status

Maps a string field value to a coloured badge based on a set of `@StatusMapping` rules.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Status {
    StatusMapping[] mappings();
    StatusType defaultStatus();
}

public @interface StatusMapping {
    String from();
    StatusType to();
}
```

## StatusType values

| Value | Colour |
|---|---|
| `success` | Green |
| `error` | Red |
| `warning` | Yellow/orange |
| `info` | Blue |
| `contrast` | High-contrast |
| `primary` | Primary theme colour |

## Usage

```java
public class InvoiceRow {
    String invoiceNumber;

    @Status(
        mappings = {
            @StatusMapping(from = "DRAFT", to = StatusType.info),
            @StatusMapping(from = "SENT", to = StatusType.warning),
            @StatusMapping(from = "PAID", to = StatusType.success),
            @StatusMapping(from = "OVERDUE", to = StatusType.error)
        },
        defaultStatus = StatusType.contrast
    )
    String status;
}
```

---

# @MappedValue

Replaces raw field values with human-readable display strings before rendering.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MappedValue {
    ValueMapping[] mappings();
    String defaultValue();
}

public @interface ValueMapping {
    String from();
    String to();
}
```

## Usage

```java
public class UserRow {
    String name;

    @MappedValue(
        mappings = {
            @ValueMapping(from = "M", to = "Male"),
            @ValueMapping(from = "F", to = "Female"),
            @ValueMapping(from = "X", to = "Non-binary")
        },
        defaultValue = "Unknown"
    )
    String gender;
}
```

---

# @SliderMin / @SliderMax

Set the minimum and maximum values for a slider field (used together with `@Representation(FieldStereotype.slider)`).

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SliderMin { int value(); }

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SliderMax { int value(); }
```

## Usage

```java
public class PricingForm {
    @Representation(FieldStereotype.slider)
    @SliderMin(0)
    @SliderMax(100)
    int discount;
}
```

---

# @Details

Renders the annotated field inside a collapsible `<details>` panel.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Details {
    String theme() default "";
    String style() default "";
    String summary() default "";
    boolean opened() default false;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `summary` | String | `""` | Label shown in the collapsed header |
| `opened` | boolean | `false` | Whether the panel is initially expanded |
| `theme` | String | `""` | Visual theme variant |
| `style` | String | `""` | Inline CSS |

## Usage

```java
public class OrderForm {
    String orderId;
    String status;

    @Details(summary = "Internal notes", opened = false)
    String internalNotes;
}
```

---

# @Widget

Renders a field as a widget in the dashboard or widget area of a page.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Widget {}
```

## Usage

```java
public class DashboardPage {
    @Widget
    Component salesChart;

    @Widget
    Component revenueKpi;
}
```
