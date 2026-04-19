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

In real applications, ViewModels often become Spring beans so they can inject repositories, services, or API clients.

## Actions

Actions represent behavior triggered by the user.

They can be defined as:

- methods annotated with `@Toolbar`
- methods annotated with `@Button`
- `Runnable` fields annotated with `@Button`

## Buttons and placement

### Toolbar actions

Methods annotated with `@Toolbar` are rendered in the toolbar, typically in the top-right area.

```java
@Toolbar
public void refresh() {
  // ...
}
```

### Form actions

Methods annotated with `@Button` are rendered in the form action area, typically at the bottom.

```java
@Button
public void save() {
  // ...
}
```

### Inline buttons

`Runnable` fields annotated with `@Button` behave like regular form fields, so they can be positioned inline inside the form.

```java
@Button
Runnable generate = () -> {};
```

## Action behavior

Actions can be configured declaratively using `@Action`.

## Validation

Standard Bean Validation annotations are automatically enforced in the UI.

## Reactions

Triggers define **when** actions run.

## Dynamic behavior

Rules define how the UI changes dynamically in the browser.

## UI effects

Actions can return:

- `Message` → user feedback
- `UICommand` → browser control

## Mental model

- state → fields
- inferred type → default control
- stereotype → rendering type override
- actions → methods or buttons
- action behavior → `@Action`
- reactions → triggers
- rules → dynamic behavior
- validation → bean validation
- effects → messages and browser commands
