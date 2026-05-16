---
title: "Text"
weight: 23
---

# Text

Renders a text string inside a configurable HTML container. Supports variants for headings, body text, and visual styling.

## Basic usage

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
| `small` | `<small>` |
| `strong` | `<strong>` |
| `em` | `<em>` |

## Text variants (`TextVariant`)

| Value | Description |
|---|---|
| `primary` | Primary colour |
| `secondary` | Muted / secondary colour |
| `tertiary` | Even more muted |
| `success` | Green |
| `error` | Red |
| `warning` | Yellow / amber |
| `body` | Normal body text size |
| `large` | Larger text |
| `small` | Smaller text |
| `bold` | Bold weight |

## Examples

```java
// Heading
new Text("Page title", TextContainer.h2)

// Paragraph
new Text("Introductory paragraph.", TextContainer.p)

// Error message
new Text("Something went wrong!", List.of(TextVariant.error, TextVariant.bold))

// Template expression (interpolated at render time)
new Text("Welcome, ${user.name}!")

// Inline span
new Text("inline", TextContainer.span)
```

## Convenience constructors

```java
new Text("plain string")
new Text("text", TextContainer.h1)
new Text("text", List.of(TextVariant.bold))
new Text("id", "text")
new Text("id", "text", TextContainer.h2)
new Text("id", "text", List.of(TextVariant.success))
```
