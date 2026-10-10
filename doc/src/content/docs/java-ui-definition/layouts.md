---
title: "Layouts"
---

Layouts define how components are arranged.

## Common layouts

- vertical (`VerticalLayout`)
- horizontal (`HorizontalLayout`)
- split (`SplitLayout`)

## Example

```java
public class Panels implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
        return new SplitLayout(new Text("Left"), new Text("Right"));
    }
}
```

In a reflected form, arrange sections with `@Section`, `@Zones` and `@Tab` instead.

## When to use

Use layouts to structure your UI instead of manual HTML/CSS.
