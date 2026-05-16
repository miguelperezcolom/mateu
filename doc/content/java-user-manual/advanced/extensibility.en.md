---
title: "Extensibility"
weight: 5
aliases:
  - /java-user-manual/extensibility/
---

# Extensibility

Mateu is designed to be extensible at multiple levels: individual UI components, backend behavior, and frontend rendering.

---

## Custom web components

The most common extension point is embedding custom or third-party web components. Use `Element.builder()` to render any HTML element or web component:

```java
Element.builder()
        .name("my-custom-component")         // HTML tag name
        .attributes(Map.of(
                "src", "/path/to/file.gltf",
                "data-theme", "dark"
        ))
        .style("width: 100%; height: 400px;")
        .build()
```

To load the component's JavaScript, return a `UICommand` that injects a `<script>` tag:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return UICommand.builder()
            .type(UICommandType.AddContentToHead)
            .data("<script type=\"module\" src=\"/js/my-component.js\"></script>")
            .build();
}
```

See [Custom web components](/java-user-manual/advanced/custom-web-components/) for the full pattern.

---

## Overriding framework beans

Mateu's internal behavior is wired via Spring/Micronaut dependency injection. Any internal service interface can be replaced by annotating your implementation with `@Primary`:

```java
@Primary
@Service
public class MyCustomSessionStore implements SessionStore {
    // your custom implementation
}
```

The framework picks up `@Primary` beans and uses them instead of the default implementations. This works for:
- Custom serializers/deserializers
- Custom authorization logic
- Custom route resolvers
- Custom component mappers

---

## Custom route resolution

Implement a custom `RouteResolver` to intercept and rewrite routes before they are dispatched:

```java
@Route(value = "/custom-resolver", parentRoute = "")
public class CustomRouteResolverPage implements ComponentTreeSupplier {
    // page loaded via a custom routing strategy
}
```

Combined with a `@Primary` route resolver bean, you can implement dynamic routing based on tenant, feature flags, or external configuration.

---

## Micro-frontends

Mateu supports embedding external frontends as micro-frontends inside a page:

```java
MicroFrontend.builder()
        .url("https://other-service.internal/ui")
        .style("width: 100%; height: 600px;")
        .build()
```

The embedded frontend communicates with the host via custom events (see [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/) — `OnCustomEventTrigger`).

---

## Decoupled frontend

The backend and frontend communicate through a protocol-agnostic UIDL (UI Definition Language) API:

```
Mateu backend → UIDL JSON → Mateu frontend renderer
```

The frontend renderer is swappable. Mateu ships a Vaadin-based renderer, but any renderer that speaks the UIDL protocol can be plugged in. This is the foundation for:
- Rendering Mateu UI in mobile apps
- Alternative web renderers (React, Lit, etc.)
- Headless testing

---

## Summary

| Extension point | How |
|---|---|
| Custom HTML elements | `Element.builder()` with custom tag name |
| Custom web components | `Element.builder()` + `UICommandType.AddContentToHead` |
| Embedded micro-frontends | `MicroFrontend.builder()` |
| Override internal services | `@Primary @Service` on your implementation |
| Custom route resolution | `@Primary` `RouteResolver` bean |
| Alternative renderers | Implement the UIDL frontend protocol |

---

## Next

- [Custom web components](/java-user-manual/advanced/custom-web-components/)
- [Commands and messages](/java-user-manual/concepts/fluent-components/fluent-commands/)
- [Nested apps](/java-user-manual/concepts/fluent-components/fluent-nested-apps/)
