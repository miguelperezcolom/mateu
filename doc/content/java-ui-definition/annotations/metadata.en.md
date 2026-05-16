---
title: "@Title / @PageTitle / @Subtitle / @Label / @Help"
weight: 4
---

# @Title

Sets the visible title of a page, displayed in the page header.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Title {
    String value();
}
```

## Usage

```java
@UI("/invoices")
@Title("Invoice Management")
public class InvoicePage implements ComponentTreeSupplier { ... }
```

---

# @PageTitle

Sets the browser tab title (`<title>` element in the HTML).

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface PageTitle {
    String value();
}
```

## Usage

```java
@UI("/invoices")
@PageTitle("Invoices – My App")
public class InvoicePage implements ComponentTreeSupplier { ... }
```

## Difference from @Title

- `@Title` controls the heading visible inside the page UI.
- `@PageTitle` controls the browser tab and document title.

---

# @Subtitle

Sets the subtitle shown below the page title.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Subtitle {
    String value();
}
```

## Usage

```java
@Title("Invoice Management")
@Subtitle("All invoices for the current period")
public class InvoicePage implements ComponentTreeSupplier { ... }
```

---

# @Label

Overrides the display label for a field or method. By default Mateu infers the label from the field name.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Label {
    String value();
}
```

## Usage

```java
public class CustomerForm {
    @Label("Full name")
    String name;

    @Label("Date of birth")
    LocalDate dob;
}
```

---

# @Help

Attaches a help text or tooltip to a class, field, or action.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Help {
    String value();
}
```

## Usage

```java
public class CustomerForm {
    @Label("VAT number")
    @Help("Enter the full VAT number including country prefix (e.g. ES12345678A)")
    String vatNumber;
}
```

The help text is shown as a tooltip or helper text below the field, depending on the frontend theme.
