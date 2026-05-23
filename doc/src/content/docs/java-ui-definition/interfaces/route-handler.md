---
title: "RouteHandler"
---

Handles navigation requests for a route programmatically. Use it when you need dynamic routing logic that goes beyond what `@Route` provides.

```java
public interface RouteHandler {
    Object handleRoute(String route, HttpRequest httpRequest);
}
```

## Method

| Method | Description |
|---|---|
| `handleRoute(route, httpRequest)` | Called when Mateu resolves the given route. Returns the component or data to render. |

## Usage

```java
@Route("/dynamic")
public class DynamicRouter implements RouteHandler {

    @Override
    public Object handleRoute(String route, HttpRequest httpRequest) {
        var segment = httpRequest.lastPathItem();
        return switch (segment) {
            case "invoices" -> new InvoiceListPage().component(httpRequest);
            case "customers" -> new CustomerListPage().component(httpRequest);
            default -> new Text("Not found: " + route);
        };
    }
}
```

## Notes

- `RouteHandler` gives you full control over what is rendered for a route.
- For standard page rendering, prefer `ComponentTreeSupplier` with `@Route`.
- Use `RouteHandler` when the rendered component depends on runtime conditions such as user roles, URL segments, or application state.
