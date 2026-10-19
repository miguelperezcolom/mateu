---
title: "AccordionLayout"
---

Groups content into collapsible panels. Only one (or none) panel is open at a time by default.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
AccordionLayout.builder()
    .panels(List.of(
        AccordionPanel.builder()
            .label("Section 1")
            .content(new Text("Content for section 1"))
            .build(),
        AccordionPanel.builder()
            .label("Section 2")
            .content(new Text("Content for section 2"))
            .active(true)
            .build()
    ))
    .build()
```

## Properties

### AccordionLayout

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `panels` | `List<AccordionPanel>` | — | List of collapsible panels |
| `variant` | `AccordionLayoutVariant` | — | Visual style variant |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

### AccordionPanel

| Property | Type | Default | Description |
|---|---|---|---|
| `label` | String | — | Panel header / toggle trigger (plain text; `${...}` expressions are interpolated) |
| `content` | `Component` | — | Collapsible panel body |
| `active` | boolean | false | Whether this panel is initially expanded |
| `disabled` | boolean | false | Shows the panel but does not let it open |
| `style` / `cssClasses` | String | — | Inline CSS / class names of the panel |

## Panels holding forms

The header is a text label; anything richer goes in the panel's content:

```java
AccordionLayout.builder()
    .panels(List.of(
        AccordionPanel.builder()
            .label("Personal data")
            .content(personalDataForm)
            .active(true)
            .build(),
        new AccordionPanel("Address", addressForm)
    ))
    .build()
```
