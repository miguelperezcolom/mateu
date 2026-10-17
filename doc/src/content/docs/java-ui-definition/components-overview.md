---
title: "Overview"
---

Mateu components are defined in Java and rendered automatically.

## What you typically use

- Text
- Forms
- Grids
- Layouts
- Buttons

## Example

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
@UI("")
public class Example {

  String name;

  @Button
  Runnable save = () -> {};

}
```

Mateu turns this into a working UI.

## Key idea

Components are not created manually.

They are derived from your code structure.
