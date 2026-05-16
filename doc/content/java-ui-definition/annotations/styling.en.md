---
title: "@Style / @CssClasses / @DivStyle"
weight: 5
---

# @Style

Applies inline CSS to a class, field, or parameter.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Style {
    String value();
}
```

## Usage on a class

```java
@UI("/dashboard")
@Style("max-width: 1200px; margin: auto; padding: 1rem;")
public class DashboardPage implements ComponentTreeSupplier { ... }
```

## Usage on a field

```java
public class InvoiceForm {
    @Style("color: red; font-weight: bold;")
    String status;
}
```

## Predefined style constants

Mateu ships `StyleConstants` with ready-made values:

```java
@Style(StyleConstants.CONTAINER)
public class MyPage implements ComponentTreeSupplier { ... }
```

---

# @CssClasses

Applies one or more CSS class names to a class, field, or parameter.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface CssClasses {
    String value();
}
```

## Usage

```java
@UI("/dashboard")
@CssClasses("my-page highlight-layout")
public class DashboardPage implements ComponentTreeSupplier { ... }
```

---

# @DivStyle

Applies inline CSS to the wrapping `<div>` container of a class, field, or parameter. Useful when you need to style the outer wrapper independently of the component itself.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface DivStyle {
    String value();
}
```

## Usage

```java
public class OrderForm {
    @DivStyle("background: #f5f5f5; padding: 1rem; border-radius: 8px;")
    String notes;
}
```

## Difference from @Style

| Annotation | Styled element |
|---|---|
| `@Style` | The component itself |
| `@DivStyle` | The wrapping container div |
| `@CssClasses` | CSS classes on the component |
