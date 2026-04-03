---
title: "Interaction model in Mateu"
weight: 7
---

# Interaction model in Mateu

Mateu does not treat interaction as separate frontend code.

Interaction is part of the application model.

At a high level, the interaction model is built from:

- actions
- action behavior
- triggers
- rules
- UI effects

---

## 1. Actions

Actions represent user intent.

They can be defined as:

- methods annotated with `@Button`
- methods annotated with `@Toolbar`
- `Runnable` fields annotated with `@Button`

```java
@Button
public void save() {
}
```

---

## 2. Action behavior

Use `@Action` to define how an action behaves in the UI lifecycle.

This includes things like:

- validation
- confirmation dialogs
- execution mode
- modal behavior
- browser integration

```java
@Action(
  id = "delete",
  confirmationRequired = true,
  confirmationTitle = "Delete item",
  confirmationMessage = "Are you sure?"
)
```

Mental model:

- method = what happens
- `@Action` = how it behaves

---

## 3. Triggers

Triggers define **when** actions should run.

Use `@Trigger` for things like:

- on load
- on success
- on error
- on value change
- on Enter
- custom events

```java
@Trigger(type = TriggerType.OnLoad, actionId = "loadData")
```

Mental model:

- action = what
- trigger = when

---

## 4. Rules

Rules define how the UI changes dynamically in the browser.

Use `@Rule` for things like:

- hiding fields
- making fields required
- changing styles
- updating values
- running actions

```java
@Rule(
  action = RuleAction.SetAttributeValue,
  fieldName = "email",
  fieldAttribute = RuleFieldAttribute.required,
  value = "true",
  result = RuleResult.Continue
)
```

Mental model:

- rules = browser-side dynamic behavior

---

## 5. UI effects

Backend actions can return UI effects that are executed in the browser.

### Messages

Use `Message` for user feedback.

```java
@Button
public Message save() {
  return new Message("Saved successfully");
}
```

### UI commands

Use `UICommand` for browser control.

```java
return UICommand.navigateTo("/users");
```

Mental model:

- `Message` → feedback
- `UICommand` → browser control

---

## How the pieces fit together

A good way to think about interaction in Mateu is:

- **actions** = user intent
- **`@Action`** = action lifecycle
- **triggers** = when actions run
- **rules** = how the browser UI changes
- **effects** = what the browser shows or does

---

## Summary

Mateu interaction is not split across:

- backend logic
- frontend event handlers
- browser-side glue code

Instead, it is part of one declarative model.
