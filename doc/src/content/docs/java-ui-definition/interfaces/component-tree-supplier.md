---
title: "ComponentTreeSupplier"
---

The primary interface for building a fully fluent page. Implement it to return a component tree for a given HTTP request. Combine it with `@Route` to map it to a URL.

```java
public interface ComponentTreeSupplier extends Component {

    default String id() {
        return this.getClass().getName();
    }

    Component component(HttpRequest httpRequest);

    default String style() { ... }

    default String cssClasses() { return null; }
}
```

## Methods

| Method | Description |
|---|---|
| `component(HttpRequest)` | **Required.** Returns the root component to render |
| `id()` | Optional component identifier (defaults to the fully-qualified class name) |
| `style()` | Optional inline CSS for the component wrapper |
| `cssClasses()` | Optional CSS class names for the component wrapper |

## Basic usage

```java
@Route("/dashboard")
public class DashboardPage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
            .title("Dashboard")
            .contentItem(new Text("Welcome back!"))
            .build();
    }
}
```

## Accessing request data

```java
@Route("/orders")
public class OrdersPage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        var userId = httpRequest.getParameterValue("userId");
        return Form.builder()
            .title("Orders for " + userId)
            .contentItem(new Text("Loading..."))
            .build();
    }
}
```

## Custom style

```java
@Route("/welcome")
@Style("max-width: 800px; margin: auto;")
public class WelcomePage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Welcome to Mateu");
    }
}
```

## Notes

- The default `style()` implementation returns `"max-width:900px;margin: auto;"` unless overridden or the class carries `@Style`.
- `ComponentTreeSupplier` itself implements `Component`, so it can be nested inside other fluent components.
