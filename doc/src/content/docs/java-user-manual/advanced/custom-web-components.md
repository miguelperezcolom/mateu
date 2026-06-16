---
title: "Custom web components"
---

Mateu can render any standard web component by declaring it as an `Element` in your component tree. This lets you embed third-party UI libraries, visualisations, or your own custom elements without writing a separate frontend application.

**When to use:** reach for `Element` when Mateu's built-in components are not enough — 3D viewers, maps, rich text editors, chart libraries, design-system widgets, or any component distributed as a web component.

---

## Overview: the full integration pattern

Integrating a custom web component involves up to five steps:

1. **Load the JavaScript** — inject a `<script>` tag, either at compile time with `@Script` or at runtime with `CommandSupplier`
2. **Render the element** — declare the custom tag using `Element.builder()` in your component tree
3. **Listen to component events** — route web component events to backend actions via `.on()`
4. **React to field changes** — use `OnValueChangeTrigger` to re-render when related fields change
5. **Interact with Mateu's own components** — fire events that Mateu's web components understand

---

## Step 1 — Loading the JavaScript

### Option A: `@Script` on the `@UI` class (compile time, recommended for static scripts)

Use the `@Script` annotation when the script URL is fixed and should be included for every visitor of that UI:

```java
@UI("/dashboard")
@Script(src = "https://cdn.example.com/my-chart-lib/2.0/chart.min.js", type = "module")
public class Dashboard implements ComponentTreeSupplier { ... }
```

The annotation processor injects the `<script>` tag into `</head>` at build time, so it is present before the page loads. This is the preferred approach for scripts that are always needed.

See [`@Script`](/java-ui-definition/annotations/ui/#script-target-type) for all available attributes (`defer`, `async`, `crossorigin`).

### Option B: `CommandSupplier` (runtime, recommended for conditional or per-route scripts)

Implement `CommandSupplier` when the script is only needed for a specific route or should be injected dynamically:

```java
@Override
public List<UICommand> commands(HttpRequest httpRequest) {
    return List.of(
        UICommand.builder()
            .type(UICommandType.AddContentToHead)
            .data(Element.builder()
                .name("script")
                .attributes(Map.of(
                    "id",   "my-component-js",   // prevents duplicate injection
                    "src",  "https://cdn.example.com/my-component.js",
                    "type", "module"
                ))
                .build())
            .build()
    );
}
```

Always set a stable `id` — Mateu uses it to avoid injecting the same script more than once during SPA navigation.

---

## Step 2 — Rendering the element

Use `Element.builder()` with the web component's tag name:

```java
Element.builder()
    .name("my-chart")
    .attributes(Map.of(
        "data-title", "Monthly revenue",
        "theme",      "dark"
    ))
    .style("width: 100%; height: 400px;")
    .build()
```

This renders as:

```html
<my-chart data-title="Monthly revenue" theme="dark" style="width:100%;height:400px;"></my-chart>
```

The component's JavaScript (loaded in step 1) upgrades the element into a full web component in the browser.

---

## Step 3 — Listening to web component events

The `.on()` map on `Element` connects DOM events emitted by the web component to backend actions:

```java
Element.builder()
    .name("my-chart")
    .attributes(Map.of("data-title", "Revenue"))
    .style("width: 100%; height: 400px;")
    .on(Map.of(
        "bar-click",    "chart-bar-clicked",   // custom event → handleAction("chart-bar-clicked")
        "legend-click", "chart-legend-clicked"
    ))
    .build()
```

When the web component fires `new CustomEvent("bar-click")`, Mateu captures it and calls `handleAction`:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("chart-bar-clicked".equals(actionId)) {
        Map<String, Object> event = httpRequest.getParameters(Map.class).get("event");
        // event contains the CustomEvent's detail payload
        log.info("Bar clicked: {}", event);
        return Message.builder().text("Bar clicked").build();
    }
    return null;
}
```

The `event` parameter contains the `CustomEvent.detail` serialised as a map.

---

## Step 4 — Reacting to field changes

Use `OnValueChangeTrigger` to re-render the component when a related field changes value:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        OnValueChangeTrigger.builder()
            .propertyName("selectedMonth")
            .actionId("month-changed")
            .build()
    );
}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("month-changed".equals(actionId)) {
        return this;  // re-render with the new selectedMonth value
    }
    return null;
}
```

Returning `this` from the action triggers a re-render, which will pass the updated `selectedMonth` attribute to the element.

---

## Step 5 — Interacting with Mateu's web components

Your web component can fire events that Mateu's own web components (`<mateu-ui>`, `<mateu-form>`, etc.) listen to. This is useful for navigating, refreshing grids, or passing data from your component back into the Mateu component tree.

### From a backend action

Use `UICommandType.DispatchEvent` to fire a DOM event from the server response:

```java
return UICommand.builder()
    .type(UICommandType.DispatchEvent)
    .data(Map.of(
        "eventName", "mateu-navigate",
        "detail",    Map.of("path", "/orders")
    ))
    .build();
```

### From the web component's own JavaScript

Your component can dispatch standard browser custom events that Mateu listens to:

```js
// inside your web component
this.dispatchEvent(new CustomEvent('mateu-run-action', {
    bubbles: true,
    composed: true,
    detail: { actionId: 'refresh-grid' }
}));
```

You can also react to custom events from other Mateu components using `OnCustomEventTrigger`:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        OnCustomEventTrigger.builder()
            .eventName("my-component-ready")
            .actionId("component-ready")
            .build()
    );
}
```

---

## Full example: 3D model viewer

This example wires together a radio selector, a `<model-viewer>` web component, a runtime-injected script, and event listeners:

```java
@Route(value = "/demo/model-viewer", parentRoute = "")
public class ModelViewerPage
        implements ComponentTreeSupplier, ActionHandler, CommandSupplier, TriggersSupplier {

    String src = "/images/NeilArmstrong.glb";

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
            .title("3D model viewer")
            .content(List.of(
                FormField.builder()
                    .id("src")
                    .dataType(FieldDataType.string)
                    .stereotype(FieldStereotype.radio)
                    .options(List.of(
                        new Option("/images/NeilArmstrong.glb", "Neil Armstrong"),
                        new Option("/images/ford_mustang.glb",  "Ford Mustang")
                    ))
                    .build(),
                Element.builder()
                    .name("model-viewer")
                    .attributes(Map.of(
                        "src",             src,
                        "auto-rotate",     "auto-rotate",
                        "camera-controls", "camera-controls"
                    ))
                    .style("width: 30rem; height: 30rem;")
                    .on(Map.of(
                        "load",  "model-loaded",
                        "click", "model-clicked"
                    ))
                    .build()
            ))
            .build();
    }

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        return List.of(
            UICommand.builder()
                .type(UICommandType.AddContentToHead)
                .data(Element.builder()
                    .name("script")
                    .attributes(Map.of(
                        "id",   "model-viewer-js",
                        "src",  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js",
                        "type", "module"
                    ))
                    .build())
                .build()
        );
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(
            OnValueChangeTrigger.builder()
                .propertyName("src")
                .actionId("src-changed")
                .build()
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return switch (actionId) {
            case "src-changed"  -> this;  // re-render with new src
            case "model-loaded",
                 "model-clicked" -> Message.builder().text(actionId).build();
            default -> null;
        };
    }
}
```

---

## Choosing between `@Script` and `CommandSupplier`

| | `@Script` annotation | `CommandSupplier` |
|---|---|---|
| When injected | Compile time, inside `</head>` | Runtime, on first render of the route |
| Good for | Scripts needed by all users of a `@UI` class | Conditional scripts, or scripts scoped to a single route inside a larger app |
| Prevents duplicates | Automatically (only one `</head>` tag) | Via the `id` attribute on the injected element |
| Can reference dynamic URLs | No | Yes |

For most web component integrations, `@Script` is the cleaner choice. Use `CommandSupplier` when the script URL is dynamic or the component is embedded in a route that doesn't own the `@UI` class.

---

## Mental model

- **`@Script`** — the script is part of the page definition, always loaded
- **`Element.builder()`** — any HTML element or web component, declared in Java
- **`.on()`** — web component events routed to backend `handleAction` handlers
- **`UICommandType.AddContentToHead`** — inject a `<script>` tag at runtime
- **`OnValueChangeTrigger`** — re-render when a field value changes
- **`OnCustomEventTrigger`** — react to custom DOM events from other components
- **`UICommandType.DispatchEvent`** — fire a DOM event from a server response
- The backend stays in control; the web component is purely a renderer

---

## Next

- [`@Script`, `@Link`, `@Meta`](/java-ui-definition/annotations/ui/) — compile-time HTML head injection
- [Extensibility](/java-user-manual/advanced/extensibility/) — override framework internals or embed micro-frontends
- [Rules](/java-user-manual/advanced/rules/) — show or hide the element conditionally
- [Layout and composition](/java-user-manual/advanced/layout-and-composition/) — position the element within the page grid
