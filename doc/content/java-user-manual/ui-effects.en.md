---
title: "UI effects (messages and commands)"
weight: 14
---

# UI effects (messages and commands)

Mateu allows backend methods to return UI effects executed directly in the browser.

## Messages

```java
return new Message("Saved successfully");
```

## UI commands

```java
return UICommand.navigateTo("/users");
```

## Mental model

- `Message` → user feedback
- `UICommand` → browser control

👉 See the full [Interaction model in Mateu →](/java-user-manual/interaction-model)
