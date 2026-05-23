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

## Note

`Element` gives full control over the rendered HTML but bypasses Mateu's component model. Prefer purpose-built components when one is available.
