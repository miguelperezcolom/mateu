---
title: "Image"
---

Displays an image from a URL or a Base64 data URI.

## Basic usage

```java
new Image("https://example.com/logo.png")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `src` | String | — | Image URL or `data:image/...;base64,...` data URI |
| `style` | String | `""` | Inline CSS — use to control `width`, `height`, `border-radius`, etc. |
| `cssClasses` | String | `""` | CSS class names |

## From a URL

```java
new Image("https://picsum.photos/200/300")
```

## Sized via style

```java
Image.builder()
    .src("https://example.com/product.jpg")
    .style("width: 200px; height: 150px; object-fit: cover;")
    .build()
```

## Circular avatar-style image

```java
Image.builder()
    .src("https://example.com/user.jpg")
    .style("width: 64px; height: 64px; border-radius: 50%;")
    .build()
```

## Base64 data URI

```java
Image.builder()
    .src("data:image/png;base64,iVBORw0KGgoAAAA...")
    .build()
```

## Inside a Card as media

```java
Card.builder()
    .title(new Text("Product"))
    .media(new Image("https://example.com/product.jpg"))
    .variants(List.of(CardVariant.stretchMedia))
    .build()
```
