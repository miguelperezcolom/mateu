---
title: "Field type annotations"
---

These annotations control how individual fields are rendered and what input widget is used.

---

# @Lookup

Renders a field as a search-based lookup (autocomplete) that loads options from a `LookupOptionsSupplier`.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Lookup {
    Class<? extends LookupOptionsSupplier> search() default LookupOptionsSupplier.class;
    Class<? extends LabelSupplier> label() default LabelSupplier.class;
    boolean bubble() default false;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `search` | `Class<LookupOptionsSupplier>` | — | Provider that returns matching options for a search term |
| `label` | `Class<LabelSupplier>` | — | Provider that returns the display label for a stored ID |
| `bubble` | boolean | `false` | Bubble the selection event to the parent component |

## Usage

```java
public class InvoiceForm {
    @Lookup(search = CustomerSearchSupplier.class, label = CustomerLabelSupplier.class)
    String customerId;
}
```

---

# @Option

Declares an explicit display label for an enum constant or a select option value.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Option {
    String value();
    String label() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | — | The option's raw value |
| `label` | String | `""` | The display label (defaults to `value` if empty) |

## Usage

```java
public enum InvoiceStatus {
    @Option(value = "DRAFT", label = "Draft")
    DRAFT,
    @Option(value = "SENT", label = "Sent to customer")
    SENT,
    @Option(value = "PAID", label = "Paid")
    PAID
}
```

---

# @OptionsLayout

Controls how options (enum values or boolean fields) are laid out.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OptionsLayout {
    int columns() default 1;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `columns` | int | `1` | Number of columns used to display options |

## Usage

```java
public class SurveyForm {
    @OptionsLayout(columns = 3)
    SatisfactionLevel rating;
}
```

---

# @UseRadioButtons

Renders enum or boolean fields as radio buttons instead of a dropdown.

```java
public @interface UseRadioButtons {}
```

## Usage

```java
public class OrderForm {
    @UseRadioButtons
    DeliveryMethod delivery;
}
```

---

# @Representation / @Stereotype

Sets a non-default field stereotype, overriding the rendering inferred from the Java type.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Representation {
    FieldStereotype value();
}

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Stereotype {
    FieldStereotype value();
}
```

Both annotations are functionally identical; `@Representation` is the preferred name.

## FieldStereotype values (examples)

| Value | Rendered as |
|---|---|
| `email` | Email input |
| `url` | URL input |
| `password` | Password input (masked) |
| `phone` | Phone input |
| `textarea` | Multi-line text area |
| `color` | Colour picker |
| `currency` | Currency-formatted number |
| `percentage` | Percentage-formatted number |
| `slider` | Range slider |
| `toggle` | Toggle switch |
| `rating` | Star rating |

## Usage

```java
public class UserForm {
    @Representation(FieldStereotype.email)
    String contactEmail;

    @Representation(FieldStereotype.password)
    String newPassword;

    @Representation(FieldStereotype.textarea)
    String notes;
}
```

---

# @Filterable

Marks a field as filterable in a listing component. Filterable fields appear as filter inputs above the grid.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Filterable {}
```

## Usage

```java
public class CustomerFilters {
    @Filterable
    String name;

    @Filterable
    String country;
}
```

---

# @Colspan

Controls how many form columns a field spans.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Colspan {
    int value();
}
```

## Usage

```java
@FormLayout(columns = 3)
public class ProductForm {
    String sku;
    String name;

    @Colspan(3)
    String description;   // spans all 3 columns
}
```

---

# @ColumnWidth

Sets the width of a grid column for the annotated field.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ColumnWidth {
    String value();
}
```

## Usage

```java
public class CustomerRow {
    @ColumnWidth("80px")
    String id;

    @ColumnWidth("200px")
    String name;

    String email;
}
```
