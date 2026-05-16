---
title: "Data annotations"
weight: 15
---

# Data annotations

---

# @MasterDetail

Embeds an inline master-detail grid for a related collection directly inside a form.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MasterDetail {
    String minHeightWhenDetailVisible();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `minHeightWhenDetailVisible` | String | CSS minimum height applied to the layout when the detail panel is open (e.g. `"400px"`) |

## Usage

```java
public class OrderForm {
    String orderId;
    String customer;

    @MasterDetail(minHeightWhenDetailVisible = "400px")
    List<OrderLine> lines;
}
```

---

# @Composition

Links a field to a composed entity managed by a `CompositionCrudRepository`. Mateu renders the field as an embedded editable list of child records.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Composition {
    Class<? extends Named> targetClass();
    Class<? extends CompositionCrudRepository> repositoryClass();
    String foreignKeyField();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `targetClass` | `Class<Named>` | The child entity class |
| `repositoryClass` | `Class<CompositionCrudRepository>` | Repository that manages the child records |
| `foreignKeyField` | String | Name of the foreign key field on the child entity |

## Usage

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

# @Subresource

Marks a field as a sub-resource, rendered as a navigable link to a separate resource page.

```java
public @interface Subresource {}
```

## Usage

```java
public class CustomerForm {
    String customerId;
    String name;

    @Subresource
    InvoiceListPage invoices;
}
```

---

# @PrimaryKey

Marks the field that uniquely identifies a record. Mateu uses it to build URLs and link detail views.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PrimaryKey {}
```

## Usage

```java
public class CustomerRow {
    @PrimaryKey
    String id;
    String name;
    String email;
}
```

---

# @GeneratedValue

Instructs Mateu to auto-generate the field's value using a `ValueGenerator` implementation when a new record is created.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface GeneratedValue {
    Class<? extends ValueGenerator> value();
}
```

## Usage

```java
public class OrderForm {
    @PrimaryKey
    @GeneratedValue(UuidGenerator.class)
    String orderId;

    String customer;
}
```

### Custom generator

```java
public class InvoiceNumberGenerator implements ValueGenerator {
    @Override
    public Object generate() {
        return "INV-" + System.currentTimeMillis();
    }
}
```
