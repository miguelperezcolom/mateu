---
title: "Display Annotations"
description: "Annotations for visual display components: avatars, KPIs, widgets and details."
---

These annotations control how field values are presented visually — as tiles, collapsible panels, navigation entries, or custom widgets.

---

## @Avatar

**Target:** `FIELD`

No attributes. Renders the field as an avatar component — either an image (when the field holds a URL) or a styled initials badge (when the field holds a name string).

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Avatar {}
```

### Example

```java
public class UserCard {
    @Avatar
    String profilePhotoUrl;

    String displayName;
}
```

---

## @KPI

**Target:** `FIELD`

No attributes. Renders the field as a Key Performance Indicator tile — a large numeric metric with a label, intended for dashboard pages.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface KPI {}
```

### Example

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

## @Widget

**Target:** `FIELD`

No attributes. Marks a field as a custom widget. The field's type must implement the appropriate widget interface. Mateu delegates rendering entirely to the widget.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Widget {}
```

### Example

```java
public class DashboardPage {
    @Widget
    Component salesChart;

    @Widget
    Component revenueKpi;
}
```

---

## @Details

**Target:** `FIELD`

Wraps the field content in a collapsible details/summary component. The `summary` attribute is the header shown in the collapsed state; set `opened` to `true` to start the panel expanded.

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

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `summary` | `String` | `""` | Label shown in the collapsed header |
| `opened` | `boolean` | `false` | Whether the panel is initially expanded |
| `theme` | `String` | `""` | Visual theme variant |
| `style` | `String` | `""` | Inline CSS applied to the details container |

### Example

```java
public class OrderForm {
    String orderId;
    String status;

    @Details(summary = "Internal notes", opened = false)
    String internalNotes;
}
```

---

## @Menu

**Target:** `FIELD`

Renders the field as a navigation menu entry. The `description` attribute is a hint for AI assistants to understand the purpose of the menu item.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Menu {
    boolean selected() default false;
    String description() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `selected` | `boolean` | `false` | Whether this menu entry is shown as active/selected |
| `description` | `String` | `""` | Hint text for AI assistants describing the entry's purpose |

### Example

```java
public class SidebarPage {
    @Menu(selected = true, description = "Main overview dashboard")
    Component dashboard;

    @Menu(description = "Manage customer records")
    Component customers;
}
```

---

## @Button

**Target:** `FIELD`, `METHOD`

No attributes. Renders a method as a clickable button, or a field as a button action. When placed on a method, Mateu calls that method on click. See also the [actions](../actions/) reference.

```java
public @interface Button {}
```

### Example

```java
public class OrderForm {
    String orderId;

    @Button
    void save() {
        // called when the button is clicked
    }
}
```

---

## @State

**Target:** `FIELD`

Marks a field as part of the tracked component state. State fields can be referenced in `@Rule` conditions and `@Trigger` expressions without triggering a full server round-trip.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface State {
    String value();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `String` | State identifier used in rule and trigger expressions |

### Example

```java
public class WizardForm {
    @State("currentStep")
    int step = 1;

    String firstName;
    String lastName;
}
```

---

## @Status

**Target:** `FIELD`

Renders an enum or String field as a coloured status badge in listings and detail views. Requires two mandatory attributes — `mappings` (enum value → badge colour) and `defaultStatus` (fallback colour for unmapped values).

```java
public @interface Status {
    StatusMapping[] mappings();
    StatusType defaultStatus();
}
```

```java
public @interface StatusMapping {
    String from();   // enum constant name or string value
    StatusType to(); // badge colour
}
```

### `StatusType` values

| Value | Colour |
|---|---|
| `SUCCESS` | Green |
| `WARNING` | Orange / yellow |
| `DANGER` | Red |
| `INFO` | Blue / informational |
| `NONE` | Default / neutral |

### Example

```java
public enum OrderStatus { PENDING, CONFIRMED, CANCELLED, NO_SHOW }

public class OrderRow {

    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "PENDING",   to = StatusType.WARNING),
            @StatusMapping(from = "CONFIRMED", to = StatusType.SUCCESS),
            @StatusMapping(from = "CANCELLED", to = StatusType.DANGER),
            @StatusMapping(from = "NO_SHOW",   to = StatusType.INFO)
        }
    )
    OrderStatus status;
}
```

> **Note:** Both `mappings` and `defaultStatus` are mandatory — `@Status` alone does not compile. The `from` string must match the enum constant name exactly (case-sensitive).

---

## @Stereotype vs @Representation

These two annotations are closely related but govern different rendering contexts:

| Annotation | Controls |
|---|---|
| `@Stereotype` | The **input widget** used in edit mode |
| `@Representation` | How the value is **displayed** in read-only / list view |

Both can be combined on the same field to independently control each context.

```java
// Edit mode: textarea input; read-only mode: rendered as Markdown
@Stereotype(FieldStereotype.textarea)
@Representation(FieldStereotype.markdown)
String description;
```

See [field-types](../field-types/) for the complete `FieldStereotype` enum reference.
