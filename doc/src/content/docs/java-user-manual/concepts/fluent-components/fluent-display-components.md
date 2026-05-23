---
title: "Display components"
---

Mateu includes a library of ready-made display components for building rich UIs without writing HTML.

All components are created via their builder and placed in any layout or form content list.

---

## Text and content

### Text

Renders a text string. Supports `${...}` expressions.

```java
new Text("Hello world")
new Text("${state.name}")
new Text("${JSON.stringify(state)}")

// Builder form
Text.builder()
        .text("Hello ${state.name}")
        .build()
```

---

### Anchor (link)

```java
new Anchor("Click here", "https://example.com")
```

---

### Image

```java
Image.builder()
        .src("https://picsum.photos/200/300")
        .build()
```

---

### Icon

```java
Icon.builder()
        .icon(IconKey.Heart.iconName)
        .build()
```

`IconKey` is an enum with hundreds of icon names (Vaadin icon set). Common values: `IconKey.Trash`, `IconKey.Edit`, `IconKey.Plus`, `IconKey.Search`, `IconKey.Lock`, `IconKey.Unlock`, `IconKey.Sword`, `IconKey.Newspaper`.

---

### Badge

Colored label for status or categories.

```java
Badge.builder()
        .text("Active")
        .color(BadgeColor.success)
        .build()

// Variants
Badge.builder()
        .text("Error")
        .color(BadgeColor.error)
        .small(true)
        .build()

Badge.builder()
        .text("New")
        .color(BadgeColor.contrast)
        .pill(true)
        .primary(true)
        .build()
```

`BadgeColor` values: `success`, `error`, `warning`, `contrast`, `primary`.

---

### Notification (inline)

Inline notice box (not a toast popup).

```java
Notification.builder()
        .title("Heads up")
        .text("This is important information.")
        .build()
```

For toast notifications, return `Message` from an action. See [UI effects](/java-user-manual/concepts/ui-effects/).

---

### ProgressBar

```java
ProgressBar.builder().build()

// With value (0.0 to 1.0)
ProgressBar.builder()
        .value(0.65)
        .build()
```

---

### Markdown

Renders Markdown content as HTML.

```java
Markdown.builder()
        .content("# Hello\n\nThis is **bold** text.")
        .build()
```

---

## Containers

### Card

Card container with optional title, subtitle, content, and media.

```java
Card.builder()
        .title(new Text("Product name"))
        .subtitle(new Text("SKU-001"))
        .content(new Text("Description of the product."))
        .media(new Image("https://example.com/product.jpg"))
        .build()

// Variants
Card.builder()
        .title(new Text("Elevated"))
        .variants(List.of(CardVariant.elevated))
        .build()

Card.builder()
        .title(new Text("Outlined"))
        .variants(List.of(CardVariant.outlined))
        .build()
```

---

### Details (expandable section)

Collapsible content block.

```java
Details.builder()
        .summary(new Text("Pending invoices"))
        .content(VerticalLayout.builder()
                .content(List.of(
                        new Text("1000 pending invoices"),
                        new Text("Total: 34.213,01 EUR")
                ))
                .spacing(true)
                .build())
        .opened(false)   // collapsed by default
        .build()
```

---

## Data display

### Grid

Static data table (read-only, no search or pagination from backend).

```java
Grid.builder()
        .content(List.of(
                GridColumn.builder().id("name").label("Name").build(),
                GridColumn.builder().id("age").label("Age").build()
        ))
        .page(new Page<>("", 10, 1, 3, List.of(
                Map.of("name", "Alice", "age", "30"),
                Map.of("name", "Bob",   "age", "25")
        )))
        .build()
```

For a full search/filter/sort listing with backend data, use `Listing.builder()` (see [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)).

---

### Grid (tree mode)

Hierarchical grid with expandable rows. Uses the same `Grid.builder()` with `.tree(true)` and a `children` key in the data.

```java
Grid.builder()
        .content(List.of(
                GridColumn.builder().id("name").label("Name").build()
        ))
        .page(new Page<>("", 10, 1, 2, List.of(
                Map.of("name", "Group A", "children", List.of(
                        Map.of("name", "Item 1"),
                        Map.of("name", "Item 2")
                )),
                Map.of("name", "Group B", "children", List.of(
                        Map.of("name", "Item 3")
                ))
        )))
        .tree(true)
        .build()
```

---

### VirtualList

Virtualized list of arbitrary components. Efficient for large datasets.

```java
VirtualList.builder()
        .page(new Page<>("", 10, 1, 3, List.of(
                new Text("Item 1"),
                new Text("Item 2"),
                new Text("Item 3")
        )))
        .build()
```

---

### Chart

Renders a Chart.js chart.

```java
Chart.builder()
        .chartType(ChartType.line)
        .chartData(ChartData.builder()
                .labels(List.of("Jan", "Feb", "Mar", "Apr"))
                .datasets(List.of(
                        ChartDataset.builder()
                                .label("Sales")
                                .data(List.of(100d, 200d, 150d, 300d))
                                .build()
                ))
                .build())
        .chartOptions(ChartOptions.builder()
                .maintainAspectRatio(false)
                .scales(ChartScales.builder()
                        .y(ChartAxisScale.builder().beginAtZero(true).build())
                        .build())
                .build())
        .build()
```

`ChartType` values: `line`, `bar`, `pie`, `doughnut`, `radar`, `polarArea`, `bubble`, `scatter`.

---

### Map

Renders a geographic map.

```java
Map.builder()
        .position("41.3851,2.1734")   // latitude,longitude
        .zoom("14")
        .build()
```

---

## People and identity

### Avatar

User avatar with initials or image.

```java
Avatar.builder()
        .name("Alice Smith")   // initials extracted automatically
        .build()

Avatar.builder()
        .name("Alice Smith")
        .image("/images/alice.png")
        .build()
```

### AvatarGroup

Overlapping group of avatars.

```java
new AvatarGroup(List.of(
        Avatar.builder().name("Alice Smith").build(),
        Avatar.builder().name("Bob Jones").build(),
        Avatar.builder().name("Carol White").build()
), 2)   // max visible before "+N" overflow indicator
```

---

## Dialog

Opens a modal dialog. Returned from an action, not placed statically in content.

```java
// Return from handleAction to open a dialog
return Dialog.builder()
        .headerTitle("Confirm action")
        .content(Form.builder()
                .content(List.of(
                        new Text("Are you sure?"),
                        Button.builder()
                                .label("Confirm")
                                .actionId("confirm")
                                .build()
                ))
                .build())
        .closeButtonOnHeader(true)
        .build();
```

To close programmatically, return `UICommand.builder().type(UICommandType.CloseModal).build()`.

### ConfirmDialog

Specialized dialog with confirm/deny buttons:

```java
ConfirmDialog.builder()
        .header("Are you sure?")
        .content(new Text("This action cannot be undone."))
        .confirmActionId("confirmed")
        .confirmText("Yes, delete")
        .build()
```

---

## Messaging

### MessageList

Chat-style message thread.

```java
MessageList.builder().build()
```

---

## Status and amounts

### Status

Colored status badge for use in listings and forms.

```java
new Status(StatusType.SUCCESS, "Active")
new Status(StatusType.WARNING, "Pending")
new Status(StatusType.DANGER,  "Blocked")
new Status(StatusType.NONE,    "Draft")
```

`StatusType` values: `SUCCESS`, `WARNING`, `DANGER`, `PRIMARY`, `CONTRAST`, `NONE`.

In a listing column, declare the column with `dataType(FieldDataType.status)`:

```java
GridColumn.builder()
        .id("status")
        .dataType(FieldDataType.status)
        .label("Status")
        .build()
```

---

### Amount (monetary value)

```java
new Amount("EUR", 1001024.31)
new Amount("USD", 99.99)
```

In a listing column, use `dataType(FieldDataType.money)`:

```java
GridColumn.builder()
        .id("balance")
        .dataType(FieldDataType.money)
        .label("Balance")
        .build()
```

---

## Component reference

| Component | Import | Use for |
|---|---|---|
| `Text` | `io.mateu.uidl.data.Text` | Text display, `${...}` expressions |
| `Anchor` | `io.mateu.uidl.data.Anchor` | Hyperlinks |
| `Image` | `io.mateu.uidl.data.Image` | Images |
| `Icon` | `io.mateu.uidl.data.Icon` | Icons from `IconKey` enum |
| `Badge` | `io.mateu.uidl.data.Badge` | Colored labels |
| `Notification` | `io.mateu.uidl.data.Notification` | Inline notice boxes |
| `ProgressBar` | `io.mateu.uidl.data.ProgressBar` | Progress indicator |
| `Markdown` | `io.mateu.uidl.data.Markdown` | Rendered Markdown |
| `Card` | `io.mateu.uidl.data.Card` | Content card with media |
| `Details` | `io.mateu.uidl.data.Details` | Collapsible section |
| `Grid` | `io.mateu.uidl.data.Grid` | Static data table / tree table |
| `VirtualList` | `io.mateu.uidl.data.VirtualList` | Virtualized component list |
| `Chart` | `io.mateu.uidl.data.Chart` | Chart.js charts |
| `Map` | `io.mateu.uidl.data.Map` | Geographic map |
| `Avatar` | `io.mateu.uidl.data.Avatar` | User avatar |
| `AvatarGroup` | `io.mateu.uidl.data.AvatarGroup` | Overlapping avatar group |
| `Dialog` | `io.mateu.uidl.data.Dialog` | Modal dialog (returned from action) |
| `ConfirmDialog` | `io.mateu.uidl.data.ConfirmDialog` | Confirmation dialog |
| `MessageList` | `io.mateu.uidl.data.MessageList` | Chat-style message thread |
| `Status` | `io.mateu.uidl.data.Status` | Colored status badge |
| `Amount` | `io.mateu.uidl.data.Amount` | Monetary value with currency |

---

## Next

- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [Layouts](/java-user-manual/concepts/fluent-components/fluent-layouts/)
- [Commands and messages](/java-user-manual/concepts/fluent-components/fluent-commands/)
