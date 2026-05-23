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
| `image` | Image upload / display |
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
