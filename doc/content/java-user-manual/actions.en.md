---
title: "Action behavior"
weight: 11
---

# Action behavior

In Mateu, actions are not only about what happens in the backend.

They also define how the UI behaves when an action is executed.

This is controlled with `@Action`.

## What @Action defines

- validation  
- confirmation dialogs  
- execution mode (sync / background)  
- UI behavior (modals, navigation)  
- browser integration  

## Example

```java
@Action(
  id = "delete",
  confirmationRequired = true,
  confirmationTitle = "Delete item",
  confirmationMessage = "Are you sure?"
)
```

## Mental model

- methods define what an action does  
- `@Button` / `@Toolbar` define where it appears  
- `@Action` defines how it behaves  

## Actions, triggers, rules, effects

- actions → user intent  
- triggers → when actions run  
- rules → dynamic UI behavior  
- effects → UI feedback and browser control  

Together, they define the interaction model.
