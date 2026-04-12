---
title: "Foreign keys and options"
weight: 3
aliases:
  - /java-user-manual/foreign-keys-and-options/
---

# Foreign keys and options

Mateu lets you declare relationships in your view models with `@Lookup`.

## A field with a foreign key

```java
@Lookup(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Colspan(2)
@Style("width: 100%;")
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

This tells Mateu:

- how to search available options
- how to resolve labels for selected values
- how to render the relationship in the UI

## Mental model

Use:

- `@Lookup` to define a relationship
- an `OptionsSupplier` to search candidates
- a `LabelSupplier` to render labels
- a `@Stereotype` to choose how the field is presented
