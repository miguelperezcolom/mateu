---
title: "Action behavior"
weight: 11
---

# Action behavior

Mateu lets you configure how actions behave in the UI using `@Action`.

An action is not only what happens in the backend.

It also has a UI lifecycle:

- validation  
- confirmation  
- execution mode  
- feedback  
- browser integration  

`@Action` lets you define that declaratively.

## The annotation

```java
@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Action {

  String id();

  boolean background();

  boolean validationRequired();

  boolean confirmationRequired();

  boolean rowsSelectedRequired();

  String confirmationTitle();

  String confirmationMessage();

  String confirmationText();

  String confirmationDenialText();

  String modalStyle();

  String modalTitle();

  String customEventName();

  String customEventDetail();

  String href();

  String js();

  boolean sse();

  String fieldsToValidate();
}
```

## Examples

### Confirmation dialog

```java
@Action(
  id = "delete",
  confirmationRequired = true,
  confirmationTitle = "Delete item",
  confirmationMessage = "Are you sure?"
)
```

### Background execution

```java
@Action(
  id = "process",
  background = true
)
```

### Custom validation scope

```java
@Action(
  id = "save",
  validationRequired = true,
  fieldsToValidate = "name,email"
)
```

### Browser integration

```java
@Action(
  id = "openDocs",
  href = "https://example.com"
)
```

## Mental model

- methods define what an action does  
- `@Button` / `@Toolbar` define where it appears  
- `@Action` defines how it behaves  

## Why this matters

In traditional apps, action behavior is split across:

- frontend code  
- backend logic  

With Mateu:

- everything is declared in one place  
- behavior is consistent  
- no UI glue code  
