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

## Stereotypes (rendering type)

Use `@Stereotype` when you want to override the inferred rendering.

```java
enum Status {
  Draft, Published, Archived
}

@Stereotype(FieldStereotype.radio)
Status status;
```

## Mental model

Mateu is:

> inference-first, override-when-needed
