---
title: "Field stereotypes"
weight: 3
aliases:
  - /java-user-manual/field-stereotypes/
---

# Field stereotypes

Mateu infers the UI from your model.

By default, it chooses how a field should be rendered from its Java type.

For example:

- `String` → text field
- `enum` → combobox
- `boolean` → boolean-style control

This means you usually do not need to choose UI components manually.

## Stereotypes (rendering type)

Use `@Stereotype` when you want to override the inferred rendering.

In practice, a stereotype acts as the **rendering type** for a field.

```java
enum Status {
  Draft, Published, Archived
}

@Stereotype(FieldStereotype.radio)
Status status;
```

Without `@Stereotype`, Mateu may render the enum as a combobox.

With `@Stereotype(FieldStereotype.radio)`, it becomes a radio button group.

## Why the name is "stereotype"

Mateu is not primarily asking you to pick a low-level component.

It is asking you to express **presentation intent**.

That is why the concept is called a stereotype:

- the field type defines the data
- the stereotype defines the rendering type

## Mental model

Mateu is:

> inference-first, override-when-needed

You define the data.  
Mateu chooses the UI.  
You override only when necessary.

## Summary

- Java type → default inferred control
- `@Stereotype` → rendering type override
- result → declarative UI without manual component selection
