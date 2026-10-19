---
title: "Markdown"
---

Renders Markdown-formatted text as HTML. Useful for rich content, documentation sections, and formatted messages.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
Markdown.builder()
    .markdown("# Hello\n\nThis is **bold** and _italic_ text.")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `markdown` | String | — | Markdown source text |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Examples

```java
// Simple paragraph
var simple = Markdown.builder()
    .markdown("This is a **simple** example.")
    .build();

// Multi-line with headings and lists
var gettingStarted = Markdown.builder()
    .markdown("""
        ## Getting started
        
        1. Install the library
        2. Configure your backend
        3. Define your first `@UI` class
        
        > **Tip:** you can mix declarative and fluent components freely.
        """)
    .build();

// From a resource file
String content = new String(
    getClass().getResourceAsStream("/docs/readme.md").readAllBytes()
);
var readme = Markdown.builder().markdown(content).build();
```

## Tip

When building help panels, release notes, or any user-facing rich content, `Markdown` is more maintainable than constructing nested `Text` components by hand.
