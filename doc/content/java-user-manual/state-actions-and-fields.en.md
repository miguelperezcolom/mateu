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

## Behavior and rendering

Annotations define how things are rendered and behave.

Examples:

- `@ReadOnly`
- `@Button`
- `@UI`
- `@EditableOnlyWhenCreating`
- `@Stereotype`
- `@ForeignKey`

They control how fields and actions appear in the UI.

## Field rendering with stereotypes

By default, Mateu infers how a field should be rendered.

When you want more control, you can use `@Stereotype` to define the presentation intent explicitly.

```java
@Stereotype(FieldStereotype.textarea)
String description;

@Stereotype(FieldStereotype.email)
String email;

@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

This lets you keep the UI definition in Java while still controlling the rendering of specific fields.

## Relationships with foreign keys

Relationships can be declared with `@ForeignKey`, which delegates option search and label resolution to backend suppliers.

```java
@ForeignKey(search = RoleIdOptionsSupplier.class, label = RoleIdLabelSupplier.class)
List<String> roles;
```

## Mental model

Think of your class as:

- state → fields
- behavior → annotations
- interaction → actions
- presentation intent → stereotypes
- relationships → foreign keys

Mateu takes care of rendering and wiring everything.
