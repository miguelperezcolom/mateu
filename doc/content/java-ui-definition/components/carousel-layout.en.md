---
title: "CarouselLayout"
weight: 8
---

# CarouselLayout

Displays children as slides in a carousel with optional navigation buttons, dots, auto-play, and keyboard support.

## Basic usage

```java
new CarouselLayout(slide1, slide2, slide3)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `content` | `List<Component>` | — | Slide components |
| `alt` | boolean | false | Flips navigation position (top for horizontal, left for vertical) |
| `auto` | boolean | true | Advances slides automatically |
| `direction` | `Orientation` | horizontal | `horizontal` or `vertical` |
| `disabled` | boolean | false | Disables the carousel |
| `disableSwipe` | boolean | false | Disables swipe/drag navigation |
| `disableKeys` | boolean | false | Disables keyboard navigation |
| `duration` | int | 0 | Auto-play interval in milliseconds (0 = default 4000 ms) |
| `dots` | boolean | false | Shows navigation dots |
| `loop` | boolean | false | Loops back to first slide from last |
| `nav` | boolean | true | Shows previous/next navigation buttons |
| `selected` | int | 0 | Initially selected slide index |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Auto-play with dots

```java
CarouselLayout.builder()
    .content(List.of(slide1, slide2, slide3))
    .auto(true)
    .dots(true)
    .loop(true)
    .duration(3000)
    .build()
```

## Manual navigation only

```java
CarouselLayout.builder()
    .content(List.of(slide1, slide2, slide3))
    .auto(false)
    .nav(true)
    .dots(true)
    .build()
```

## Vertical carousel

```java
CarouselLayout.builder()
    .content(List.of(slide1, slide2))
    .direction(Orientation.vertical)
    .nav(true)
    .build()
```
