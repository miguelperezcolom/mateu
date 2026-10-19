---
title: "Text"
---

Renders a text string inside a configurable HTML container. Supports variants for headings, body text, and visual styling.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
new Text("Hello, world!")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `text` | String | — | The text content (may contain template expressions like `${value}`) |
| `container` | `TextContainer` | div | HTML element used to wrap the text |
| `variants` | `List<TextVariant>` | `[]` | Visual modifiers |
| `size` | `TextSize` | `m` | Font size relative to the surrounding text |
| `noMargins` | boolean | false | Drops the container's block margins |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |
| `attributes` | `Map<String, String>` | `{}` | Additional HTML attributes |

## Text containers (`TextContainer`)

| Value | HTML element |
|---|---|
| `div` | `<div>` (block, default) |
| `span` | `<span>` (inline) |
| `h1` – `h6` | Heading levels |
| `p` | `<p>` paragraph |

## Text variants (`TextVariant`)

| Value | Description |
|---|---|
| `b` | Bold weight |
| `i` | Italic |

Colour and other visual tweaks go through `style` / `cssClasses`; the font size through `size`
(`TextSize`: `xl`, `l`, `m` — the default —, `s`, `xs`).

## Examples

```java
// Heading
new Text("Page title", TextContainer.h2)

// Paragraph
new Text("Introductory paragraph.", TextContainer.p)

// Bold, coloured through style
Text.builder()
    .text("Something went wrong!")
    .variants(List.of(TextVariant.b))
    .style("color: var(--lumo-error-text-color);")
    .build()

// Template expression (interpolated at render time)
new Text("Welcome, ${user.name}!")

// Inline span
new Text("inline", TextContainer.span)
```

## Convenience constructors

```java
new Text("plain string")
new Text("text", TextContainer.h1)
new Text("text", List.of(TextVariant.b))
new Text("id", "text")
new Text("id", "text", TextContainer.h2)
new Text("id", "text", List.of(TextVariant.i))
```
