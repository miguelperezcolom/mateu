---
title: "Field stereotypes"
weight: 6
---

# Field stereotypes

## Inference first

By default, Mateu infers how a field should be rendered from its Java type.

For example:

- `String` → text field  
- `enum` → combobox  
- `boolean` → boolean-style control  

This means you usually do not need to choose UI components manually.

---

## Override with stereotypes

When you want a different rendering, use `@Stereotype`.

```java
enum Status {
  Draft, Published, Archived
}

@Stereotype(FieldStereotype.radio)
Status status;
```

Without `@Stereotype`, Mateu may render the enum as a combobox.

With `@Stereotype(FieldStereotype.radio)`, it becomes a radio button group.

---

## Mental model

Mateu is:

> inference-first, override-when-needed

You define the data.  
Mateu chooses the UI.  
You override only when necessary.
