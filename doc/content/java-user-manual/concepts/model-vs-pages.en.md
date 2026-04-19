---
title: "Model vs Pages"
weight: 6
---

# Prefer model over pages

In Mateu, most UIs should be defined at the model level instead of creating explicit pages.

## Example

Instead of creating a separate editor page:

```java
@Route("/users/:id/edit")
public class UserEditorPage {
    // ...
}
```

You can define the behavior directly in the model:

```java
@Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
List<String> roles;
```

## What Mateu generates

From this definition, Mateu automatically provides:

- selection UI (dropdown / checkbox / etc.)
- label resolution
- integration with CRUD forms
- persistence integration

## When NOT to create pages

You usually don't need pages when:

- you are doing standard CRUD
- the UI can be inferred from the model
- relationships can be expressed with annotations

## When to create pages

Create explicit pages (`@Route`) only when:

- you need custom flows (wizards, dashboards)
- you need complex UI composition
- the behavior cannot be expressed declaratively

## Mental model

- model = source of truth
- annotations = UI + behavior
- orchestrator = execution engine

Pages are the exception, not the default.
