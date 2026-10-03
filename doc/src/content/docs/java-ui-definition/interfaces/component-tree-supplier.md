---
title: "ComponentTreeSupplier"
---

The primary interface for building a fully fluent page. Implement it to return a component tree for a given HTTP request. Bind it to a URL with a [`routes.yaml`](/java-ui-definition/route-registry/) entry.

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

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: dashboard
    viewModel: com.example.DashboardPage
```

## Accessing request data

```java
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

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: orders
    viewModel: com.example.OrdersPage
```

## Custom style

```java
@Style("max-width: 800px; margin: auto;")
public class WelcomePage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Welcome to Mateu");
    }
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: welcome
    viewModel: com.example.WelcomePage
```

## Notes

- The default `style()` implementation returns `"max-width:900px;margin: auto;"` unless overridden or the class carries `@Style`.
- `ComponentTreeSupplier` itself implements `Component`, so it can be nested inside other fluent components.
