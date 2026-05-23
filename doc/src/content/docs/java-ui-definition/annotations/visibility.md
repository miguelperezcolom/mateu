---
title: "Visibility Annotations"
description: "Annotations that control when fields and actions are shown, hidden, or read-only."
---

These annotations control whether a field, action, or page is visible, editable, or accessible to the current user and in the current UI context (list, create form, edit form, view).

---

## @Hidden

**Target:** `TYPE`, `FIELD`

Hides the annotated element entirely from the rendered UI. When placed on a class, the whole page is hidden. The optional `value` attribute can hold a condition expression — when the expression evaluates to `true`, the element is hidden.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD})
public @interface Hidden {
    String value() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | `""` | Optional condition expression; element is hidden when it evaluates to `true`. Leave empty to hide unconditionally. |

### Example

```java
public class OrderForm {
    String orderId;
    String status;

    @Hidden
    String internalCode;        // never rendered
}
```

---

## @HiddenInList

**Target:** `FIELD`

Hides the field in list and grid views only. The field remains visible in create and edit forms and in detail views.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface HiddenInList {}
```

### Example

```java
record Product(
    String id,
    String name,
    @HiddenInList String description,  // shown in the editor, not as a grid column
    ProductStatus status
) {}
```

---

## @HiddenInCreate

**Target:** `FIELD`

Hides the field only in the create form. The field is shown when editing an existing record and in read-only views.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface HiddenInCreate {}
```

### Example

```java
public class OrderForm {
    @HiddenInCreate
    String createdAt;   // auto-set on first save, not shown when creating
}
```

---

## @HiddenInEditor

**Target:** `FIELD`

Hides the field in edit mode. The field is still visible during record creation and in read-only (view) mode.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface HiddenInEditor {}
```

### Example

```java
public class OrderForm {
    @HiddenInEditor
    String referenceNumber;   // shown in view and create, hidden when editing
}
```

---

## @HiddenInView

**Target:** `FIELD`

Hides the field in the read-only detail view. The field is still shown in create and edit forms.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface HiddenInView {}
```

### Example

```java
public class UserForm {
    @HiddenInView
    String passwordHash;   // only rendered in the edit form, not in the view
}
```

---

## @ReadOnly

**Target:** `TYPE`, `FIELD`

Makes the field non-editable. The value is displayed but the user cannot change it. When placed on a class, all fields in that page become read-only.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD})
public @interface ReadOnly {}
```

### Example — single field

```java
@UI("/profile")
@FormLayout(columns = 1)
public class ProfileForm {
    String username;

    @ReadOnly
    String accountId;   // displayed but not editable
}
```

### Example — entire page

```java
@ReadOnly
public class OrderViewPage {
    String orderId;
    String status;
    String customer;
}
```

---

## @Disabled

**Target:** `TYPE`, `FIELD`, `METHOD`

Disables the field or action — it is visible and rendered but not interactive. The optional `value` attribute holds a condition expression that disables the element only when the expression evaluates to `true`.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
public @interface Disabled {
    String value() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | `""` | Optional condition expression; element is disabled when it evaluates to `true`. Leave empty to disable unconditionally. |

### Example

```java
public class OrderForm {
    @Disabled
    String autoCalculatedTotal;    // always disabled

    @Button
    @Disabled("status == 'closed'")
    void reopen() { }              // disabled only when status is closed
}
```

---

## @EditableOnlyWhenCreating

**Target:** `FIELD`

Allows the field to be edited only during new record creation. Once the record is saved, the field becomes read-only in all subsequent edits. This is typically used for primary key or identifier fields that must be set once and never changed.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface EditableOnlyWhenCreating {}
```

### Example

From the Products demo:

```java
record Product(
    @NotEmpty @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    @Stereotype(FieldStereotype.textarea) @HiddenInList String description,
    boolean certified,
    ProductStatus status,
    ColumnActionGroup action,
    @Colspan(2) List<ProductComponent> components
) implements Identifiable { }
```

The `id` field is editable when a new product is created but becomes read-only for all subsequent edits.

---

## @EyesOnly

**Target:** `FIELD`, `METHOD`, `TYPE`

Restricts visibility to users who possess at least one of the listed roles, groups, scopes, or permissions. Users who do not match any of the declared constraints do not see the element at all.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.TYPE})
public @interface EyesOnly {
    String[] roles() default {};
    String[] groups() default {};
    String[] scopes() default {};
    String[] permissions() default {};
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `roles` | `String[]` | `{}` | Required roles — any match grants access |
| `groups` | `String[]` | `{}` | Required groups — any match grants access |
| `scopes` | `String[]` | `{}` | Required OAuth2 scopes — any match grants access |
| `permissions` | `String[]` | `{}` | Required permissions — any match grants access |

### Example

```java
public class CustomerForm {
    String name;
    String email;

    @EyesOnly(roles = {"ADMIN", "FINANCE"})
    String internalCreditScore;

    @Button
    @EyesOnly(roles = {"ADMIN"})
    void deleteCustomer() { }
}
```

---

## @Filterable

**Target:** `FIELD`

Makes the field available as a filter in list views. Mateu renders a filter input for this field in the listing's filter bar.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Filterable {}
```

### Example

```java
record ProductFilters(
    @Filterable String name,
    @Filterable ProductStatus status
) {}
```

---

## @PrimaryKey

**Target:** `FIELD`

Marks the field as the entity's primary key identifier. Mateu uses this to link listing rows to their detail forms.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface PrimaryKey {}
```

### Example

```java
record CustomerRow(
    @PrimaryKey String customerId,
    String name,
    String email
) {}
```

---

## Combining visibility annotations

Annotations compose freely. A common pattern is using `@HiddenInList` together with `@HiddenInCreate` for a computed or derived field that only makes sense in the edit and view forms:

```java
record Invoice(
    @EditableOnlyWhenCreating String invoiceNumber,

    String customerId,
    double subtotal,

    // Computed server-side; hidden in the grid and not shown on create
    @HiddenInList
    @HiddenInCreate
    double vatAmount,

    // Only administrators should see the internal margin
    @EyesOnly(roles = {"ADMIN"})
    double margin
) {}
```

In this example:
- `invoiceNumber` is set once at creation and locked thereafter.
- `vatAmount` is computed after the first save, so it is suppressed from the grid column list and from the create form.
- `margin` is only visible to users with the `ADMIN` role.
