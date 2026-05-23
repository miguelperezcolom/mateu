---
title: "Heading Annotations"
description: "Annotations that render fields as H1–H5 HTML headings."
---

## @H1, @H2, @H3, @H4, @H5

All share the same structure:

```java
public @interface H1 { String style() default ""; }
public @interface H2 { String style() default ""; }
// ... H3, H4, H5 identical
```

Applied to a `String` field, renders its value as the corresponding HTML heading element instead of an input field.

| Annotation | HTML element | Typical use |
|------------|-------------|-------------|
| `@H1` | `<h1>` | Page-level heading |
| `@H2` | `<h2>` | Section heading |
| `@H3` | `<h3>` | Sub-section heading |
| `@H4` | `<h4>` | Group heading |
| `@H5` | `<h5>` | Minor heading |

Example — inline headings between form fields:

```java
public class ProductForm {
    @H2
    String basicInfo = "Basic Information";

    String name;
    String description;

    @H2
    String pricingInfo = "Pricing";

    double price;
    String currency;
}
```

The `style` attribute allows custom CSS on the heading element:

```java
@H2(style = "color: var(--primary-color);")
String sectionTitle = "Advanced Settings";
```
