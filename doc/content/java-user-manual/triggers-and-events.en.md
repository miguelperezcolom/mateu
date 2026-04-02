---
title: "Triggers and events"
weight: 8
---

# Triggers and events

Triggers define when actions run.

## Example

```java
@Trigger(type = TriggerType.OnLoad, actionId = "loadData")
```

## Triggers vs rules vs actions

- actions → what happens  
- triggers → when it happens  
- rules → how UI changes  
- effects → what the user sees  

## Mental model

Triggers orchestrate behavior without imperative frontend code.
