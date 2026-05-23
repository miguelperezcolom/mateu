---
title: "@H1 – @H5"
---

Render the annotated field value as an HTML heading element (`<h1>` through `<h5>`). These annotations are typically placed on `String` fields that hold a title or section label.

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
| `style` | String | `""` | Inline CSS applied to the heading |

## Usage

```java
public class ContentPage {
    @H1
    String pageTitle = "Getting started";

    @H2
    String sectionOne = "Installation";

    String installationContent;

    @H2
    String sectionTwo = "Configuration";

    String configContent;
}
```

## Styling

```java
public class ReportPage {
    @H1(style = "color: #2c3e50; margin-bottom: 0.5rem;")
    String reportTitle;
}
```
