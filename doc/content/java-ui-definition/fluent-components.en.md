---
title: "Fluent components"
weight: 2
---

# Fluent components

Mateu supports both **declarative UI** and **fluent components**.

👉 You can mix both approaches freely.

Even inside a declarative page, you can include any component that implements:

```java
io.mateu.uidl.fluent.Component
```

---

## Mixing declarative and fluent

```java
@UI("/example")
public class ExamplePage {

  String name;

  Component stats = new VerticalLayout(
      new KPI("Users", "128"),
      new Badge("Active")
  );

  @Button
  void save() {}

}
```

This page is still declarative, but embeds fluent components directly.

---

## Mental model

- declarative → structure, state, behavior
- fluent → fine-grained UI composition
- both → same rendering engine

---

## When to use fluent components

Use fluent components when:

- you need custom layouts
- you want reusable UI blocks
- you need more control than annotations provide

---

## Categories of components

### Layout and structure

- VerticalLayout
- HorizontalLayout
- FormLayout
- SplitLayout
- AccordionLayout
- TabLayout
- BoardLayout
- CarouselLayout
- MasterDetailLayout
- Scroller
- Container
- FullWidth

### Forms and inputs

- Form
- FormField
- FormItem
- FormRow
- FormSection
- FormSubSection
- CustomField
- Button
- MessageInput

### Data display

- Grid
- Listing
- VirtualList
- Directory
- Card
- Details
- KPI
- Badge
- Chart
- Markdown
- Text
- Image
- Avatar
- AvatarGroup

### Navigation and app structure

- App
- Page
- MenuBar
- Breadcrumbs
- Anchor
- Tab

### Feedback and overlays

- Dialog
- ConfirmDialog
- Notification
- Tooltip
- Popover
- ProgressBar
- CookieConsent

### Rich / specialized

- Bpmn
- Map
- MicroFrontend
- Element
- Icon

### State and infrastructure

- State
- AppState
- Data
- AppData
- FutureComponent
