---
title: "FormLayout"
weight: 3
---

# FormLayout

A responsive multi-column grid designed to host form fields. Mateu uses it as the standard container for `FormField` components.

## Basic usage

```java
FormLayout.builder()
    .content(List.of(
        FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
        FormField.builder().id("age").label("Age").dataType(FieldDataType.integer).build()
    ))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `content` | `List<Component>` | — | Fields and other components placed in the grid |
| `autoResponsive` | boolean | false | Automatically adjusts columns to available width |
| `labelsAside` | boolean | false | Places field labels beside the input instead of above |
| `maxColumns` | int | 0 | Maximum number of columns (0 = unlimited) |
| `columnWidth` | String | — | CSS width for each column (e.g. `"200px"`) |
| `expandColumns` | boolean | false | Columns stretch to fill available space |
| `expandFields` | boolean | false | Fields stretch to fill their column |
| `itemLabelWidth` | String | — | CSS width for all labels when `labelsAside = true` |
| `columnSpacing` | String | — | Gap between columns |
| `itemRowSpacing` | String | — | Gap between rows |
| `itemLabelSpacing` | String | — | Gap between label and field |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Auto-responsive layout

Let Mateu choose the number of columns based on viewport width:

```java
FormLayout.builder()
    .autoResponsive(true)
    .content(List.of(field1, field2, field3, field4))
    .build()
```

## Fixed two-column layout

```java
FormLayout.builder()
    .maxColumns(2)
    .content(List.of(field1, field2, field3, field4))
    .build()
```

## Labels beside fields

```java
FormLayout.builder()
    .labelsAside(true)
    .itemLabelWidth("120px")
    .content(List.of(field1, field2))
    .build()
```

## Grouping fields into rows

Use `FormRow` inside `FormLayout` to explicitly control which fields share a row:

```java
FormLayout.builder()
    .autoResponsive(true)
    .content(List.of(
        FormRow.builder()
            .content(List.of(firstNameField, lastNameField))
            .build(),
        FormRow.builder()
            .content(List.of(emailField, phoneField))
            .build()
    ))
    .build()
```
