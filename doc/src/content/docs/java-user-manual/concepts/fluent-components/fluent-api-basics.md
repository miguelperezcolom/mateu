---
title: "Fluent API basics"
---

The fluent API builds UI programmatically. A class implements `ComponentTreeSupplier` and returns its component tree from `component()`.

---

## Minimal example

```java
@Route(value = "/hello", parentRoute = "")
public class HelloPage implements ComponentTreeSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Hello")
                .content(List.of(
                        new Text("Hello world")
                ))
                .build();
    }
}
```

`Form` is the top-level container. Its `content` is a list of components.

---

## State and actions: six approaches

The counter example shows six ways to handle state and actions in the fluent API.

### Counter 1 — implement ActionHandler directly

```java
@Route(value = "/counter1", parentRoute = "")
public class Counter1 implements ComponentTreeSupplier, ActionHandler {

    int count = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("" + count),
                Button.builder()
                        .label("Increment")
                        .actionId("increment")
                        .build()
        );
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
        count++;
        return Flux.just(this);   // return this = re-render with new state
    }
}
```

`handleAction` receives the action id and returns the updated state. Returning `Flux.just(this)` tells Mateu to re-render the component with the updated field values.

---

### Counter 2 — inline Runnable on Button

```java
@Route(value = "/counter2", parentRoute = "")
public class Counter2 implements ComponentTreeSupplier {

    int count = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment", (Runnable) () -> count++)
        );
    }
}
```

`${state.count}` is a browser-side expression that reads the current count from form state. The `Runnable` lambda on `Button` is evaluated when the button is clicked.

---

### Counter 3 — named method convention

```java
@Route(value = "/counter3", parentRoute = "")
public class Counter3 implements ComponentTreeSupplier {

    int count = 0;

    void increment() {   // method name matches button actionId by convention
        count++;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment")   // actionId defaults to "increment"
        );
    }
}
```

When no `actionId` is set on a `Button`, Mateu looks for a method with a matching name (camelCase of the label).

---

### Counter 4 — return State from a Supplier

```java
@Route(value = "/counter4", parentRoute = "")
public class Counter4 implements ComponentTreeSupplier {

    int count = 0;

    Counter4 increment() {
        count++;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment", () -> new State(increment()))
        );
    }
}
```

`() -> new State(increment())` is a `Supplier<Object>`. `State(obj)` wraps the object and tells Mateu to push the new state to the browser.

---

### Counter 5 — explicit ActionSupplier + TriggersSupplier

```java
@Route(value = "/counter5", parentRoute = "")
public class Counter5 implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier {

    int count = 0;

    @Override
    public List<Action> actions() {
        return List.of(
            Action.builder()
                .id("increment")
                .confirmationRequired(true)
                .background(true)
                .build()
        );
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(new OnLoadTrigger("increment"));
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment", (Runnable) () -> count++)
        );
    }
}
```

`ActionSupplier` lets you declare action configuration (background, confirmation, SSE, etc.) separately from the button. `TriggersSupplier` declares automatic triggers (here, auto-run `increment` on load).

---

### Counter 6 — return Data instead of State

```java
@Route(value = "/counter6", parentRoute = "")
public class Counter6 implements ComponentTreeSupplier {

    int count = 0;

    Counter6 increment() {
        count++;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${data.count}"),   // note: data, not state
                new Button("Increment", () -> new Data(increment()))
        );
    }
}
```

`Data` vs `State`:

- `State(obj)` — replaces the component state (field values visible to the form)
- `Data(obj)` — pushes to the `data` context, accessible via `${data.field}` expressions

---

## Returning `this` vs `State` vs `Data`

| Return value | Effect |
|---|---|
| `Flux.just(this)` | Re-serialize this object as the new state |
| `new State(obj)` | Push `obj` as the new state |
| `new State(Map.of(...))` | Push specific key-value pairs as state |
| `new Data(obj)` | Push `obj` to the `data` context |

---

## State expressions in components

Components support `${...}` expressions that are evaluated in the browser:

```java
new Text("${state.count}")          // reads count from state
new Text("${data.count}")           // reads count from data context
new Text("${JSON.stringify(state)}") // dumps the full state as JSON
```

Use `${state.field}` for values that come from action results. Use `${data.field}` for values pushed via `Data(obj)`.

---

## The Form container

`Form` is the top-level wrapper. It carries the page title, content, and optional header, footer, toolbar, and button slots:

```java
Form.builder()
    .title("Page title")
    .subtitle("Optional subtitle")
    .content(List.of(component1, component2, ...))
    .header(List.of(headerComponent))      // above content
    .footer(List.of(footerComponent))      // below content
    .toolbar(List.of(toolbarTrigger))      // action buttons in the header bar
    .style("max-width: 900px; margin: auto;")
    .build()
```

---

## Next

- [Layouts](/java-user-manual/concepts/fluent-components/fluent-layouts/)
- [Form fields](/java-user-manual/concepts/fluent-components/fluent-form-fields/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
- [Data contexts](/java-user-manual/concepts/fluent-components/fluent-data-contexts/)
- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/)
