---
title: "DataSupplier and CommandSupplier"
description: "Inject extra data into the component and issue client-side commands from the server."
---

## DataSupplier

**Interface** — `io.mateu.uidl.interfaces.DataSupplier`

When a ViewModel implements `DataSupplier`, Mateu calls `data()` after serialising the component state and merges the returned object into the data payload sent to the client. This lets you inject computed values, lookup labels, or any extra keys that the UI needs but that don't belong directly in the state.

```java
public interface DataSupplier {
    Object data(HttpRequest httpRequest);
}
```

The returned object is serialised to JSON and deep-merged with the component's data map. Keys returned here are available to client-side rules and templates alongside the normal state fields.

### When to use it

Use `DataSupplier` when you need to send the client extra data that is derived from the state rather than being part of it — for example, resolved labels for foreign-key fields, computed totals, or feature-flag values that affect rendering.

### Example

```java
@UI("/orders/{id}")
public class OrderForm implements DataSupplier {

    public String customerId;
    public String productId;

    @Override
    public Object data(HttpRequest httpRequest) {
        return Map.of(
            "customerId-label", customerService.getName(customerId),
            "productId-label", productService.getName(productId)
        );
    }
}
```

The keys `customerId-label` and `productId-label` are sent alongside the state so the UI can display the resolved names for the lookup fields.

---

## CommandSupplier

**Interface** — `io.mateu.uidl.interfaces.CommandSupplier`

When a ViewModel implements `CommandSupplier`, Mateu calls `commands()` and executes the returned list of `UICommand` objects in the browser after rendering the component. Commands let the server drive client-side behaviour — navigation, action invocation, history changes, dirty-state tracking, and more.

```java
public interface CommandSupplier {
    List<UICommand> commands(HttpRequest httpRequest);
}
```

### UICommand factory methods

`UICommand` provides static helpers for the most common use cases:

| Method | Description |
|---|---|
| `UICommand.navigateTo(route)` | Navigate the browser to a different route |
| `UICommand.runAction(actionId)` | Trigger a named action on the current component |
| `UICommand.runAction(actionId, targetComponentId)` | Trigger an action on a specific component |
| `UICommand.pushStateToHistory(url)` | Push a URL to the browser history without navigating |
| `UICommand.markAsDirty()` | Mark the component as having unsaved changes |
| `UICommand.markAsClean()` | Clear the dirty state (e.g. after a successful save) |

### UICommandType values

`CloseModal`, `SetWindowTitle`, `SetFavicon`, `NavigateTo`, `RunAction`, `AddContentToHead`, `AddContentToBody`, `PushStateToHistory`, `DispatchEvent`, `MarkAsDirty`, `MarkAsClean`, `DownloadFile`

### Example

```java
@UI("/wizard/step1")
public class WizardStep1 implements CommandSupplier {

    public boolean completed;

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        if (completed) {
            return List.of(UICommand.navigateTo("/wizard/step2"));
        }
        return List.of();
    }
}
```

When `completed` is `true`, the browser automatically navigates to the next step after the component renders.
