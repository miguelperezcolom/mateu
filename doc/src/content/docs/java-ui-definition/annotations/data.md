---
title: "Data Annotations"
description: "Annotations for data binding, lookups, value mapping and generated values."
---

---

## @Lookup

**Target:** `FIELD`

Turns a field into a search-as-you-type lookup. `search` provides the list of matching options for a given query; `label` resolves the human-readable display label for the stored ID value. Setting `bubble` to `true` propagates the selection event to the parent component.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Lookup {
    Class<? extends LookupOptionsSupplier> search() default LookupOptionsSupplier.class;
    Class<? extends LabelSupplier> label() default LabelSupplier.class;
    boolean bubble() default false;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `search` | `Class<LookupOptionsSupplier>` | — | Provider that returns matching options for a search term |
| `label` | `Class<LabelSupplier>` | — | Provider that returns the display label for a stored ID |
| `bubble` | `boolean` | `false` | Propagate the selection event to the parent component |

### Example

```java
// The field stores an ID; @Lookup resolves the display label
@Lookup(search = CustomerSearchService.class, label = CustomerLabelService.class)
String customerId;

// CustomerSearchService implements LookupOptionsSupplier
// CustomerLabelService implements LabelSupplier
```

---

## @Composition

**Target:** `FIELD`

Embeds a child CRUD collection inside a parent form. Mateu renders the field as an inline, editable list of child records linked to the parent through a foreign key.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Composition {
    Class<? extends Named> targetClass();
    Class<? extends CompositionCrudStore> repositoryClass();
    String foreignKeyField();
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `targetClass` | `Class<Named>` | — | The child entity class |
| `repositoryClass` | `Class<CompositionCrudStore>` | — | Store that manages the child records |
| `foreignKeyField` | `String` | — | Name of the foreign key field on the child entity |

### Example

```java
public class InvoiceForm {
    String invoiceId;

    @Composition(
        targetClass = InvoiceLine.class,
        repositoryClass = InvoiceLineRepository.class,
        foreignKeyField = "invoiceId"
    )
    List<InvoiceLine> lines;
}
```

---

## @MappedValue

**Target:** `FIELD`

Maps one field value to another at display time using a list of `@ValueMapping` from→to pairs. If no mapping matches, `defaultValue` is shown.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MappedValue {
    ValueMapping[] mappings();
    String defaultValue();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `mappings` | `ValueMapping[]` | Array of from→to substitution rules |
| `defaultValue` | `String` | Value shown when no mapping matches |

### Example

```java
@MappedValue(
    mappings = {
        @ValueMapping(from = "M", to = "Male"),
        @ValueMapping(from = "F", to = "Female"),
        @ValueMapping(from = "X", to = "Non-binary")
    },
    defaultValue = "Unknown"
)
String gender;
```

---

## @ValueMapping

A single mapping entry used inside `@MappedValue`. Substitutes the raw value `from` with the display string `to`.

```java
public @interface ValueMapping {
    String from();
    String to();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `from` | `String` | The raw stored value to match |
| `to` | `String` | The display string to substitute |

---

## @GeneratedValue

**Target:** `FIELD`

Automatically fills the field with a generated value using the provided `ValueGenerator` implementation when a new record is created.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface GeneratedValue {
    Class<? extends ValueGenerator> value();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `Class<ValueGenerator>` | The generator implementation to use |

### Example

```java
public class OrderForm {
    @PrimaryKey
    @GeneratedValue(UuidGenerator.class)
    String orderId;

    String customer;
}
```

Custom generator:

```java
public class InvoiceNumberGenerator implements ValueGenerator {
    @Override
    public Object generate() {
        return "INV-" + System.currentTimeMillis();
    }
}
```

---

## @GenericClass

**Target:** `FIELD`, `PARAMETER`

Provides the concrete generic type when Java type erasure hides it at runtime. Mateu uses this hint to correctly introspect parameterised fields.

```java
public @interface GenericClass {
    Class clazz();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `clazz` | `Class` | The concrete type argument (e.g. `MyDto.class`) |

---

## @Subresource

No attributes. Marks a field as a sub-resource reference. Mateu renders it as a navigable link to a separate resource page rather than embedding it inline.

```java
public @interface Subresource {}
```

### Example

```java
public class CustomerForm {
    String customerId;
    String name;

    @Subresource
    InvoiceListPage invoices;
}
```

---

## @Representation

**Target:** `FIELD`

Controls how a field is rendered in read-only / list view. Unlike `@Stereotype`, which controls the input widget in edit mode, `@Representation` governs the display-only presentation.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Representation {
    FieldStereotype value();
}
```

See [field-types](./field-types/) for the full `FieldStereotype` enum reference.

:::tip[Combining @Representation and @Stereotype]
Both annotations can be placed on the same field to independently control the edit-mode widget and the read-only display.
:::

---

## @Option

Declares a custom display label for an enum constant or a select option value. Can be placed directly on enum constants or inside `@OptionsLayout`.

```java
public @interface Option {
    String value();
    String label() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | The option's raw stored value |
| `label` | `String` | `""` | The display label (defaults to `value` if empty) |

### Example

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

## @OptionsLayout

**Target:** `FIELD`

Controls how radio-button or checkbox options are laid out by specifying the number of columns.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OptionsLayout {
    int columns() default 1;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `columns` | `int` | `1` | Number of columns used to display options |

### Example

```java
public class SurveyForm {
    @UseRadioButtons
    @OptionsLayout(columns = 3)
    SatisfactionLevel rating;
}
```
