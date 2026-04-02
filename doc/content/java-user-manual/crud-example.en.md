---
title: "A real CRUD example"
weight: 11
---

# A real CRUD example

## View model excerpt

```java
@EditableOnlyWhenCreating
@NotEmpty
String id;

@NotEmpty
String name;
```

Validation annotations such as `@NotEmpty` are automatically enforced in the UI, without writing any frontend code.

## Relationships

```java
@ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

Mateu handles:

- option loading  
- label resolution  
- rendering  
- interaction  

## Why this matters

Mateu lets you define UI, behavior, relationships, and validation in one place.
