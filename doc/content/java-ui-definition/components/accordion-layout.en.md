---
title: "AccordionLayout"
weight: 5
---

# AccordionLayout

Groups content into collapsible panels. Only one (or none) panel is open at a time by default.

## Basic usage

```java
AccordionLayout.builder()
    .panels(List.of(
        AccordionPanel.builder()
            .summary(new Text("Section 1"))
            .content(new Text("Content for section 1"))
            .build(),
        AccordionPanel.builder()
            .summary(new Text("Section 2"))
            .content(new Text("Content for section 2"))
            .opened(true)
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
| `summary` | `Component` | — | Panel header / toggle trigger |
| `content` | `Component` | — | Collapsible panel body |
| `opened` | boolean | false | Whether this panel is initially expanded |

## With custom summaries

```java
AccordionLayout.builder()
    .panels(List.of(
        AccordionPanel.builder()
            .summary(new HorizontalLayout(new Icon(IconKey.Form), new Text("Personal data")))
            .content(personalDataForm)
            .opened(true)
            .build(),
        AccordionPanel.builder()
            .summary(new Text("Address"))
            .content(addressForm)
            .build()
    ))
    .build()
```
