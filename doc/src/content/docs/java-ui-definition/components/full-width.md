---
title: "FullWidth"
---

Stretches its child component to fill the entire browser width, removing the centred container constraint.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
new FullWidth(myContent)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | The component to render full-width |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Example

```java
new FullWidth(
    VerticalLayout.builder()
        .content(List.of(
            new Text("Spans the full browser width"),
            heroImage
        ))
        .build()
)
```

## When to use

Use `FullWidth` for hero sections, full-bleed images, banners, or any section that should break out of the centred column layout. For a constrained, centred column, use [Container](/java-ui-definition/components/container/) instead.
