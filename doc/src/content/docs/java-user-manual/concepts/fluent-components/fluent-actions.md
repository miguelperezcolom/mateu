---
title: "Actions"
---

Actions connect user interactions to backend logic.

In the fluent API, actions are declared via `ActionSupplier` and handled via `ActionHandler`. Buttons reference actions by `actionId`.

---

## The basic pattern

```java
@Route(value = "/my-page", parentRoute = "")
public class MyPage implements ComponentTreeSupplier, ActionSupplier, ActionHandler {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("My page")
                .content(List.of(
                        new Text("${state.count}"),
                        Button.builder()
                                .actionId("increment")
                                .label("Count")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("increment")
                        .build()
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return new State(Map.of("count", httpRequest.getInt("count") + 1));
    }
}
```

1. The `Button` declares which action it triggers via `actionId`
2. `actions()` declares the action and its behavior
3. `handleAction()` is called when the action fires

---

## Foreground (default)

The default execution mode. The UI is blocked while the action runs.

```java
Action.builder()
        .id("action")
        .build()   // foreground by default
```

Use for actions that should complete before the user can interact again.

---

## Background

The action runs without blocking the UI. The user can keep interacting.

```java
Action.builder()
        .id("action")
        .background(true)
        .build()
```

Use for long-running operations (imports, exports, processing) that should not freeze the screen.

---

## Server-Sent Events (SSE)

Stream multiple updates from the backend to the browser as the action progresses.

```java
@Override
public List<Action> actions() {
    return List.of(
        Action.builder()
                .id("to-server")
                .sse(true)
                .build()
    );
}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return Flux
            .range(1, 10)
            .map(i -> new State(Map.of("count", i)))
            .delayElements(Duration.ofMillis(100));
}
```

Return a `Flux<Object>` to stream state updates. Each emitted value updates the browser progressively.

Use for: progress indicators, live data feeds, long operations with step-by-step feedback.

---

## Validation required

Runs client-side validations before calling the backend. If validation fails, the action is not called.

```java
Action.builder()
        .id("submit")
        .validationRequired(true)
        .build()
```

See [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/) for how to declare the validation rules.

---

## Confirmation required

Shows a confirmation dialog before calling the backend.

```java
Action.builder()
        .id("delete")
        .confirmationRequired(true)
        .confirmationTexts(new ConfirmationTexts(
                "Confirm deletion",
                "Are you sure you want to delete this item?",
                "Yes, delete",
                "Cancel"
        ))
        .build()
```

`ConfirmationTexts(title, message, confirmLabel, denyLabel)` customizes the dialog. Omitting it uses default texts.

---

## Href (external URL)

Navigates the browser to an external URL instead of calling the backend.

```java
Action.builder()
        .id("go-to-google")
        .href("https://www.google.es")
        .build()
```

No `handleAction` call is made. The browser follows the link directly.

---

## JavaScript action

Runs JavaScript in the browser without a server call.

```java
Action.builder()
        .id("increment-local")
        .js("state.count = state.count ? state.count + 1 : 1;")
        .build()
```

The JS runs with access to `state`, `data`, `appState`, and `appData` in scope. No server call is made.

Use for: purely client-side interactions, quick state updates that don't need persistence.

---

## Custom event

Fires a custom browser event instead of (or in addition to) other behavior.

```java
Action.builder()
        .id("emit-event")
        .customEvent(new CustomEvent("my-event", new Detail("payload", 42)))
        .js("state.count = state.count + 1;")   // can also run JS at the same time
        .build()
```

Other components or parent pages can listen to this event via `OnCustomEventTrigger`:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
            new OnCustomEventTrigger("handle-event", "my-event"),
            new OnCustomEventTrigger("server-action", "my-event-to-server")
    );
}
```

Use for: communication between nested components and parent pages.

---

## Row selected required

The action is only enabled when one or more rows are selected in a listing.

```java
Action.builder()
        .id("process-selected")
        .rowsSelectedRequired(true)
        .build()
```

Inside `handleAction`, get the selected rows:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var selected = httpRequest.getSelectedRows(Row.class);
    // process selected rows
    return null;
}
```

---

## Action properties summary

| Property | Type | Effect |
|---|---|---|
| `id` | String | Unique identifier; matched by `Button.actionId` |
| `background` | boolean | Run without blocking UI |
| `sse` | boolean | Stream updates as Flux |
| `validationRequired` | boolean | Run validations first |
| `confirmationRequired` | boolean | Show confirmation dialog first |
| `href` | String | Navigate to external URL |
| `js` | String | Run JS in browser |
| `customEvent` | CustomEvent | Fire a browser custom event |
| `rowsSelectedRequired` | boolean | Only enabled when rows selected |
| `confirmationTexts` | ConfirmationTexts | Customize confirmation dialog |

---

## Reading action parameters

Inside `handleAction`, read the current form state via `HttpRequest`:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    int count = httpRequest.getInt("count");
    String name = httpRequest.getString("name");
    var params = httpRequest.getParameters(Map.class);
    return new State(Map.of("count", count + 1));
}
```

---

## Next

- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/)
- [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/)
- [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/)
