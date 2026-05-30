---
title: "Metadata Annotations"
description: "Annotations for labels, help text, headings and display metadata."
---

## @Label

**Target:** `FIELD`, `METHOD`

Overrides the auto-generated label for a field or action. By default Mateu derives the label from the Java field name (e.g. `dateOfBirth` becomes "Date Of Birth"). Use `@Label` when you need a different wording.

```java
public @interface Label {
    String value();
}
```

```java
public class CustomerForm {
    @Label("Full name")
    String name;

    @Label("Date of birth")
    LocalDate dob;

    @Label("Save customer")
    @Button
    public void save() { ... }
}
```

---

## @Help

**Target:** `TYPE`, `FIELD`, `METHOD`

Attaches a help text to a class, field, or action. Displayed as a tooltip or helper text below the component, depending on the frontend theme.

```java
public @interface Help {
    String value();
}
```

```java
public class CustomerForm {
    @Label("VAT number")
    @Help("Enter the full VAT number including country prefix, e.g. ES12345678A")
    String vatNumber;
}
```

---

## @H1, @H2, @H3, @H4, @H5

Applied to a `String` field, these annotations render its value as an HTML heading of the corresponding level. Useful for adding section titles or dynamic headings inside a form.

```java
public @interface H1 { String style() default ""; }
public @interface H2 { String style() default ""; }
public @interface H3 { String style() default ""; }
public @interface H4 { String style() default ""; }
public @interface H5 { String style() default ""; }
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `style` | `String` | `""` | Optional inline CSS applied to the heading element |

```java
public class ReportPage {
    @H1
    String title = "Annual Report";

    @H2
    String section = "Financial Summary";

    @H3(style = "color: gray;")
    String subsection = "Revenue";
}
```

---

## @Text

**Target:** `FIELD`

Displays a `String` field as static text instead of an input field. The `container` attribute controls the HTML wrapper element.

```java
public @interface Text {
    TextContainer container() default TextContainer.p;
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `container` | `TextContainer` | `p` | HTML element used to wrap the text |

**`TextContainer` values:** `div`, `p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `span`

```java
public class ConfirmationPage {
    @Text
    String message = "Your order has been placed successfully.";

    @Text(container = TextContainer.span)
    String note = "A confirmation email will be sent shortly.";
}
```

---

## @Title and @Subtitle

Applied at type level. See [App Annotations](./app) for full documentation.

- `@Title` — sets the visible heading rendered inside the page.
- `@Subtitle` — sets a subtitle displayed below the title.

---

## @Icon

**Target:** `FIELD`, `METHOD`

Assigns an icon to an enum constant. When an enum field is rendered as a **radio group** or **checkbox group**, each option displays its icon next to the label.

> **Note:** Icons on enum values do **not** appear in `select` or `combobox` controls due to a Vaadin limitation. They only work with `radio` and `checkbox` stereotypes.

```java
public @interface Icon {
    IconKey value();
}
```

Icons are specified using the `IconKey` enum from `io.mateu.uidl.interfaces.IconKey`, which maps named constants to Vaadin icon identifiers (e.g. `IconKey.Male` → `"vaadin:male"`).

### Example

```java
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.interfaces.IconKey;

public enum Sex {
    @Label("Male")
    @Icon(IconKey.Male)
    Male,

    @Label("Female")
    @Icon(IconKey.Female)
    Female
}
```

```java
public class PersonForm {
    @Stereotype(FieldStereotype.radio)
    Sex sex;   // renders as a radio group with ♂/♀ icons next to each option
}
```

---

## @Status + @StatusMapping

**Target:** `FIELD`

Renders an enum field as a coloured status badge instead of a plain text value. Each enum constant is mapped to a `StatusType` colour.

```java
public @interface Status {
    StatusMapping[] mappings();
    StatusType defaultStatus();
}

public @interface StatusMapping {
    String from();      // enum constant name as a String
    StatusType to();    // badge colour
}
```

**`Status` attributes:**

| Attribute | Type | Description |
|---|---|---|
| `mappings` | `StatusMapping[]` | Array of enum-value-to-colour mappings |
| `defaultStatus` | `StatusType` | Colour used when no mapping matches |

**`StatusMapping` attributes:**

| Attribute | Type | Description |
|---|---|---|
| `from` | `String` | The enum constant name to match (case-sensitive) |
| `to` | `StatusType` | The badge colour to display |

**`StatusType` values:**

| Value | Badge appearance |
|---|---|
| `NONE` | No badge (plain text) |
| `INFO` | Blue informational badge |
| `SUCCESS` | Green success badge |
| `WARNING` | Yellow/orange warning badge |
| `DANGER` | Red danger / error badge |

### Example

From the Products demo:

```java
enum ProductStatus {
    Available, OutOfStock
}

record Product(
    String id,
    String name,
    @NotNull
    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "Available", to = StatusType.SUCCESS),
            @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
        }
    )
    ProductStatus status
) implements Identifiable { ... }
```

The `status` field is displayed as a green "Available" badge or a red "OutOfStock" badge in both list and detail views.

From the status demo form:

```java
enum ItemStatus {
    Active, Inactive
}

@UI("/status-demo")
@Title("Status Demo")
public class StatusDemoForm {

    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "Active",   to = StatusType.SUCCESS),
            @StatusMapping(from = "Inactive", to = StatusType.DANGER)
        }
    )
    ItemStatus status = ItemStatus.Active;

    @Button
    public Message activate() {
        status = ItemStatus.Active;
        return new Message("Activated!");
    }

    @Button
    public Message deactivate() {
        status = ItemStatus.Inactive;
        return new Message("Deactivated!");
    }
}
```
