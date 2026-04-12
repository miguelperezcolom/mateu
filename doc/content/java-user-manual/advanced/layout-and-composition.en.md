---
title: "Layout and composition"
weight: 3
aliases:
  - /java-user-manual/layout-and-composition/
---

# Layout and composition

Mateu organizes UI declaratively using layouts, regions and style.

## Layouts

- `@VerticalLayout` (default)
- `@HorizontalLayout`
- `@FormLayout`
- `@SplitLayout`
- `@Accordion`
- `@Tab`

## Page-level styling

You can control page layout using `@Style` at class level.

```java
public class StyleConstants {
  public static final String CONTAINER = "max-width:900px;margin: auto;";
}
```

```java
@Route("/users/:id")
@Style(StyleConstants.CONTAINER)
public class UserDetail {}
```

### What this does

- constrains width
- centers content
- improves readability

## Reusable layout constraints

Instead of repeating styles, define reusable constants:

```java
public class StyleConstants {
  public static final String CONTAINER = "max-width:900px;margin:auto;";
  public static final String WIDE = "max-width:1200px;margin:auto;";
}
```

This enables consistency across pages.

## Mental model

- layout → structure
- regions → placement
- style → constraints + fine control

Mateu combines all three to generate the UI.
