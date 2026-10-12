---
title: "ConfirmDialog"
---

A pre-built confirmation dialog with a header, body text, and confirm/reject/cancel buttons wired to server actions.

## Basic usage

```java
ConfirmDialog.builder()
    .header("Are you sure?")
    .content(new Text("This will permanently delete the record."))
    .confirmText("Yes, delete")
    .confirmActionId("confirm_delete")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `header` | String | — | Dialog header text |
| `content` | `Component` | — | Body content |
| `canCancel` | boolean | false | Shows a Cancel button |
| `canReject` | boolean | false | Shows a Reject button |
| `rejectText` | String | — | Label for the Reject button |
| `confirmText` | String | — | Label for the Confirm button |
| `openedCondition` | String | `"true"` | Expression over the state controlling visibility (open when absent) |
| `confirmActionId` | String | — | Action fired when the user confirms |
| `rejectActionId` | String | — | Action fired when the user rejects |
| `cancelActionId` | String | — | Action fired when the user cancels |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## With all buttons

```java
ConfirmDialog.builder()
    .header("Submit order?")
    .content(new Text("You have 3 items in your cart totalling €89.97."))
    .confirmText("Place order")
    .confirmActionId("place_order")
    .rejectText("Save for later")
    .rejectActionId("save_cart")
    .canReject(true)
    .canCancel(true)
    .cancelActionId("dismiss")
    .build()
```

## Returning it from an action

An action can return a `ConfirmDialog`: it opens over the page (like a `Dialog`), closes once the
user picks a button, and the picked button's action runs on the view that returned it — a plain
public method is enough, it does not need to be listed anywhere else.

```java
@Button
public ConfirmDialog archive() {
  return ConfirmDialog.builder()
      .header("Archive 3 orders?")
      .content(new Text("They leave the active list."))
      .confirmText("Archive")
      .confirmActionId("doArchive")
      .canCancel(true)
      .build();
}

public Message doArchive() { /* … */ return Message.success("Archived"); }
```

## Handling the actions

```java
@Override
public Object handleAction(String actionId, HttpRequest request) {
    return switch (actionId) {
        case "place_order"  -> { placeOrder(); yield new State(this); }
        case "save_cart"    -> { saveCart();   yield new State(this); }
        default             -> new State(this);
    };
}
```
