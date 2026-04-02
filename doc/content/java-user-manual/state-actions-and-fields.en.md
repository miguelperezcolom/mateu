---
title: "State, actions and fields"
weight: 5
---

# State, actions and fields

Mateu UIs are built from a small set of concepts.

## State (fields)

Fields represent UI state.

## Actions

Actions represent behavior triggered by the user.

## Buttons and actions

Mateu actions are not limited to `Runnable` fields.

You can declare actions as methods or as fields, depending on how you want them rendered.

### Toolbar actions

Methods annotated with `@Toolbar` are rendered in the toolbar (typically top-right).

```java
@Toolbar
public void refresh() {
  // ...
}
```

### Form buttons

Methods annotated with `@Button` are rendered at the bottom of the form.

```java
@Button
public void save() {
  // ...
}
```

### Inline buttons

If you annotate a `Runnable` field with `@Button`, it behaves like a field in the form.

This means it can be positioned anywhere in the layout.

```java
@Button
Runnable generate = () -> {};
```

## Behavior and rendering

Annotations define structure and presentation.

## Validation

Bean validation is automatically enforced in the UI.

## Reactions

Triggers define when actions run.

## Dynamic client-side behavior

Rules define how the UI changes dynamically in the browser.

## Mental model

- state → fields  
- actions → methods or buttons  
- relationships → foreign keys  
- presentation → stereotypes  
- reactions → triggers  
- rules → dynamic behavior  
- validation → bean validation  
