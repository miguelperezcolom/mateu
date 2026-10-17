---
title: "Layouts"
---

Layouts define how components are arranged.

## Common layouts

- vertical (`VerticalLayout`)
- horizontal (`HorizontalLayout`)
- split (`SplitLayout`)

## Example

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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
