---
title: "Custom web components"
---

Mateu can render any standard web component by declaring it as an `Element` in your ViewModel. This lets you embed third-party UI libraries, visualizations, or custom HTML elements without writing JavaScript or modifying the Mateu frontend.

**When to use:** reach for `Element` when Mateu's built-in field types are not enough — 3D viewers, maps, rich text editors, chart libraries, or any component distributed as a web component.

---

## Rendering a custom element

Use `Element.builder()` to declare any HTML element or web component:

```java
Element.builder()
    .name("model-viewer")
    .attributes(Map.of(
        "src", src,
        "auto-rotate", "auto-rotate",
        "camera-controls", "camera-controls"
    ))
    .style("width: 30rem; height: 30rem;")
    .build()
```

This renders as:

```html
<model-viewer
    src="..."
    auto-rotate
    camera-controls
    style="width: 30rem; height: 30rem;">
</model-viewer>
```

The `name` is the HTML tag name. `attributes` maps to HTML attributes. `style` sets inline CSS.

---

## Injecting scripts into the page head

Custom web components often require a script to be loaded. Use `UICommand.AddContentToHead` to inject it:

```java
@Override
public List<UICommand> commands(HttpRequest httpRequest) {
    return List.of(
        UICommand.builder()
            .type(UICommandType.AddContentToHead)
            .data(Element.builder()
                .name("script")
                .attributes(Map.of(
                    "id", "model-viewer-js",
                    "src", "https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js",
                    "type", "module"
                ))
                .build())
            .build()
    );
}
```

This injects:

```html
<script
    id="model-viewer-js"
    src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js"
    type="module">
</script>
```

Give the script element a stable `id`. Mateu uses the id to prevent duplicate injection if the page is rendered multiple times in the same session.

---

## Listening to web component events

The `.on()` map on `Element` connects web component events to backend actions:

```java
.on(Map.of(
    "load",  "model-loaded",   // <model-viewer load>  → handleAction("model-loaded")
    "click", "model-clicked"   // <model-viewer click> → handleAction("model-clicked")
))
```

When the web component fires the named event, Mateu sends it to the backend and calls `handleAction` with the matching action id.

---

## Reacting to field value changes

Use `OnValueChangeTrigger` to call an action when a field's value changes:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        OnValueChangeTrigger.builder()
            .propertyName("src")
            .actionId("src-changed")
            .build()
    );
}
```

When `src` changes, `handleAction("src-changed", ...)` is called. The action can return a new state to re-render the component with the updated value.

---

## Full example: 3D model viewer

This example wires together a radio selector, a `<model-viewer>` component, a head-injected script, and event listeners:

```java
@Route(value = "/components/web-component", parentRoute = "")
public class WebComponentPage implements ComponentTreeSupplier, ActionHandler, CommandSupplier, TriggersSupplier {

    String src = "/images/model-viewer/NeilArmstrong.glb";

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
            .title("Web component")
            .content(List.of(
                FormField.builder()
                    .id("src")
                    .dataType(FieldDataType.string)
                    .stereotype(FieldStereotype.radio)
                    .options(List.of(
                        new Option("/images/model-viewer/NeilArmstrong.glb", "Neil Armstrong"),
                        new Option("/images/model-viewer/ford_mustang_1965.glb", "Ford Mustang")
                    ))
                    .build(),
                Element.builder()
                    .name("model-viewer")
                    .attributes(Map.of(
                        "src", src,
                        "auto-rotate", "auto-rotate",
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
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("src-changed".equals(actionId)) {
            return this;  // re-render with new src value
        }
        if ("model-loaded".equals(actionId) || "model-clicked".equals(actionId)) {
            return Message.builder().text(actionId).build();
        }
        return null;
    }

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        return List.of(
            UICommand.builder()
                .type(UICommandType.AddContentToHead)
                .data(Element.builder()
                    .name("script")
                    .attributes(Map.of(
                        "id", "model-viewer-js",
                        "src", "https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js",
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
}
```

---

## Element fields summary

| Field | Type | Purpose |
|---|---|---|
| `name` | `String` | HTML tag name |
| `attributes` | `Map<String, String>` | HTML attributes |
| `on` | `Map<String, String>` | Event name → action id mapping |
| `content` | `String` | Inner HTML content |
| `style` | `String` | Inline CSS |
| `cssClasses` | `String` | CSS class names |

---

## Mental model

- `Element` = any HTML element or web component, declared in Java
- `attributes` = standard HTML attributes
- `on` = web component events routed to backend handlers
- `UICommandType.AddContentToHead` = inject a `<script>` or other tag into `<head>`
- `OnValueChangeTrigger` = re-render when a field changes
- The backend stays in control; the web component is purely a renderer

---

## Next

- [Extensibility](/java-user-manual/advanced/extensibility/) — override framework internals or embed micro-frontends
- [Rules](/java-user-manual/advanced/rules/) — combine with `@Hidden` to show the element conditionally
- [Layout and composition](/java-user-manual/advanced/layout-and-composition/) — position the element within the page grid
