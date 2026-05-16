---
title: "Data contexts"
weight: 9
---

# Data contexts

Mateu provides four distinct data contexts accessible in the browser via `${...}` expressions:

| Context | Scope | Updated by |
|---|---|---|
| `state` | Component — form fields | Action returning `this`, `State(obj)`, or `State(Map)` |
| `data` | Component — extra data | Action returning `Data(obj)` or `Data(Map)` |
| `appState` | Application — persists across navigation | Action returning `AppState(map)` |
| `appData` | Application — shared transient data | Action returning `AppData(map)` |

---

## state — component form state

`state` holds the field values of the current form. It is updated when an action returns the component instance or a `State` object.

```java
// Reading from state in a component
new Text("${JSON.stringify(state)}")
new Text("${state.count}")
```

```java
// Updating state from an action
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return new State(Map.of("something", UUID.randomUUID().toString().substring(24)));
}
```

The `state` context is isolated to the current component.

---

## data — component data context

`data` is a secondary data bag for the current component. It does not map to form fields — it is purely for display or rule expressions.

```java
// Reading from data in a component
new Text("${JSON.stringify(data)}")
new Text("${data.something}")
```

```java
// Updating data from an action
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return new Data(Map.of("something", UUID.randomUUID().toString().substring(24)));
}
```

Use `data` for values that should not appear as editable form fields (computed results, metadata, display-only content).

---

## Using both state and data together

A single action can only return one value. To update both, use `List.of(...)`:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("change-state".equals(actionId)) {
        return new State(Map.of("something", randomShort()));
    }
    if ("change-data".equals(actionId)) {
        return new Data(Map.of("something", randomShort()));
    }
    return null;
}
```

In a component that displays both:

```java
Form.builder()
        .content(List.of(
                new Text("State: ${JSON.stringify(state)}"),
                new Text("Data: ${JSON.stringify(data)}"),
                Button.builder().actionId("change-state").label("Change state").build(),
                Button.builder().actionId("change-data").label("Change data").build()
        ))
        .build()
```

---

## appState — application-wide state

`appState` is shared across all components in the application and persists across navigation. Think of it as a session-scoped store.

```java
// Read appState in a component
new Text("${JSON.stringify(appState)}")
```

```java
// Update appState from an action — merge new values into the existing map
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var appState = new HashMap<>(httpRequest.getAppState(Map.class));
    var config = new HashMap<>((Map) appState.getOrDefault("config", new HashMap<>()));
    config.put("tenantId", UUID.randomUUID().toString());
    appState.put("config", config);
    return new AppState(appState);
}
```

Use `httpRequest.getAppState(Class)` to read the current `appState` value inside `handleAction`.

Use `appState` for:
- Authentication tokens or user identity
- Tenant configuration
- Application-wide settings that should survive page transitions

---

## appData — application-wide transient data

`appData` is similar to `appState` but is intended for transient, non-persisted shared data. It is accessible across all components.

```java
// Read appData in a component
new Text("${JSON.stringify(appData)}")
```

```java
// Update appData from an action
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return new AppData(Map.of("random-data", UUID.randomUUID().toString()));
}
```

`AppData` updates propagate to all components on the page, including nested ones.

---

## Nested components and shared data

A nested component (a `ComponentTreeSupplier` embedded in another's content list) can update `appData` or `appState` and the parent will see the change:

```java
// Parent page — embeds NestedForm in its content
Form.builder()
        .content(List.of(
                new Text("${JSON.stringify(appData)}"),
                new NestedForm()
        ))
        .build()

// NestedForm — updates appData
class NestedForm implements ComponentTreeSupplier, ActionHandler {
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return new AppData(Map.of("random-data", UUID.randomUUID().toString()));
    }
    // ...
}
```

After the nested form fires its action, `appData` is updated and all components re-render their `${appData.*}` expressions.

---

## Context summary

| Expression | Reads from | Updated by |
|---|---|---|
| `${state.field}` | Component state | `return this`, `new State(obj)` |
| `${data.field}` | Component data bag | `new Data(obj)` |
| `${appState.field}` | App-wide state | `new AppState(map)` |
| `${appData.field}` | App-wide data | `new AppData(map)` |

---

## Next

- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [Commands and messages](/java-user-manual/concepts/fluent-components/fluent-commands/)
- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/)
