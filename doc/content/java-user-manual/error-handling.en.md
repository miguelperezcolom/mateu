---
title: "Error handling"
weight: 15
---

# Error handling

## Actions

Handle errors in actions and return messages.

```java
return new Message("Something failed");
```

## Triggers

Use `OnError` triggers to react to failures.

## Recommendation

Keep errors close to the action that produces them.
