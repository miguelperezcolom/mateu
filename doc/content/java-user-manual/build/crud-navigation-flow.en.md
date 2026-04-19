---
title: "CRUD navigation flow"
weight: 5
aliases:
  - /java-user-manual/crud-navigation-flow/
---

# CRUD navigation flow

When using `AutoCrudOrchestrator`, Mateu provides a standard CRUD flow out of the box.

## Default routes

For a UI published at:

```java
@UI("/users")
public class UsersPage extends AutoCrudOrchestrator<User> {
}
```

Mateu generates the following flow:

- `/users` → list
- `/users/:id` → readonly detail view
- `/users/:id/edit` → edit view
- `/users/new` → create view

## Important note

The default action in the listing is usually **View**, not **Edit**.

This means the first navigation step is:

- list → readonly detail

From there, the user can continue to:

- edit
- delete
- return to the list

## What Mateu infers automatically

With `AutoCrudOrchestrator`, Mateu can generate:

- listing page
- readonly detail page
- edit page
- create page
- delete flow

## Mental model

`AutoCrudOrchestrator` does not only generate a table.

It generates the standard navigation flow around a CRUD resource.

## When to use this

Use this when you want:

- fast backoffice development
- standard CRUD behavior
- inferred navigation and forms

If you need a custom flow, define your own routes and pages explicitly.
