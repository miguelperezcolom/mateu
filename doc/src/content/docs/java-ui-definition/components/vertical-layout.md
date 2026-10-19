---
title: "VerticalLayout"
---

Stacks its children vertically, one below the other.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
VerticalLayout.builder()
    .content(List.of(
        new Text("First"),
        new Text("Second")
    ))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `content` | `List<Component>` | — | Child components stacked top to bottom |
| `spacing` | boolean | false | Adds gap between children |
| `padding` | boolean | false | Adds inner padding |
| `margin` | boolean | false | Adds outer margin |
| `spacingVariant` | `SpacingVariant` | — | Controls spacing size |
| `horizontalAlignment` | `HorizontalAlignment` | — | Aligns children horizontally (`START`, `CENTER`, `END`, `STRETCH`) |
| `justification` | `HorizontalLayoutJustification` | — | Justification mode |
| `wrap` | boolean | false | Allows wrapping |
| `flexGrows` | `List<Integer>` | `[]` | Flex-grow values per child |
| `fullWidth` | boolean | false | Stretches to full width |
| `hiddenOverflow` | boolean | false | Hides overflow content |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Convenience constructors

```java
// from a list
new VerticalLayout(List.of(comp1, comp2))

// varargs
new VerticalLayout(comp1, comp2, comp3)
```

## Spacing and padding

```java
VerticalLayout.builder()
    .content(List.of(new Text("A"), new Text("B")))
    .spacing(true)
    .padding(true)
    .build()
```

## Horizontal alignment

```java
VerticalLayout.builder()
    .content(List.of(new Text("Centered")))
    .horizontalAlignment(HorizontalAlignment.CENTER)
    .build()
```

## Full-width children

```java
VerticalLayout.builder()
    .content(List.of(new Text("Fills row")))
    .fullWidth(true)
    .build()
```
