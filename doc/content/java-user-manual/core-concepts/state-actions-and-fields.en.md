---
title: "State, actions and fields"
weight: 1
aliases:
  - /java-user-manual/state-actions-and-fields/
---

# State, actions and fields

Mateu UIs are built from a small set of concepts.

## State (fields)

Fields represent UI state.

```java
String name;
boolean active;
```

By default, Mateu infers the rendered control from the field type.

Use `@Stereotype` when you want to override that default rendering type.

## Actions

Actions represent behavior triggered by the user.

They can be defined as:

- methods annotated with `@Toolbar`
- methods annotated with `@Button`
- `Runnable` fields annotated with `@Button`

## Buttons and placement

### Toolbar actions

```java
@Toolbar
public void refresh() {
  // ...
}
```

### Form actions

```java
@Button
public void save() {
  // ...
}
```

### Inline buttons

```java
@Button
Runnable generate = () -> {};
```

## Mental model

- state → fields
- inferred type → default control
- stereotype → rendering type override
- actions → methods or buttons
- action behavior → `@Action`
- validation → bean validation
- effects → messages and browser commands
