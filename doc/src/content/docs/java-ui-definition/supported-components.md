---
title: "Supported components"
---

Mateu provides a rich set of UI components.

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

All fluent components implement:

```text
io.mateu.uidl.fluent.Component
```

---

## Key idea

You do not manually build UI in most cases.

Mateu infers it.

But when needed, you can drop down to fluent components and mix both approaches in the same page.

👉 See [Fluent components](/java-ui-definition/fluent-components/)

---

## Summary

- declarative → fast, inferred UI
- fluent → explicit control
- both → fully compatible

---

## Categories

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
