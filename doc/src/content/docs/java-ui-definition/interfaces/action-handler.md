---
title: "ActionHandler"
description: "Low-level interface for custom action dispatch. Usually not needed directly."
---

`ActionHandler` is the low-level dispatch contract that receives named actions from the UI. In most cases you do not implement it directly — Mateu's annotation processor generates the dispatch code for methods annotated with `@Action`, `@Button`, `@Toolbar`, and similar. Implement it yourself when you need runtime control over which action IDs your class accepts and how it responds.

```java
public interface ActionHandler {

    default List<String> supportedActions() { return List.of("*"); }

    default boolean supportsAction(String actionId) { /* see below */ }

    Object handleAction(String actionId, HttpRequest httpRequest);
}
```

## Methods

| Method | Description |
|---|---|
| `handleAction(actionId, httpRequest)` | **Required.** Called when the framework routes an action to this handler. Return a result object or `null` |
| `supportsAction(actionId)` | Return `true` when this handler accepts the given action ID. The default implementation excludes all framework-reserved IDs |
| `supportedActions()` | Declare the set of action IDs this handler claims. The default is `["*"]` (catch-all) |

### Return values from `handleAction`

| Return type | Effect |
|---|---|
| `null` | No UI change — Mateu re-renders the current state |
| Any UI component | Replaces the current view with the returned component |
| `Data` | Updates the component state with new key/value pairs |
| A form or page object | Opens the returned object as a new view or dialog |

## Reserved action IDs

The default `supportsAction` implementation excludes the following IDs so the framework can handle them internally. Returning `true` for any of these in a custom implementation overrides the built-in behaviour.

**Excluded suffixes:**

| Suffix | Purpose |
|---|---|
| `_create` | Open the creation form |
| `_create-and-stay` | Save and remain on the creation form |
| `_add` | Add a row to an inline grid |
| `_select` | Open a lookup/select dialog |
| `_selected` | Confirm a lookup selection |
| `_prev` | Navigate to the previous record |
| `_next` | Navigate to the next record |
| `_save` | Save the current form |
| `_remove` | Delete the current record |
| `_move-up` | Move a row up in an ordered list |
| `_move-down` | Move a row down in an ordered list |
| `_cancel` | Cancel the current edit |

**Excluded prefix:** any action ID that starts with `search-`.

## When to implement directly

Prefer annotations (`@Action`, `@Button`, `@Toolbar`) for the common case. Implement `ActionHandler` directly when:

- You need to handle action IDs determined at runtime (e.g. plugin-supplied IDs).
- You are building a reusable component that must intercept a family of action names.
- You are integrating an external action source and need full dispatch control.

## Examples

### Dispatch on action ID

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
        case "save" -> {
            var state = httpRequest.getComponentState(OrderState.class);
            orderService.save(state.toOrder());
            yield null;
        }
        case "cancel" -> new Text("Cancelled");
        default -> null;
    };
}
```

### Filter by supported action IDs

```java
@Override
public List<String> supportedActions() {
    return List.of("approve", "reject", "escalate");
}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var workflowId = httpRequest.lastPathItem();
    workflowService.transition(workflowId, actionId);
    return null;
}
```

### Read selected rows inside a handler

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("export".equals(actionId)) {
        var selected = httpRequest.getSelectedRows(CustomerRow.class);
        exportService.export(selected);
    }
    return null;
}
```

## Relationship to other interfaces

`ListingBackend` and `ReactiveListingBackend` both extend `ActionHandler`. Their `supportsAction` override restricts dispatch to `"search"` and the `action-on-row-*` / `action-on-view-*` families, and their `handleAction` override invokes `search(...)` automatically. When you implement `ListingBackend` you are also providing an `ActionHandler` — you only need to override `handleAction` for row-level or toolbar actions not covered by `search`.
