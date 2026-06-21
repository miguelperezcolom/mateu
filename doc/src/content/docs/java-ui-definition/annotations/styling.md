---
title: "Styling Annotations"
description: "Annotations for inline styles, CSS classes, and structural wrappers."
---

## @Style (Target: TYPE, FIELD, PARAMETER)

```java
public @interface Style {
  String value();  // inline CSS string
}
```

Applies inline CSS to the component's root element. Applied on a class, styles the page container.

Example from the demo:

```java
@UI("/home")
@Style("max-width: 900px; margin: auto;")
public class Home { ... }
```

## @CssClasses (Target: TYPE, FIELD, PARAMETER)

```java
public @interface CssClasses {
  String value();  // space-separated class names
}
```

Adds CSS class names to the component's root element.

## @DivStyle (Target: TYPE, FIELD, PARAMETER)

```java
public @interface DivStyle {
  String value();  // inline CSS string
}
```

Applies inline CSS to the wrapper `<div>` around the element, rather than the element itself. Useful when you need to style the layout container rather than the component.

## @Compact (Target: TYPE)

```java
public @interface Compact {}
```

Renders a page in high-density mode: tighter control sizes, smaller spacing, and compressed field labels so information-dense screens fit without scrolling. Implemented by injecting the `StyleConstants.COMPACT` CSS custom-property block onto the page container. Because CSS custom properties cascade through shadow DOM, every Vaadin/Lumo component inside is condensed automatically. Font size is intentionally left at the standard Lumo value so text stays legible.

In addition to the visual change, `@Compact` reduces the auto-responsive form-layout minimum column width to `7em` (vs the standard default), so more columns fit at the same viewport width. On grids and tables the flag also applies Vaadin's built-in `compact` row density theme.

```java
@UI("/checkin/:id")
@Compact
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Zones({
    @Zone(name = "left",  width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm { ... }
```

`@Compact` is opt-in and non-breaking — pages without it are unaffected.

If you need compact density on only part of a page, or want to blend it with other constants, use `@Style(StyleConstants.COMPACT)` directly on the narrower element.

## StyleConstants

Mateu provides a `StyleConstants` class with predefined style values:

| Constant | Effect |
|---|---|
| `StyleConstants.CONTAINER` | Centers content with `max-width: 900px` |
| `StyleConstants.FULL_WIDTH` | Sets `width: 100%` |
| `StyleConstants.FULL_WIDTH_WITH_PADDING` | Full width with `2rem` horizontal padding |
| `StyleConstants.COMPACT` | High-density Lumo preset (used by `@Compact`) |

```java
// Common usage
@Style(StyleConstants.CONTAINER)           // centers content with max-width
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)  // full-width with padding
```

Difference between @Style and @DivStyle:

| Annotation | Styled element |
|---|---|
| `@Style` | The component element itself |
| `@DivStyle` | The outer wrapper div |
