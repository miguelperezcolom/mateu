---
title: "Triggers and events"
weight: 8
---

# Triggers and events

Mateu lets you define UI behavior declaratively with `@Trigger`.

Instead of wiring event handling manually in a frontend application, you can describe reactions directly in Java.

## Why this matters

A UI is not only made of fields and actions.

It also reacts to events:

- when a screen loads  
- when an action succeeds  
- when an error happens  
- when a value changes  
- when the user presses Enter  
- when a custom event is emitted  

`@Trigger` lets you express those reactions declaratively.

## The annotation

```java
@Repeatable(Triggers.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Trigger {

  TriggerType type();

  String actionId();

  int timeoutMillis() default 0;

  int times() default 1;

  String condition() default "";

  String calledActionId() default "";

  String propertyName() default "";

  String eventName() default "";
}
```

## Trigger types

```java
public enum TriggerType {
  OnLoad,
  OnSuccess,
  OnError,
  OnValueChange,
  OnCustomEvent,
  OnEnter
}
```

## Mental model

Use triggers to define when actions should run.

This keeps UI flow declarative instead of hardcoded in frontend event handlers.

## Typical use cases

- load data when a screen opens  
- trigger follow-up actions after success  
- react to errors  
- update dependent data when a field changes  
- react to custom component events  
- submit forms on Enter  

## Why this fits Mateu

Triggers extend the same declarative model:

- fields → state  
- actions → behavior  
- annotations → structure and rendering  
- triggers → reactions  

Everything stays in one place: your backend code.
