---
title: "UI & UISpec Annotations"
description: "The core @UI annotation and the YAML-based @UISpec alternative."
---

## @UI (Target: TYPE)

```java
public @interface UI {
  String value();                                           // required: URL path
  String indexHtmlPath() default "/static/_index.html";
  String frontendComponentPath() default "/assets/mateu.js";
}
```

The foundational annotation of the Mateu framework. Registers a Java class as a UI endpoint accessible at the given URL path.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `String` | — | URL path where this UI is served (e.g. `/orders`) |
| `indexHtmlPath` | `String` | `/static/_index.html` | Path to the HTML shell page |
| `frontendComponentPath` | `String` | `/assets/mateu.js` | Path to the frontend JS component |

How it works:

1. Mateu's annotation processor scans for `@UI` at startup
2. Registers the class as a handler for the given path
3. When a request arrives, instantiates the class and generates the UIDL (UI Definition Language) response
4. The frontend renders the UIDL as an interactive UI

Example:

```java
@UI("/orders")
public class Orders extends AutoCrudOrchestrator<Order> {
    @Override
    public AutoCrudAdapter<Order> simpleAdapter() {
        return new OrderAdapter();
    }
}
```

## @UISpec (Target: TYPE)

```java
public @interface UISpec {
  String value();  // path to YAML UI specification file
}
```

Alternative to code-based UI definition. Points to a YAML file that describes the UI structure declaratively without Java annotations.

Used when:

- The UI is defined by a non-Java team
- The UI structure changes frequently without code changes
- Integrating with external tooling that generates YAML

Cross-reference: see the [YAML UI Definition](/java-ui-definition/yaml-ui-definition/) guide for the full YAML format.
