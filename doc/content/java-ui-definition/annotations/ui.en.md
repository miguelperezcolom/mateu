---
title: "@UI"
weight: 1
---

# @UI

Registers a class as a Mateu UI entry point and binds it to a URL path.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface UI {
    String value();
    String indexHtmlPath() default "/static/_index.html";
    String frontendComponentPath() default "/assets/mateu.js";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | — | URL path this UI is served at (e.g. `"/app"`) |
| `indexHtmlPath` | String | `"/static/_index.html"` | Path to the HTML shell served for SPA navigation |
| `frontendComponentPath` | String | `"/assets/mateu.js"` | Path to the Mateu frontend JS bundle |

## Basic usage

```java
@UI("/app")
public class MyApp implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Hello from MyApp");
    }
}
```

## With custom HTML shell

```java
@UI(value = "/admin", indexHtmlPath = "/static/admin.html")
public class AdminApp implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Admin area");
    }
}
```

## Notes

- Exactly one class per URL path should carry `@UI`.
- For route-based navigation within a UI, use [`@Route`](../route/) instead.
- `@UI` is typically combined with `ComponentTreeSupplier` for a fully fluent setup, or placed on a declarative page class.
