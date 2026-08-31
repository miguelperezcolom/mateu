---
title: "Element"
---

A raw HTML element. Useful for injecting arbitrary markup into the component tree when no higher-level component fits the need.

## Basic usage

```java
new Element("div", Map.of("style", "background-color: green;"), "Hola!")
```

## Constructor

```java
new Element(String name, Map<String, String> attributes, String content)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `name` | String | — | HTML tag name (e.g. `"div"`, `"span"`, `"p"`) |
| `attributes` | `Map<String, String>` | — | HTML attributes (e.g. `style`, `class`, `data-*`) |
| `on` | `Map<String, String>` | — | Event handlers |
| `content` | String | — | Inner text or HTML content |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Full example

```java
Form.builder()
    .title("Custom element")
    .content(List.of(
        new Element("div",
            Map.of("style", "background-color: green; padding: 1rem; border-radius: 4px;"),
            "Hello from a raw div!"
        ),
        new Element("p",
            Map.of("style", "color: red; font-weight: bold;"),
            "Warning: this is a raw paragraph."
        )
    ))
    .build()
```

## Builder usage

```java
Element.builder()
    .name("span")
    .attributes(Map.of("class", "highlight"))
    .content("Highlighted text")
    .style("font-size: 1.2rem;")
    .build()
```

## Values that change

`attributes` and `content` accept `${...}` expressions, evaluated against the component's `state`
and `data` — the same interpolation used by labels and titles:

```java
Element.builder()
    .name("workflow-graph")
    .attributes(Map.of("overlay", "${state.overlay}"))
    .build()
```

Written as a literal, an attribute is part of the component tree and is delivered only when that
tree is rendered — so it stops following a view that refreshes itself with a
[`State`](/java-ui-definition/fluent-components/#state-and-infrastructure), which carries values and no tree.
Written as an expression it is a value, arrives with every update, and is applied to the existing
element with `setAttribute` rather than by rebuilding it. See
[Custom web components](/java-user-manual/advanced/custom-web-components/#step-4b--feeding-the-element-from-a-value-that-keeps-changing).

## Note

`Element` gives full control over the rendered HTML but bypasses Mateu's component model. Prefer purpose-built components when one is available.
