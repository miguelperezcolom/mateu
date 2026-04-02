---
title: "A real CRUD example"
weight: 11
---

# A real CRUD example

This example shows how a Mateu CRUD can fit inside a hexagonal, DDD-style service.

## Entry point

```java
@UI("/_users")
@Title("Users")
public class UsersHome {

    @Menu
    UsersMenu users;
}
```

## View model (excerpt)

```java
@ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Colspan(2)
@Style("width: 100%;")
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

The `permissions` field is not just a list.

It is a backend-resolved foreign key relationship with:

- dynamic option search
- label resolution
- declarative rendering

## Why this matters

Mateu lets you define rich forms with relationships while keeping:

- query logic in query services
- write logic in use cases
- UI definition in view models

No frontend glue required.
