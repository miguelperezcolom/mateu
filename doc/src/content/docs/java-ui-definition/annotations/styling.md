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

## StyleConstants

Mateu provides a `StyleConstants` class with predefined style values:

```java
// Common usage
@Style(StyleConstants.CONTAINER)  // centers content with max-width
```

Difference between @Style and @DivStyle:

| Annotation | Styled element |
|---|---|
| `@Style` | The component element itself |
| `@DivStyle` | The outer wrapper div |
