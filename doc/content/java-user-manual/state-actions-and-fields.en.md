---
title: "State, actions and fields"
weight: 5
---

# State, actions and fields

Mateu UIs are built from three main concepts.

## State (fields)

Fields in your class represent UI state.

```java
String name;
int age;
```

Mateu automatically generates inputs or displays for them.

## Actions

Actions are methods or callables that the user can trigger.

```java
@Button
Runnable save = () -> {
  // logic
};
```

Mateu renders them as buttons or actions in the UI.

## Behavior (annotations)

Annotations define how things are rendered.

Examples:

- `@ReadOnly`
- `@Button`
- `@UI`

They control how fields and actions appear in the UI.

## Mental model

Think of your class as:

- state → fields
- behavior → annotations
- interaction → actions

Mateu takes care of rendering and wiring everything.
