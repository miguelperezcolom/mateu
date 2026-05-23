---
title: "Visibility and access annotations"
---

These annotations control whether a field, action, or page is visible, editable, or accessible.

---

# @Hidden

Hides a field completely from the rendered UI.

```java
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Hidden {
    String value() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | `""` | Optional condition expression; hides the field when the expression evaluates to true |

## Usage

```java
public class OrderForm {
    String orderId;
    String status;

    @Hidden
    String internalCode;   // never shown
}
```

---

# @HiddenInCreate

Hides the field only when the user is creating a new record. Shown in edit and view modes.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface HiddenInCreate {}
```

## Usage

```java
public class OrderForm {
    @HiddenInCreate
    String createdAt;   // auto-set on save, not visible when creating
}
```

---

# @HiddenInEditor

Hides the field only in edit mode. Shown in create and view modes.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface HiddenInEditor {}
```

## Usage

```java
public class OrderForm {
    @HiddenInEditor
    String referenceNumber;   // shown in view, hidden when editing
}
```

---

# @HiddenInList

Hides the field from list/grid column view. Still shown in form views.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface HiddenInList {}
```

## Usage

```java
public class CustomerRow {
    String name;
    String email;

    @HiddenInList
    String internalNotes;   // shown in the detail form, not as a grid column
}
```

---

# @HiddenInView

Hides the field in read-only view mode. Still shown in edit and create modes.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface HiddenInView {}
```

## Usage

```java
public class UserForm {
    @HiddenInView
    String passwordHash;   // only shown when editing
}
```

---

# @ReadOnly

Makes a field non-editable. The value is displayed but cannot be changed by the user.

```java
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ReadOnly {}
```

## Usage on a field

```java
public class OrderForm {
    @ReadOnly
    String createdBy;
}
```

## Usage on a class

When placed on a class, all fields in the page become read-only.

```java
@ReadOnly
public class OrderViewPage {
    String orderId;
    String status;
    String customer;
}
```

---

# @Disabled

Disables a field or button so it is visible but non-interactive.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Disabled {
    String value() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | `""` | Optional condition expression; disables when true |

## Usage

```java
public class OrderForm {
    @Disabled
    String autoCalculatedTotal;

    @Button
    @Disabled("status == 'closed'")
    void reopen() { }
}
```

---

# @EyesOnly

Restricts a field, method, or page to users belonging to specific roles, groups, scopes, or permissions. Users without the required access do not see the element at all.

```java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface EyesOnly {
    String[] roles() default {};
    String[] groups() default {};
    String[] scopes() default {};
    String[] permissions() default {};
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `roles` | String[] | `{}` | Required roles (any match grants access) |
| `groups` | String[] | `{}` | Required groups |
| `scopes` | String[] | `{}` | Required OAuth2 scopes |
| `permissions` | String[] | `{}` | Required permissions |

## Usage

```java
public class CustomerForm {
    String name;
    String email;

    @EyesOnly(roles = {"ADMIN", "FINANCE"})
    String internalCreditScore;

    @Button
    @EyesOnly(roles = "ADMIN")
    void deleteCustomer() { }
}
```

---

# @EditableOnlyWhenCreating

Allows a field to be edited only when creating a new record. It becomes read-only in all subsequent edits.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface EditableOnlyWhenCreating {}
```

## Usage

```java
public class InvoiceForm {
    @EditableOnlyWhenCreating
    String invoiceType;   // set once at creation, never changed after
    String amount;
}
```
