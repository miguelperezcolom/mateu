---
title: "UI effects (messages and commands)"
weight: 14
---

# UI effects (messages and commands)

Mateu allows backend methods to return UI effects that are executed directly in the browser.

This includes:

- notifications  
- navigation  
- browser commands  

## Messages

Use `Message` to display notifications to the user.

```java
return new Message("Saved successfully");
```

You can customize:

- variant (success, warning, error, etc.)
- position
- title
- duration

```java
return Message.builder()
  .variant(NotificationVariant.success)
  .text("Saved successfully")
  .build();
```

## UI commands

Use `UICommand` to control browser behavior.

### Navigate

```java
return UICommand.navigateTo("/users");
```

### Trigger another action

```java
return UICommand.runAction("refresh");
```

### Update browser history

```java
return UICommand.pushStateToHistory("/dashboard");
```

## Supported commands

- NavigateTo  
- RunAction  
- CloseModal  
- SetWindowTitle  
- SetFavicon  
- AddContentToHead  
- AddContentToBody  
- PushStateToHistory  

## Mental model

- actions return data or effects  
- `Message` → user feedback  
- `UICommand` → browser control  

## Why this matters

In traditional apps, these behaviors require frontend code.

With Mateu:

- backend drives UI feedback  
- backend controls navigation  
- no frontend glue code is needed  
