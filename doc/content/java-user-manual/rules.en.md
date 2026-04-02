---
title: "Rules"
weight: 10
---

# Rules

Mateu lets you define dynamic client-side behavior declaratively with `@Rule`.

Rules are evaluated in the browser and can modify UI state, field attributes, styles, or trigger actions.

## Why this matters

A real UI is not static.

Fields may become:

- required  
- disabled  
- hidden  

Values may change dynamically.

Styles and classes may depend on current state.

With Mateu, these behaviors can be defined declaratively in Java.

## The annotation

```java
@Repeatable(Rules.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Rule {

  String filter();

  RuleAction action();

  String fieldName();

  RuleFieldAttribute fieldAttribute();

  String value();

  String expression();

  String actionId();

  RuleResult result();
}
```

## Actions

```java
public enum RuleAction {
  SetAppDataValue,
  SetAppStateValue,
  SetDataValue,
  RunAction,
  RunJS,
  SetAttributeValue,
  SetStateValue,
  SetCssClass,
  SetStyle
}
```

## Field attributes

```java
public enum RuleFieldAttribute {
  required,
  disabled,
  hidden,
  pattern,
  minValue,
  maxValue,
  minLength,
  maxLength,
  css,
  style,
  theme,
  errorMessage,
  description,
  none
}
```

## Result flow

```java
public enum RuleResult {
  Continue,
  Stop
}
```

## Mental model

Use rules to define dynamic UI behavior in the browser.

For example:

- hide a field  
- make a field required  
- update values  
- set styles  
- trigger actions  

## Why this fits Mateu

Rules extend the declarative model:

- fields → state  
- actions → behavior  
- triggers → reactions  
- rules → dynamic UI behavior  
