---
title: "Layout Annotations"
description: "Annotations for controlling form layout, tabs, accordions and component arrangement."
---

These annotations are placed on a class or field to control how its content is arranged on screen — columns, tabs, accordion panels, split panes, and more.

---

## @FoldedLayout

Renders each `@Section` of the page as a collapsible panel. The user can expand or collapse individual sections independently, reducing visual noise on forms with many fields.

No attributes.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface FoldedLayout {}
```

### Example

```java
@Route("/customer/:id")
@FoldedLayout
@ConfirmOnNavigationIfDirty
public class CustomerForm {

    @Section("Personal data")
    String firstName;
    String lastName;

    @Section("Contact")
    ContactDetails contact;   // subform with its own @Toolbar actions

    @Section("Billing")
    BillingDetails billing;

    @Toolbar
    Object save() { /* persist everything */ }
}
```

Each `@Section` becomes a collapsible panel. Subform fields (nested records/classes) can carry their own `@Toolbar` or `@Button` methods scoped to that panel. See [Partial Forms](/ux-patterns/partial-forms/) for the full pattern.

![FoldedLayout — sections as collapsible panels](/images/docs/annotations/folded.png)

---

## @FormLayout

Renders the page fields in a responsive multi-column grid. This is the standard layout for data-entry forms.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface FormLayout {
    String theme() default "";
    String style() default "";
    int columns() default 2;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `columns` | `int` | `2` | Number of columns in the grid |
| `style` | `String` | `""` | Inline CSS applied to the layout container |
| `theme` | `String` | `""` | Theme variant string passed to the design system |

### Example

```java
@UI("/customers")
@FormLayout(columns = 3)
public class CustomerForm {
    String firstName;
    String lastName;
    String email;
    String phone;
    LocalDate birthDate;
}
```

![FormLayout with 3 columns](/images/docs/annotations/multi-column.png)

---

## @HorizontalLayout

Renders the page content in a horizontal row.

```java
public @interface HorizontalLayout {
    String theme() default "";
    String style() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `theme` | `String` | `""` | Theme variant |
| `style` | `String` | `""` | Inline CSS |

### Example

```java
@UI("/summary")
@HorizontalLayout(style = "gap: 1rem;")
public class SummaryPage {
    Component salesChart;
    Component revenueChart;
}
```

---

## @VerticalLayout

Renders the page content in a vertical column.

```java
public @interface VerticalLayout {
    String theme() default "";
    String style() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `theme` | `String` | `""` | Theme variant |
| `style` | `String` | `""` | Inline CSS |

### Example

```java
@UI("/profile")
@VerticalLayout
public class ProfilePage {
    Component avatar;
    String bio;
}
```

---

## @Tabs

Places on the class to wrap all fields in a tabbed container. Individual fields are assigned to tabs via `@Tab`.

```java
public @interface Tabs {
    String theme() default "";
    String direction() default "";
    String style() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `theme` | `String` | `""` | Visual theme variant |
| `direction` | `String` | `""` | Tab strip direction — `"horizontal"` or `"vertical"` |
| `style` | `String` | `""` | Inline CSS for the tab container |

---

## @Tab

Assigns the annotated field or method to a named tab. Requires `@Tabs` on the enclosing class.

**Target:** `FIELD`, `METHOD`

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface Tab {
    String value() default "";
    int order() default 0;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | `""` | Tab label |
| `order` | `int` | `0` | Display order among tabs |

### Example

```java
@UI("/account")
@Tabs
public class AccountPage {
    @Tab("Profile")
    String firstName;
    String lastName;

    @Tab("Security")
    String password;
    boolean mfaEnabled;

    @Tab("Preferences")
    String language;
    String timezone;
}
```

Each `@Tab` annotation starts a new tab. Fields without `@Tab` fall into a default tab.

![Tabs layout — Personal and Address tabs](/images/docs/components/tabs.png)

---

## @Accordion

Places on the class to render all fields inside a collapsible accordion. Individual panels are configured with `@AccordionPanel`.

```java
public @interface Accordion {
    String style() default "";
    int opened() default 0;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `style` | `String` | `""` | Inline CSS for the accordion container |
| `opened` | `int` | `0` | Zero-based index of the initially expanded panel |

---

## @AccordionPanel

Assigns the annotated field to a named accordion panel. Requires `@Accordion` on the enclosing class.

```java
public @interface AccordionPanel {
    String theme() default "";
    String style() default "";
    String summary() default "";
    boolean disabled() default false;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `summary` | `String` | `""` | Panel header text shown in collapsed state |
| `theme` | `String` | `""` | Visual theme variant |
| `style` | `String` | `""` | Inline CSS for this panel |
| `disabled` | `boolean` | `false` | Whether this panel is non-interactive |

### Example

```java
@UI("/settings")
@Accordion(opened = 0)
public class SettingsPage {
    @AccordionPanel(summary = "General")
    String language;
    String timezone;

    @AccordionPanel(summary = "Notifications")
    boolean emailNotifications;
    boolean smsNotifications;
}
```

![Accordion layout — collapsible panels](/images/docs/annotations/accordion.png)

---

## @SplitLayout

Renders the page as a two-panel layout with a resizable divider. The first field becomes the primary panel and the second becomes the secondary panel.

```java
public @interface SplitLayout {
    String theme() default "";
    String style() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `theme` | `String` | `""` | Theme variant |
| `style` | `String` | `""` | Inline CSS |

### Example

```java
@UI("/orders")
@SplitLayout
public class OrdersPage {
    Component orderList;
    Component orderDetail;
}
```

---

## @MasterDetail

**Target:** `FIELD`

Renders the annotated field as a master-detail layout. When a row in the master list is selected, the detail panel appears beside it. The `minHeightWhenDetailVisible` value sets the minimum height of the component while the detail panel is open.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface MasterDetail {
    String minHeightWhenDetailVisible();
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `minHeightWhenDetailVisible` | `String` | — | CSS minimum height when the detail panel is open (e.g. `"400px"`) |

### Example

```java
public class OrdersPage {
    @MasterDetail(minHeightWhenDetailVisible = "500px")
    List<OrderRow> orders;
}
```

---

## @Section

**Target:** `FIELD`, `METHOD`

Groups the annotated field and all following fields under a named section heading within a form. The section ends at the next `@Section` annotation.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface Section {
    String value();
    int columns() default 1;
    String style() default "";
    String zone() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | Section heading label (required) |
| `columns` | `int` | `1` | Number of columns inside this section's field grid |
| `style` | `String` | `""` | Inline CSS for the section container |
| `zone` | `String` | `""` | Name of the layout zone this section belongs to. Only used when the class is annotated with [`@Zones`](#zones--zone); sections sharing a zone are stacked inside that zone's column |

### Example

```java
public class CustomerForm {
    @Section("Personal data")
    String firstName;
    String lastName;
    LocalDate birthDate;

    @Section(value = "Contact", columns = 2)
    String email;
    String phone;
    String address;
}
```

---

## @Inline

**Target:** `FIELD`

Expands a nested POJO field's sub-fields directly into the parent section, without adding a `Card` wrapper or a separate header around the content. The parent field's `@Section` annotation provides the section title; the nested type's class-level annotations (`@PlainText`, `@Compact`, etc.) must be applied on the nested class itself — they are not inherited from the enclosing form.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Inline {}
```

No attributes.

### Behavior of `@Toolbar` and `@Button` on an `@Inline` type

Methods annotated with `@Toolbar` or `@Button` inside the nested class still work. Their placement shifts to match the inline context:

| Annotation on nested method | Rendered as |
|---|---|
| `@Toolbar` | Button(s) in the **section title row**, on the same line as the section heading |
| `@Button` | Button row **below** the section content |

### Example

```java
// Nested inline type — own annotations applied here
@PlainText
@Compact
public class GuestsSection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    @Toolbar
    @Label("Welcome card")
    Object printWelcomeCard(HttpRequest httpRequest) {
        return Message.success("Sent to printer");
    }

    @Button
    @Label("Wi-Fi code")
    Object showWifiCode(HttpRequest httpRequest) {
        return Message.success("Code: HOTEL-GUEST");
    }
}

// Parent form
@UI("/checkin/:id")
@Compact
@Zones({ @Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%") })
public class CheckInForm {

    // The @Section card is the only container; GuestsSection fields expand into it
    @Section(value = "Guests", columns = 1, zone = "left")
    @Label("") @Inline
    GuestsSection guestList = new GuestsSection();
}
```

The "Guests" section card shows `[Welcome card]` on the same line as the heading and renders the `[Wi-Fi code]` button below the guest grid.

Use `@Inline` on dense, information-rich screens (e.g. `@Compact` + `@Zones`) where an extra card nesting would add too much visual weight. For nested types that need their own clearly separated card and toolbar, omit `@Inline`.

![Inline — nested fields expanded directly into the parent section](/images/docs/annotations/inline.png)

---

## @Zones / @Zone

**Target (`@Zones`):** `TYPE`

Declares the layout **zones** (side-by-side columns) of a form. When a class is annotated with `@Zones`, its [`@Section`](#section)s are distributed into the declared zones by their `zone` value and the zones are rendered next to each other, each zone stacking its sections vertically. This is the idiomatic way to build dense, information-rich screens (e.g. a check-in or order desk) where related groups of sections sit in fixed-width columns.

A section whose `zone` does not match any declared zone falls back into a trailing flexible column, so nothing is ever dropped.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Zones {
    Zone[] value();
}

public @interface Zone {
    String name();
    String width() default "";   // e.g. "64%", "30rem"; empty = grow to fill
}
```

### Attributes (`@Zone`)

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | `String` | — | Zone name, referenced by [`@Section(zone = …)`](#section) (required) |
| `width` | `String` | `""` | CSS width of the zone column. Empty means the zone grows to fill the remaining space (`flex: 1`) |

### Example

```java
@UI("/checkin/:id")
@Zones({
    @Zone(name = "left",  width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm {

    @Section(value = "Reservation", columns = 4, zone = "left")
    String localizador;
    // … more left-zone sections …

    @Section(value = "Charges", zone = "right")
    List<ChargeLine> charges;
    // … more right-zone sections …
}
```

The `left` and `right` zones render side by side (64% / 36%); each stacks its own sections.

![Zones — two side-by-side columns with independent section stacks](/images/docs/annotations/zones.png)

---

## @Colspan

Sets how many columns a field spans inside its containing form layout. A value of `2` makes the field stretch across two column slots.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Colspan {
    int value();
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `int` | — | Number of grid columns to span (required) |

### Example

```java
@FormLayout(columns = 2)
public class ProductForm {
    String name;
    double price;

    @Colspan(2)
    List<ProductComponent> components;  // stretches across both columns
}
```

---

## @ColumnWidth

**Target:** `FIELD`

Specifies a CSS width for this field's column in a grid or listing. Accepts any valid CSS length value.

A column with an explicit `@ColumnWidth` becomes a **fixed-width** column (`flex-grow: 0`); columns without one keep the default flex behaviour and share the remaining space. So in a row of columns, annotate the narrow ones (codes, flags, dates) with `@ColumnWidth` and leave the free-text column unannotated to let it absorb the slack.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface ColumnWidth {
    String value();
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | CSS width string, e.g. `"150px"` or `"20%"` (required) |

### Example

```java
record InvoiceRow(
    @ColumnWidth("80px")  String id,
    String description,                  // no width → flex-grows to fill
    @ColumnWidth("120px") double total
) {}
```

---

## @Compact

**Target:** `TYPE`

Renders a page/form in a condensed, high-density mode so information-rich screens fit without scrolling. It injects a Lumo density preset (smaller control sizes, spacing, tighter form-row gaps and field labels, smaller card padding, and a smaller auto-responsive column width so more `@Section(columns = N)` columns actually fit) into the page container, which cascades to every component inside.

It is opt-in and non-breaking: pages without `@Compact` are unaffected. The preset is also available directly as `StyleConstants.COMPACT` for use with [`@Style`](../styling/).

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Compact {}
```

### Example

```java
@UI("/checkin/:id")
@Compact
@Zones({ @Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%") })
public class CheckInForm {
    @Section(value = "Reservation", columns = 8, zone = "left")
    // … many read-only fields rendered tightly …
}
```

Pairs naturally with [`@Zones`](#zones--zone) and [`@PlainText`](../display/#plaintext) for dense, single-screen desks.

![Compact — high-density form with 4 columns](/images/docs/ux-patterns/high-density.png)

---

## @Scroller

Wraps the page content in a scrollable container.

```java
public @interface Scroller {
    String direction() default "";
    String style() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `direction` | `String` | `""` | Scroll direction: `"vertical"`, `"horizontal"`, or `"both"` |
| `style` | `String` | `""` | Inline CSS for the scroller container |

### Example

```java
@UI("/feed")
@Scroller(direction = "vertical")
public class FeedPage {
    Component items;
}
```

---

## @DetailFormCustomisation

**Target:** `FIELD`

Customises where the detail form appears when using a master-detail or embedded CRUD. Controls the position, column count, and visual styling of the detail panel.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface DetailFormCustomisation {
    FormPosition position() default FormPosition.right;
    String style() default "";
    String theme() default "";
    int columns() default 2;
}
```

### FormPosition values

| Value | Description |
|---|---|
| `right` | Detail panel opens to the right of the master (default) |
| `left` | Detail panel opens to the left |
| `top` | Detail panel opens above |
| `bottom` | Detail panel opens below |
| `modal` | Detail opens in a centred modal dialog |
| `modalLeft` | Detail opens in a modal anchored left |
| `modalRight` | Detail opens in a modal anchored right |

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `position` | `FormPosition` | `right` | Where the detail panel appears |
| `columns` | `int` | `2` | Number of form columns in the detail panel |
| `style` | `String` | `""` | Inline CSS for the detail panel |
| `theme` | `String` | `""` | Theme variant |

### Example

```java
public class Level1View {
    @DetailFormCustomisation(position = FormPosition.right, columns = 1)
    List<Level2Row> items;
}
```

---

## @DivStyle

**Target:** `TYPE`, `FIELD`, `PARAMETER`

Applies inline CSS to the wrapper `<div>` of the annotated element. Useful for controlling the outer container independently of the element's own style.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER})
public @interface DivStyle {
    String value();
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | Inline CSS string applied to the wrapping div (required) |

### Example

```java
@DivStyle("padding: 1rem; background: #f5f5f5;")
public class InfoBox {
    String message;
}
```

---

## Real-world example

`MixedPage` from the admin-panel demo combines `@FormLayout`, `@Style`, and a mix of data fields and fluent components on a single page:

```java
@UI("/mixed")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class MixedPage {

    String name;

    Component stats = new HorizontalLayout(
            Chart.builder()
                    .chartType(ChartType.doughnut)
                    .chartData(ChartData.builder()
                            .labels(List.of("Scrap", "Create release", "Deploy"))
                            .datasets(List.of(ChartDataset.builder()
                                    .label("label 1")
                                    .data(List.of(1d, 2d, 3d))
                                    .build()))
                            .build())
                    .chartOptions(ChartOptions.builder()
                            .maintainAspectRatio(false)
                            .build())
                    .build(),
            new Avatar("Mateu")
    );

    @Button
    void save() {}
}
```

The single-column `@FormLayout` stacks the `name` text field on top of the `stats` component row, with the `save` button rendered inline below both.

![MixedPage — declarative field with fluent chart and avatar](/images/docs/components/mixed.png)
