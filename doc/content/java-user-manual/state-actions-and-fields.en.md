---
title: "State, actions and fields"
weight: 5
---

# State, actions and fields

Mateu UIs are built from a small set of concepts.

## State (fields)

Fields represent UI state.

```java
String name;
int age;
```

## Actions

Actions represent user-triggered behavior.

```java
@Button
Runnable save = () -> {};
```

## Behavior and rendering

Annotations define structure and presentation:

- `@UI`
- `@Button`
- `@ReadOnly`
- `@Stereotype`
- `@ForeignKey`

## Validation

Mateu supports standard Bean Validation annotations.

These are automatically enforced in the UI.

## Reactions

UI flow can also be described declaratively with triggers.

Triggers let Mateu react to:

- load  
- success  
- error  
- value changes  
- Enter  
- custom events  

```java
@Trigger(type = TriggerType.OnLoad, actionId = "loadData")
```

## Mental model

Think in terms of:

- state → fields  
- behavior → actions  
- relationships → foreign keys  
- presentation → stereotypes  
- reactions → triggers  
- validation → bean validation  

Mateu handles the rest.
