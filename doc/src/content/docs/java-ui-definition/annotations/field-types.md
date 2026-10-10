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
| `richText` | Rich text / WYSIWYG editor. The value is HTML. A value stored by the editor of earlier versions (Quill Delta JSON) still opens, and is saved as HTML on the next edit |
| `listBox` | List box (scrollable options) |
| `html` | Raw HTML display |
| `markdown` | Markdown editor / renderer |
| `image` | Image display (`<img>` from a URL / data-URI value) |
| `uploadableImage` | Image preview + upload (replace) + delete actions — see [`@UploadableImage`](#uploadableimage) |
| `signature` | Drawing canvas that stores the accepted strokes as a PNG data URI — see [`@Signature`](#signature) |
| `camera` | Device camera with live preview; the shot lands as a JPEG data URI — see [`@PhotoCapture`](#photocapture) |
| `treeSelect` | A select whose dropdown unfolds a TREE of options — see `@TreeSelect` |
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


## @Signature

**Target:** `FIELD`

Renders a `String` field as a **signature capture**: a drawing canvas (mouse or touch) with
*Clear* and *Accept*. Accepting stores the strokes as a **PNG data URI** in the field value — the
same self-contained contract as `@UploadableImage`, no upload endpoint involved. An existing value
shows as the signature image with *Sign again* / *Delete* actions, and the read-only rendering
shows the image.

```java
@Signature
@Label("Firma del huésped")
String signature;
```

## @PhotoCapture

**Target:** `FIELD`

Renders a `String` field as a **photo capture**: opens the device camera (`getUserMedia`) with a
live preview and a shutter; the shot is stored as a **JPEG data URI** in the field value. When the
camera is unavailable (no device, permission denied, insecure context) the widget offers a file
input with `capture`, which on phones opens the native camera. Same self-contained round-trip as
`@UploadableImage`.

```java
@PhotoCapture
@Label("Foto del documento")
String documentPhoto;
```

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
| `selector` | `Class<? extends Selector>` | `Selector.class` | Screen opened in the modal. Must implement `Selector<IdType>`. Typically also implements `Listing`. |
| `label` | `Class<? extends LabelSupplier>` | `LabelSupplier.class` | Resolves the display text for a stored id. |
| `bubble` | `boolean` | `false` | Propagates the selection event to the parent component. |
| `editableCode` | `boolean` | `false` | Allows the user to type the code/id directly in the field. |
| `showCode` | `boolean` | `false` | Shows the raw id alongside the resolved label. |

### Implementing the Selector

The selector class must:

1. Implement `Selector<IdType>` — `selected()` is called when the user clicks a row and must return a `SelectedItem` containing the `id` and a `label`.
2. Optionally implement `LookupLabelSupplier` — resolves a stored id back to its display text (reused in `label()`).
3. Typically implement `Listing<Row>` (plus `Searchable`, and `Filterable<Filters>` for a filter bar) to get a full filterable, pageable table inside the modal.

```java
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 40rem;")
public class HotelSelector implements Listing<Row>, Searchable,
        Selector<String>, LookupLabelSupplier {

    String _fieldId;

    @Override
    public String fieldId() { return _fieldId; }

    @Override
    public Selector withFieldId(String fieldId) {
        _fieldId = fieldId;
        return this;
    }

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.of(
            rows.stream()
                .filter(r -> r.name().contains(request.searchText()))
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

### Multi-valued fields: `List`, `Set` and arrays of ids

The same annotation works on a field that holds **several** ids — a `List<IdType>`, a `Set<IdType>` or an `IdType[]` (`String`, `Long`/`Integer`, `UUID`…). Nothing else changes in the declaration: multi-selection is inferred from the field type, and the same selector serves both kinds of field.

```java
public class CampaignForm {

    // one hotel
    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    String hotelId;

    // several hotels: chips + «Add»
    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    List<String> hotelIds = new ArrayList<>();

    @Searchable(selector = ChannelSelector.class)
    Set<Long> channels;

    @Searchable(selector = ContractSelector.class)
    UUID[] contracts;
}
```

How a multi-valued `@Searchable` behaves (Vaadin and Redwood alike):

- The current ids render as **chips**, each labelled through `label()` (falling back to the id when there is no label), with a ✕ to remove it, plus an **«Add»** button.
- «Add» opens the selector in the modal with **row selection** enabled and an **«Add selected»** button: the checked rows are **added** to the field — appended in order, without duplicates (and with `Set` semantics for a `Set`) — and the modal closes. Clicking a row adds just that row.
- Removing a chip removes the id (client-side; it travels with the next action). In a read-only view the field shows the labels only.
- Validation is the usual one (`@NotEmpty`, `@Size`…, checked on the server); the ids bind back into the `List`, `Set` or array with the element type converted (JSON numbers and strings into `Long`, strings into `UUID`…).

The labels travel in the component data: `<field>-label` holds the display text (for a multi-valued field, the labels joined by `", "`), and `<field>-labels` holds `{id → label}` for the chips. When `label()` is not given, the view model labels the ids if it is a `LookupLabelSupplier`, and otherwise the selector does, if it is one.

#### The Selector side: `selectedItems`

`Selector` has a default method for multi-selection:

```java
public interface Selector<IdType> {
    SelectedItem<IdType> selected(HttpRequest httpRequest);       // the clicked row

    default List<SelectedItem<IdType>> selectedItems(HttpRequest httpRequest) {
        // each checked row mapped through selected(), as if it were the clicked row
    }

    String fieldId();
    Selector withFieldId(String name);
}
```

The default presents each checked row to `selected()` as the clicked row, so a selector written for single-valued fields — one that reads `httpRequest.getClickedRow(...)`, like `HotelSelector` above — serves multi-valued fields with **no extra code**. Override `selectedItems` only when the checked rows need a different mapping:

```java
@Override
public List<SelectedItem<Long>> selectedItems(HttpRequest httpRequest) {
    return httpRequest.getSelectedRows(ChannelRow.class).stream()
        .map(row -> new SelectedItem<>(row.id(), row.name()))
        .toList();
}
```

The merging happens on the server: the modal carries the ids the field held when it opened, and the selector answers the merged value, its labels and the close of the modal.

### `@Searchable` vs `@Lookup`

| | `@Lookup` | `@Searchable` |
|---|---|---|
| UI widget | Incremental-search dropdown (inline) | Text display + "Search" button → modal (chips + «Add» for a `List`/`Set`/array of ids) |
| Selector class | `LookupOptionsSupplier` (list of `Option`) | `Listing` + `Selector` (full screen) |
| Suitable for | Simple option lists, fast lookups | Complex grids with filters, actions, or CRUD |
