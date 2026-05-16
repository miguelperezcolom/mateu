---
title: "Action"
weight: 7
---

# Action

A named action wired to a button or toolbar slot. Used inside `Form`, `Page`, `Listing`, and other containers to register interactions that Mateu routes to your `ActionHandler`.

```java
@Builder
public record Action(
    String id,
    boolean background,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    String modalStyle,
    String modalTitle,
    CustomEvent customEvent,
    String href,
    String js,
    boolean sse,
    String fieldsToValidate,
    boolean bubble) {}
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Action identifier — passed to `ActionHandler.handleAction()` |
| `background` | boolean | `false` | Run the action without blocking the UI |
| `validationRequired` | boolean | `false` | Validate the form before executing |
| `confirmationRequired` | boolean | `false` | Show a confirmation dialog before executing |
| `rowsSelectedRequired` | boolean | `false` | Require at least one row selected in a grid |
| `confirmationTexts` | `ConfirmationTexts` | — | Texts for the confirmation dialog |
| `modalStyle` | String | — | Inline CSS for the confirmation modal |
| `modalTitle` | String | — | Title of the confirmation modal |
| `customEvent` | `CustomEvent` | — | Custom browser event to fire on completion |
| `href` | String | — | Navigate to this URL instead of calling a handler |
| `js` | String | — | Execute JavaScript on the client side |
| `sse` | boolean | `false` | Stream results via SSE |
| `fieldsToValidate` | String | — | Comma-separated field IDs to validate |
| `bubble` | boolean | `false` | Bubble the result to the parent component |

## Basic usage

```java
Action.builder()
    .id("save")
    .validationRequired(true)
    .build()
```

## With confirmation

```java
Action.builder()
    .id("delete")
    .confirmationRequired(true)
    .confirmationTexts(ConfirmationTexts.builder()
        .title("Delete record")
        .message("This cannot be undone. Continue?")
        .confirmText("Delete")
        .denyText("Cancel")
        .build())
    .build()
```

## Navigation action

```java
Action.builder()
    .id("back")
    .href("/customers")
    .build()
```

## Background action

```java
Action.builder()
    .id("exportAll")
    .background(true)
    .build()
```

## In a Form toolbar

```java
return Form.builder()
    .title("Order")
    .contentItem(content)
    .toolbarItem(Action.builder().id("save").validationRequired(true).build())
    .toolbarItem(Action.builder().id("delete")
        .confirmationRequired(true)
        .confirmationTexts(ConfirmationTexts.builder()
            .title("Delete order")
            .confirmText("Yes, delete")
            .build())
        .build())
    .build();
```

## Handling in ActionHandler

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
        case "save" -> {
            var state = httpRequest.getComponentState(OrderState.class);
            orderService.save(state);
            yield null;
        }
        case "delete" -> {
            orderService.delete(httpRequest.lastPathItem());
            yield new UICommand("navigate", "/orders");
        }
        default -> null;
    };
}
```
