---
title: "ActionHandler"
weight: 3
---

# ActionHandler

Handles named actions triggered from the UI — button clicks, row actions, toolbar buttons, and trigger-fired actions. Implement this interface on any class that needs to react to user interactions.

```java
public interface ActionHandler {

    default List<String> supportedActions() { return List.of(); }

    default boolean supportsAction(String actionId) { ... }

    Object handleAction(String actionId, HttpRequest httpRequest);
}
```

## Methods

| Method | Description |
|---|---|
| `handleAction(actionId, httpRequest)` | **Required.** Called when the user triggers an action. Returns a result object (component, data, navigation command, etc.) or `null` |
| `supportsAction(actionId)` | Override to filter which action IDs this handler accepts |
| `supportedActions()` | Override to declare the list of supported action IDs |

## Return values

| Return type | Effect |
|---|---|
| `null` | No change — Mateu re-renders the current state |
| `Component` | Replaces the current view with the returned component |
| `Data` | Updates the component state with new data |
| `UICommand` | Executes a client-side command (navigate, reload, show notification, etc.) |

## Basic usage

```java
@Route("/orders")
public class OrderPage implements ComponentTreeSupplier, ActionHandler {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
            .title("Order")
            .contentItem(new Text("Order detail"))
            .toolbarItem(Action.builder().id("save").build())
            .toolbarItem(Action.builder().id("cancel").build())
            .build();
    }

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
}
```

## Reading form state

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(MyFormState.class);
    // form.name, form.email, etc.
    return null;
}
```

## Reading selected rows

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

## Notes

- `ActionHandler` is commonly combined with `ComponentTreeSupplier` and `ListingBackend` on the same class.
- The default `supportsAction()` implementation excludes several reserved action IDs (create, save, cancel, search, etc.) that Mateu handles internally.
