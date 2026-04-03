---
title: "Triggers and events"
weight: 8
---

# Triggers and events

Mateu lets you define UI reactions declaratively with `@Trigger`.

Triggers define **when** actions should run.

## Trigger types

- OnLoad
- OnSuccess
- OnError
- OnValueChange
- OnCustomEvent
- OnEnter

```java
@Trigger(type = TriggerType.OnLoad, actionId = "loadData")
```

## Mental model

- actions → what happens
- triggers → when it happens

👉 See the full [Interaction model in Mateu →](/java-user-manual/interaction-model)
