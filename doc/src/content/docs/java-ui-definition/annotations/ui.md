---
title: "UI & UISpec Annotations"
description: "The core @UI annotation, HTML head injection annotations, and the YAML-based @UISpec alternative."
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
public class Orders extends AutoCrud<Order> {
    @Override
    public CrudRepository<Order> repository() {
        return new OrderRepository();
    }
}
```

---

## @Script (Target: TYPE)

```java
@Repeatable(Scripts.class)
public @interface Script {
  String src();
  String type() default "";
  boolean crossorigin() default false;
  boolean defer() default false;
  boolean async() default false;
}
```

Injects a `<script>` tag into the `<head>` of the generated HTML page. Can be applied multiple times to the same class.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | `String` | — | URL of the script file |
| `type` | `String` | `""` | Value for the `type` attribute (e.g. `"module"`). Omitted when empty |
| `crossorigin` | `boolean` | `false` | Adds the `crossorigin` attribute |
| `defer` | `boolean` | `false` | Adds the `defer` attribute |
| `async` | `boolean` | `false` | Adds the `async` attribute |

```java
@UI("/dashboard")
@Script(src = "/assets/charts.js", type = "module")
@Script(src = "/assets/analytics.js", defer = true)
public class Dashboard { ... }
```

The generated HTML will contain, before `</head>`:

```html
<script type="module" src="/assets/charts.js"></script>
<script src="/assets/analytics.js" defer></script>
```

---

## @Link (Target: TYPE)

```java
@Repeatable(Links.class)
public @interface Link {
  String rel();
  String href();
  String type() default "";
  String as() default "";
  boolean crossorigin() default false;
}
```

Injects a `<link>` tag into the `<head>` of the generated HTML page. Typical uses include stylesheets, preloads, and web fonts. Can be applied multiple times.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `rel` | `String` | — | Value for the `rel` attribute (e.g. `"stylesheet"`, `"preload"`) |
| `href` | `String` | — | URL of the linked resource |
| `type` | `String` | `""` | Value for the `type` attribute. Omitted when empty |
| `as` | `String` | `""` | Value for the `as` attribute (used with `rel="preload"`). Omitted when empty |
| `crossorigin` | `boolean` | `false` | Adds the `crossorigin` attribute |

```java
@UI("/dashboard")
@Link(rel = "stylesheet", href = "/assets/custom-theme.css")
@Link(rel = "preload", href = "/assets/fonts/inter.woff2", as = "font", crossorigin = true)
public class Dashboard { ... }
```

The generated HTML will contain, before `</head>`:

```html
<link rel="stylesheet" href="/assets/custom-theme.css">
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" crossorigin>
```

---

## @Meta (Target: TYPE)

```java
@Repeatable(Metas.class)
public @interface Meta {
  String name() default "";
  String content();
  String httpEquiv() default "";
  String charset() default "";
}
```

Injects a `<meta>` tag into the `<head>` of the generated HTML page. Can be applied multiple times.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | `String` | — | Value for the `content` attribute |
| `name` | `String` | `""` | Value for the `name` attribute (e.g. `"description"`, `"viewport"`). Omitted when empty |
| `httpEquiv` | `String` | `""` | Value for the `http-equiv` attribute. Omitted when empty |
| `charset` | `String` | `""` | Value for the `charset` attribute. Omitted when empty |

```java
@UI("/dashboard")
@Meta(name = "description", content = "Sales dashboard for the admin panel")
@Meta(name = "viewport", content = "width=device-width, initial-scale=1")
public class Dashboard { ... }
```

The generated HTML will contain, before `</head>`:

```html
<meta name="description" content="Sales dashboard for the admin panel">
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Complete example

The three annotations can be combined freely on the same `@UI` class:

```java
@UI("/store")
@Meta(name = "description", content = "Online store powered by Mateu")
@Link(rel = "stylesheet", href = "/assets/store-theme.css")
@Link(rel = "preload", href = "/assets/fonts/brand.woff2", as = "font", crossorigin = true)
@Script(src = "https://cdn.example.com/analytics.js", defer = true)
public class Store extends AutoCrud<Product> { ... }
```

---

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
