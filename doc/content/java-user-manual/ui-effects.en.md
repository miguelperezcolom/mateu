---
title: "UI effects (messages and commands)"
weight: 14
---

# UI effects (messages and commands)

Mateu allows backend methods to return UI effects executed in the browser.

## Messages

```java
return new Message("Saved successfully");
```

## Commands

```java
return UICommand.navigateTo("/users");
```

## Mental model

- Message → feedback  
- UICommand → control  

These effects are returned from backend actions.
