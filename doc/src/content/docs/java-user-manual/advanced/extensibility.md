---
title: "Extensibility"
---

Mateu is extensible at multiple levels: individual UI elements, internal framework services, routing, and the frontend renderer itself. Most applications only need the first level; the others exist for platforms or framework integrators.

---

## Custom HTML elements and web components

The most common extension point is embedding custom or third-party web components. Use `Element.builder()` to render any HTML element by tag name:

```java
Element.builder()
        .name("my-custom-component")
        .attributes(Map.of(
                "src", "/path/to/file.gltf",
                "data-theme", "dark"
        ))
        .style("width: 100%; height: 400px;")
        .build()
```

To load the component's JavaScript, inject a `<script>` tag using `UICommandType.AddContentToHead`:

```java
@Override
public List<UICommand> commands(HttpRequest httpRequest) {
    return List.of(UICommand.builder()
            .type(UICommandType.AddContentToHead)
            .data(Element.builder()
                    .name("script")
                    .attributes(Map.of(
                            "id", "my-component-js",
                            "src", "/js/my-component.js",
                            "type", "module"
                    ))
                    .build())
            .build());
}
```

See [Custom web components](/java-user-manual/advanced/custom-web-components/) for the full pattern, including event listeners and `OnValueChangeTrigger`.

---

## Overriding framework beans

Mateu's internal services are wired via Spring (or Micronaut) dependency injection. Any internal service interface can be replaced by annotating your implementation with `@Primary`:

```java
@Primary
@Service
public class MyCustomSessionStore implements SessionStore {
    // your custom implementation
}
```

The framework picks up `@Primary` beans and uses them in place of the defaults. This works for:
- Custom serializers/deserializers
- Custom authorization logic
- Custom route resolvers
- Custom component mappers

---

## Custom route resolution

Implement a `@Primary` `RouteResolver` bean to intercept and rewrite routes before they are dispatched. Combined with a custom resolver, you can implement dynamic routing based on tenant, feature flags, or external configuration:

```java
@Route(value = "/custom-resolver", parentRoute = "")
public class CustomRouteResolverPage implements ComponentTreeSupplier {
    // page loaded via a custom routing strategy
}
```

---

## Micro-frontends

Embed an external frontend inside a Mateu page using `MicroFrontend`:

```java
MicroFrontend.builder()
        .url("https://other-service.internal/ui")
        .style("width: 100%; height: 600px;")
        .build()
```

The embedded frontend communicates with the host via custom events. Use `OnCustomEventTrigger` (see [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/)) to receive events from the embedded app and route them to a backend action.

---

## Decoupled frontend (alternative renderers)

The backend and frontend communicate through a protocol-agnostic UIDL (UI Definition Language) API:

```
Mateu backend → UIDL JSON → Mateu frontend renderer
```

The frontend renderer is swappable. Mateu ships a default renderer, but any renderer that speaks the UIDL protocol can be plugged in. This is the foundation for:
- Rendering Mateu UI in mobile apps
- Alternative web renderers (React, Lit, etc.)
- Headless testing without a browser

---

## Extension points summary

| Extension point | How |
|---|---|
| Custom HTML elements | `Element.builder()` with a custom tag name |
| Custom web components | `Element.builder()` + `UICommandType.AddContentToHead` |
| Embedded micro-frontends | `MicroFrontend.builder()` |
| Override internal services | `@Primary @Service` on your implementation |
| Custom route resolution | `@Primary` `RouteResolver` bean |
| Alternative renderers | Implement the UIDL frontend protocol |

---

## Next

- [Custom web components](/java-user-manual/advanced/custom-web-components/) — detailed walk-through of `Element`, events, and script injection
- [Security](/java-user-manual/advanced/security/) — extend authorization by overriding the authorization service
- [Real-world patterns](/java-user-manual/real-world/) — how extensibility applies in distributed deployments
