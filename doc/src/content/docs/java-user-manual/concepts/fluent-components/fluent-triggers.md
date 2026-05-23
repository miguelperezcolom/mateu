---
title: "Triggers"
---

Triggers fire backend actions automatically in response to lifecycle events — without user interaction.

Implement `TriggersSupplier` and return a list of `Trigger` objects from `triggers()`.

---

## The pattern

```java
@Route(value = "/my-page", parentRoute = "")
public class MyPage implements ComponentTreeSupplier, ActionHandler, TriggersSupplier {

    @Override
    public Form component(HttpRequest httpRequest) { ... }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(
            new OnLoadTrigger("load-data")
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("load-data".equals(actionId)) {
            // fetch and return data
        }
        return null;
    }
}
```

---

## OnLoadTrigger

Fires an action when the page or component loads.

```java
// Simple form — fires once on load
new OnLoadTrigger("action-id")

// Full form — with delay (ms), repeat count, and condition
new OnLoadTrigger("action-id", 500, 3, null)
```

Parameters:
- `actionId` — the action to fire
- `delay` — milliseconds to wait before firing (0 = immediate)
- `times` — how many times to fire (0 = once)
- `condition` — JS expression; only fire if truthy (`null` = always fire)

Use for: loading initial data, auto-starting background processes, polling.

```java
@Route(value = "/dashboard", parentRoute = "")
public class Dashboard implements ComponentTreeSupplier, ActionHandler, TriggersSupplier {

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(new OnLoadTrigger("load"));
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return new State(Map.of("items", loadItems()));
    }
}
```

---

## OnValueChangeTrigger

Fires an action when a specific field's value changes.

```java
new OnValueChangeTrigger("action-id", "fieldName", null)
```

Parameters:
- `actionId` — the action to fire
- `fieldName` — the form field to watch (by `id`)
- `condition` — JS expression condition (`null` = always fire)

Use for: dependent dropdowns, real-time search, cascading fields.

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new OnValueChangeTrigger("filter", "country", null)
    );
}
```

When `country` changes, the `filter` action is called. The current form state (including the new value) is sent to `handleAction`.

---

## OnSuccessTrigger

Fires an action after another action completes successfully.

```java
new OnSuccessTrigger("action-id", "source-action-id", null)
```

Parameters:
- `actionId` — the action to fire on success
- `sourceActionId` — the action to watch
- `condition` — JS expression condition (`null` = always fire)

Use for: chaining actions, running side effects after a save, refreshing a listing after an import.

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new OnSuccessTrigger("reload", "save", null)
    );
}
```

After `save` succeeds, `reload` fires automatically.

---

## OnErrorTrigger

Fires an action after another action fails.

```java
new OnErrorTrigger("action-id", "source-action-id", null)
```

Parameters:
- `actionId` — the action to fire on failure
- `sourceActionId` — the action to watch
- `condition` — JS expression condition (`null` = always fire)

Use for: error recovery, fallback logic, showing error detail after a failed call.

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new OnErrorTrigger("show-error", "submit", null)
    );
}
```

---

## OnCustomEventTrigger

Fires an action when a custom browser event is dispatched. Used for communication between nested components and their parent page.

```java
new OnCustomEventTrigger("action-id", "event-name")
```

Parameters:
- `actionId` — the action to fire
- `eventName` — the browser custom event name to listen for

Use for: child components signaling parent pages, web component integration.

A nested component emits the event via a custom action:

```java
// In the child component
Action.builder()
        .id("emit")
        .customEvent(new CustomEvent("item-selected", new Detail("id", 42)))
        .build()
```

The parent listens for it:

```java
// In the parent page
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new OnCustomEventTrigger("handle-selection", "item-selected")
    );
}
```

---

## Combining triggers

Multiple triggers can be active at once:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new OnLoadTrigger("load"),
        new OnValueChangeTrigger("search", "query", null),
        new OnSuccessTrigger("reload", "delete", null),
        new OnCustomEventTrigger("handle-event", "my-event")
    );
}
```

---

## Trigger summary

| Trigger | Fires when |
|---|---|
| `OnLoadTrigger` | Page/component loads |
| `OnValueChangeTrigger` | A specific field changes |
| `OnSuccessTrigger` | A specified action succeeds |
| `OnErrorTrigger` | A specified action fails |
| `OnCustomEventTrigger` | A named browser custom event fires |

---

## Next

- [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/)
- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
