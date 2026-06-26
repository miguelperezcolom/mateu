---
title: "Field Type Annotations"
description: "Annotations that control the input widget type and slider bounds."
---

These annotations control how individual fields are rendered and what input widget is used in edit mode.

---

## @Stereotype

**Target:** `FIELD`

Sets the input widget type for a field. Mateu infers a default stereotype from the Java type (e.g. `String` → text input, `boolean` → checkbox), but `@Stereotype` overrides that inference.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Stereotype {
    FieldStereotype value();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `FieldStereotype` | The widget stereotype to apply |

### FieldStereotype enum

| Value | Description |
|---|---|
| `regular` | Default text input |
| `radio` | Radio button group |
| `checkbox` | Checkbox input |
| `textarea` | Multi-line text area |
| `toggle` | Toggle switch |
| `combobox` | Combo box (typed input with dropdown) |
| `select` | Dropdown select |
| `email` | Email input |
| `password` | Password input (masked) |
| `richText` | Rich text / WYSIWYG editor |
| `listBox` | List box (scrollable options) |
| `html` | Raw HTML display |
| `markdown` | Markdown editor / renderer |
| `image` | Image display (`<img>` from a URL / data-URI value) |
| `uploadableImage` | Image preview + upload (replace) + delete actions — see [`@UploadableImage`](#uploadableimage) |
| `icon` | Icon picker |
| `link` | Hyperlink |
| `money` | Currency amount |
| `grid` | Embedded data grid |
| `color` | Color picker |
| `choice` | Choice selector |
| `popover` | Popover trigger |
| `slider` | Range slider |
| `button` | Button |
| `stars` | Star rating |

### Example

From the Products demo:

```java
@Stereotype(FieldStereotype.textarea)
@HiddenInList
String description;
```

![Field stereotypes — email, password, textarea, toggle, radio and slider](/images/docs/annotations/stereotypes.png)

---

## @UseRadioButtons

No attributes. Shorthand for `@Stereotype(FieldStereotype.radio)`. Renders an enum or options field as a radio button group instead of a dropdown.

```java
public @interface UseRadioButtons {}
```

### Example

```java
public class OrderForm {
    @UseRadioButtons
    DeliveryMethod delivery;
}
```

---

## @UploadableImage

**Target:** `FIELD`

No attributes. Shorthand for `@Stereotype(FieldStereotype.uploadableImage)`. Renders a `String`
field as an **uploadable image**: the image preview combined with an *Upload* (or *Replace*)
action and a *Delete* action.

```java
public @interface UploadableImage {}
```

The picked file is read **client-side** into a data URI (base64) and stored as the field value,
so the image travels in the string itself — **no upload endpoint is required**. The value may also
be a plain image URL. *Delete* clears the value; pressing your form's action round-trips the value
(the data URI or URL) to the backend like any other string.

### Example

```java
@UI("/profile")
public class Profile {

    String name;

    @UploadableImage
    @Label("Avatar")
    String avatar;   // null/empty → "upload" placeholder; a data-URI/URL → preview + replace + delete

    @Toolbar
    Object save() {
        return Message.success("Saved");
    }
}
```

In read-only mode the field shows just the image (same as `@Stereotype(FieldStereotype.image)`).

---

## @SliderMin

**Target:** `FIELD`

Sets the minimum value for a slider field. Used together with `@Stereotype(FieldStereotype.slider)` and `@SliderMax`.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SliderMin {
    int value();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `int` | Minimum value of the slider range |

---

## @SliderMax

**Target:** `FIELD`

Sets the maximum value for a slider field. Used together with `@Stereotype(FieldStereotype.slider)` and `@SliderMin`.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SliderMax {
    int value();
}
```

### Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `int` | Maximum value of the slider range |

### Slider example

```java
@Stereotype(FieldStereotype.slider)
@SliderMin(0)
@SliderMax(100)
int progress;
```

---

## File fields

A field of type `io.mateu.uidl.data.File[]` is automatically rendered as an upload widget — no annotation needed. Mateu infers `dataType = file` from the field type.

```java
import io.mateu.uidl.data.File;

public class ContractForm {

    File[] documents;   // → upload widget, stores { id, name } per file

    @Button
    Object save() {
        for (File f : documents) {
            persist(f.id(), f.name());
        }
        return Message.success("Saved");
    }
}
```

The upload widget POSTs each file to the fixed path `POST /upload`. Your application must expose that endpoint; it must return the file identifier as plain text. See [File Upload](/java-ui-definition/components/file-upload/) for the full guide including Spring Boot, Micronaut, and Quarkus examples.

---

## @Searchable

**Target:** `FIELD`

Marks a field so the UI renders a "Search" button next to it. Clicking the button opens a modal containing the class referenced by `selector()` — typically a `Listing` that also implements `Selector`. When the user picks a row the modal closes and the field is populated with the selected id; the `label()` supplier provides the human-readable display text.

Use `@Searchable` instead of `@Lookup` when the selection screen needs filters, sortable columns, row actions, or even CRUD capabilities — anything more complex than a simple dropdown.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Searchable {
    Class<? extends Selector>     selector()     default Selector.class;
    Class<? extends LabelSupplier> label()       default LabelSupplier.class;
    boolean bubble()        default false;
    boolean editableCode()  default false;
    boolean showCode()      default false;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `selector` | `Class<? extends Selector>` | `Selector.class` | Screen opened in the modal. Must implement `Selector<IdType>`. Typically also extends `Listing`. |
| `label` | `Class<? extends LabelSupplier>` | `LabelSupplier.class` | Resolves the display text for a stored id. |
| `bubble` | `boolean` | `false` | Propagates the selection event to the parent component. |
| `editableCode` | `boolean` | `false` | Allows the user to type the code/id directly in the field. |
| `showCode` | `boolean` | `false` | Shows the raw id alongside the resolved label. |

### Implementing the Selector

The selector class must:

1. Implement `Selector<IdType>` — `selected()` is called when the user clicks a row and must return a `SelectedItem` containing the `id` and a `label`.
2. Optionally implement `LabelSupplier` — resolves a stored id back to its display text (reused in `label()`).
3. Typically extend `Listing<Filters, Row>` to get a full filterable, pageable table inside the modal.

```java
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 40rem;")
public class HotelSelector extends Listing<Filters, Row>
        implements Selector<String>, LabelSupplier {

    String _fieldId;   // injected by the framework

    @Override
    public ListingData<Row> search(String searchText, Filters filters,
                                   Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(
            rows.stream()
                .filter(r -> r.name().contains(searchText))
                .toList()
        );
    }

    @Override
    public SelectedItem<String> selected(HttpRequest httpRequest) {
        Row row = httpRequest.getClickedRow(rowClass());
        return new SelectedItem<>(row.id(), row.name());
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return rows.stream()
            .filter(r -> r.id().equals(id))
            .findFirst().orElseThrow().name();
    }
}
```

### Example

```java
public class BookingForm {

    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    @NotEmpty
    String hotelId;

    @Button
    Object save() {
        return Message.success("Saved " + hotelId);
    }
}
```

### `@Searchable` vs `@Lookup`

| | `@Lookup` | `@Searchable` |
|---|---|---|
| UI widget | Incremental-search dropdown (inline) | Text display + "Search" button → modal |
| Selector class | `LookupOptionsSupplier` (list of `Option`) | `Listing` + `Selector` (full screen) |
| Suitable for | Simple option lists, fast lookups | Complex grids with filters, actions, or CRUD |
