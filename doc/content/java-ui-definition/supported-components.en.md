---
title: "Supported components"
weight: 30
---

# Supported components

Mateu provides a rich set of UI components through its declarative and fluent models.

## Layouts

- VerticalLayout
- HorizontalLayout
- FormLayout
- SplitLayout
- TabLayout
- Accordion
- Board (planned / evolving)
- Master-detail

## Form elements

- text fields
- numbers
- dates
- checkboxes
- selects / comboboxes
- textareas
- rich text
- sliders
- toggles

These are usually inferred from field types and `@Stereotype`.

## Advanced components

From the component model, Mateu also supports:

- master-detail layouts
- scrollers
- containers
- grid/table representations
- composite layouts

## Fluent components

When using the fluent API, you can explicitly build:

```java
new VerticalLayout(
  new Text("Hello"),
  new Button("Click", () -> {})
);
```

## Mental model

- declarative → inferred components
- fluent → explicit component tree
- both → same rendering engine

## Why this matters

You get:

- high-level abstraction by default
- low-level control when needed
