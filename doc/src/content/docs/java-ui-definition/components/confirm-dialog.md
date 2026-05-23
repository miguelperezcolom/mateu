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
| `openedCondition` | String | — | JavaScript condition controlling visibility |
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
