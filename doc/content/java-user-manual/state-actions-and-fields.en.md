---
title: "State, actions and fields"
weight: 3
---

# State, actions and fields

In Mateu, your UI is defined by:

- fields → state  
- methods → actions  

---

## Fields

Fields define the state of your UI.

```java
String name;
boolean active;
```

By default, Mateu infers the rendered control from the field type.

Use `@Stereotype` when you want to override that default.

---

## Actions

Methods represent actions.

```java
@Button
public void save() {}
```

Mateu handles interaction and wiring automatically.

---

## Mental model

You define:

- state
- actions

Mateu handles:

- rendering
- interaction
- updates
