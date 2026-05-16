---
title: "Layouts"
weight: 2
---

# Layouts

Mateu provides a set of layout components for organizing content in the fluent API.

All layouts are composable — any component can be placed inside any layout.

---

## HorizontalLayout

Places children side by side.

```java
HorizontalLayout.builder()
        .content(List.of(panel1, panel2))
        .build()
```

### Options

```java
HorizontalLayout.builder()
        .content(List.of(panel1, panel2))
        .padding(true)           // add internal padding
        .spacing(true)           // add gap between children
        .fullWidth(true)         // stretch to full container width
        .justification(HorizontalLayoutJustification.center)  // horizontal alignment
        .verticalAlignment(VerticalAlignment.center)           // vertical alignment
        .build()
```

### Justification values

`start`, `center`, `end`, `between`, `around`, `evenly`

### Vertical alignment values

`stretch`, `center`, `start`, `end`, `baseline`, `auto`

---

## VerticalLayout

Stacks children vertically.

```java
VerticalLayout.builder()
        .content(List.of(panel1, panel2))
        .spacing(true)
        .padding(true)
        .build()
```

Short constructor form (no spacing/padding):

```java
new VerticalLayout(component1, component2)
```

---

## TabLayout

Groups content into switchable tabs.

```java
TabLayout.builder()
        .tabs(List.of(
                new Tab("Tab 1", content1),
                new Tab("Tab 2", content2),
                new Tab("Tab 3", content3)
        ))
        .build()
```

### Variants

```java
// Vertical tabs (tabs on the left)
TabLayout.builder()
        .tabs(...)
        .orientation(Orientation.vertical)
        .build()

// Centered tab labels
TabLayout.builder()
        .tabs(...)
        .variant(TabLayoutVariant.centered)
        .build()

// Equal-width tab labels
TabLayout.builder()
        .tabs(...)
        .variant(TabLayoutVariant.equalWidth)
        .build()
```

---

## AccordionLayout

Collapsible panels where one or more can be open at a time.

```java
AccordionLayout.builder()
        .panels(List.of(
                new AccordionPanel("Panel 1", content1),
                new AccordionPanel("Panel 2", content2),
                new AccordionPanel("Panel 3", content3)
        ))
        .build()
```

### Open a specific panel by default

```java
AccordionPanel.builder()
        .label("Panel 2")
        .content(content2)
        .active(true)     // open by default
        .build()
```

### Disable a panel

```java
AccordionPanel.builder()
        .label("Panel 3")
        .content(content3)
        .disabled(true)
        .build()
```

### Variants

```java
.variant(AccordionLayoutVariant.reverse)   // reverse colors
.variant(AccordionLayoutVariant.filled)    // filled background
.variant(AccordionLayoutVariant.small)     // compact size
```

---

## SplitLayout

Divides space into two resizable panels (master and detail).

```java
SplitLayout.builder()
        .master(new Text("Master"))
        .detail(new Text("Detail"))
        .build()
```

### Options

```java
// Vertical split (stacked)
SplitLayout.builder()
        .master(masterContent)
        .detail(detailContent)
        .orientation(Orientation.vertical)
        .build()

// Full width
SplitLayout.builder()
        .master(masterContent)
        .detail(detailContent)
        .fullWidth(true)
        .build()
```

### Variants

```java
.variant(SplitLayoutVariant.small)    // compact splitter
.variant(SplitLayoutVariant.minimal)  // minimal splitter style
```

---

## BoardLayout

A dashboard-style grid layout with rows and column spans.

```java
BoardLayout.builder()
        .rows(List.of(
                BoardLayoutRow.builder()
                        .content(List.of(panel1, panel2, panel3))  // equal columns
                        .build(),
                BoardLayoutRow.builder()
                        .content(List.of(
                                new BoardLayoutItem(panel1, 1),    // 1 column
                                new BoardLayoutItem(panel2, 2)     // 2 columns
                        ))
                        .build()
        ))
        .style("width: 40rem;")
        .build()
```

Use `BoardLayoutItem(component, span)` to control how many columns a component occupies in a row.

---

## FormLayout

A responsive form grid that auto-arranges fields.

```java
FormLayout.builder()
        .autoResponsive(true)
        .content(List.of(
                FormRow.builder()
                        .content(List.of(field1, field2))
                        .build(),
                FormRow.builder()
                        .content(List.of(field3))
                        .build()
        ))
        .build()
```

`autoResponsive(true)` adjusts the number of columns based on available width.

---

## Nesting layouts

Layouts compose freely:

```java
HorizontalLayout.builder()
        .content(List.of(
                VerticalLayout.builder()
                        .content(List.of(field1, field2))
                        .build(),
                TabLayout.builder()
                        .tabs(List.of(
                                new Tab("Details", detailsPanel),
                                new Tab("History", historyPanel)
                        ))
                        .build()
        ))
        .spacing(true)
        .build()
```

---

## Summary

| Layout | Use for |
|---|---|
| `HorizontalLayout` | Side-by-side content |
| `VerticalLayout` | Stacked content |
| `TabLayout` | Grouped content with tab navigation |
| `AccordionLayout` | Collapsible sections |
| `SplitLayout` | Resizable master-detail split |
| `BoardLayout` | Dashboard-style grid with column spans |
| `FormLayout` | Responsive form field grid |

---

## Next

- [Form fields](/java-user-manual/concepts/fluent-components/fluent-form-fields/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
