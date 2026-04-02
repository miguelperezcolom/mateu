---
title: "Layout and composition"
weight: 13
---

# Layout and composition

Mateu provides a sensible default layout so you can build UIs without thinking about structure first.

## Default layout

By default, all elements in a view model are rendered in a vertical layout.

This means:

- no layout configuration is required  
- forms work out of the box  
- you can focus on behavior first  

## Declarative layouts

When you need more control, Mateu lets you define layout using annotations.

### Vertical layout

Use `@VerticalLayout` to group content vertically.

### Horizontal layout

Use `@HorizontalLayout` to place elements side by side.

### Form layout

Use `@FormLayout` for structured forms.

```java
@FormLayout(columns = 2)
class Details {
}
```

### Split layout

Use `@SplitLayout` to divide the screen into two areas.

### Accordion

Use `@Accordion` for collapsible sections.

## Tabs

Use `@Tab` to organize fields and actions into tabbed sections.

```java
@Tab(value = "General", order = 0)
String name;

@Tab(value = "Security", order = 1)
String password;
```

## Styling

Layout annotations support a `style` attribute.

This allows fine-grained visual control using CSS.

```java
@HorizontalLayout(style = "gap: 1rem; align-items: center;")
class Header {
}
```

You can also apply styles at field level:

```java
@Style("width: 100%;")
String name;
```

## Mental model

- no layout → vertical by default  
- layout annotations → structure  
- `@Tab` → grouping  
- `style` → visual fine-tuning  
