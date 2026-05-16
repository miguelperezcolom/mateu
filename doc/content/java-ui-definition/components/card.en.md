---
title: "Card"
weight: 16
---

# Card

A content card with optional media, header, title, subtitle, body, and footer areas. Supports multiple visual variants.

## Basic usage

```java
Card.builder()
    .title(new Text("Title"))
    .subtitle(new Text("Subtitle"))
    .content(new Text("Body content goes here."))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `media` | `Component` | — | Image or component placed at the top of the card |
| `headerPrefix` | `Component` | — | Component rendered before the title area |
| `header` | `Component` | — | Replaces the default title/subtitle header |
| `title` | `Component` | — | Card title |
| `subtitle` | `Component` | — | Card subtitle |
| `headerSuffix` | `Component` | — | Component rendered after the title area |
| `content` | `Component` | — | Main body content |
| `footer` | `Component` | — | Footer content |
| `variants` | `List<CardVariant>` | `[]` | One or more display variants |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Variants (`CardVariant`)

| Value | Description |
|---|---|
| `elevated` | Adds a drop shadow |
| `outlined` | Adds a visible border |
| `stretchMedia` | Media image fills the card width edge-to-edge |
| `coverMedia` | Media image covers the whole card background |
| `horizontal` | Puts media and content side by side |

Variants can be combined:

```java
.variants(List.of(CardVariant.outlined, CardVariant.stretchMedia))
```

## With media image

```java
Card.builder()
    .title(new Text("Widget A"))
    .subtitle(new Text("In stock"))
    .content(new Text("€ 9.99"))
    .media(new Image("https://example.com/product.jpg"))
    .variants(List.of(CardVariant.elevated))
    .build()
```

## Horizontal layout

```java
Card.builder()
    .title(new Text("Article title"))
    .content(new Text("Article excerpt…"))
    .media(new Image("https://example.com/thumb.jpg"))
    .variants(List.of(CardVariant.horizontal))
    .build()
```

## Cover image

```java
Card.builder()
    .title(new Text("Hero card"))
    .content(new Text("Content over the image"))
    .media(new Image("https://example.com/hero.jpg"))
    .variants(List.of(CardVariant.coverMedia))
    .build()
```

## Cards in a grid

Use `HorizontalLayout` with `wrap` to create a card gallery:

```java
HorizontalLayout.builder()
    .wrap(true)
    .spacing(true)
    .content(products.stream()
        .map(p -> Card.builder()
            .title(new Text(p.getName()))
            .content(new Text("€ " + p.getPrice()))
            .build())
        .toList())
    .build()
```
