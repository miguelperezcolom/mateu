---
title: "FormField"
---

The building block for user input. A `FormField` defines a single typed input inside a `FormLayout`.

## Basic usage

```java
FormField.builder()
    .id("name")
    .label("Name")
    .dataType(FieldDataType.string)
    .required(true)
    .initialValue("Mateu")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Field identifier — used to read/write the value in state |
| `label` | String | — | Human-readable label |
| `dataType` | `FieldDataType` | — | The type of data this field holds |
| `stereotype` | `FieldStereotype` | regular | Rendering hint (password, email, textarea, …) |
| `readOnly` | boolean | false | Disables editing |
| `required` | boolean | false | Marks the field as mandatory |
| `autofocus` | boolean | false | Gives the field focus on load |
| `placeholder` | String | — | Placeholder text |
| `description` | String | — | Helper text shown below the field |
| `options` | `List<Option>` | `[]` | Fixed choices for select / radio / checkbox fields |
| `remoteCoordinates` | `RemoteCoordinates` | — | Endpoint for dynamic option loading |
| `initialValue` | Object | — | Value pre-filled when the form loads |
| `colspan` | int | 1 | Number of `FormLayout` columns this field spans |
| `sliderMin` | int | 0 | Minimum value for slider stereotype |
| `sliderMax` | int | 100 | Maximum value for slider stereotype |
| `stepButtonsVisible` | boolean | false | Shows +/- buttons on numeric fields |
| `step` | double | 1 | Increment step for numeric fields |
| `style` | String | — | Inline CSS for the field |
| `cssClasses` | String | — | CSS class names |

## Data types (`FieldDataType`)

| Value | Rendered as |
|---|---|
| `string` | Text field |
| `integer` | Integer number field |
| `number` | Decimal number field |
| `money` | Currency amount field |
| `boolean` | Checkbox |
| `date` | Date picker |
| `time` | Time picker |
| `dateTime` | Date-time picker |

## Stereotypes (`FieldStereotype`)

Stereotypes refine how a field is rendered without changing its data type.

| Value | Description |
|---|---|
| `regular` | Default input (text field, number field, etc.) |
| `password` | Masked text input |
| `email` | Email input |
| `textarea` | Multi-line text area |
| `richText` | Rich text / WYSIWYG editor |
| `markdown` | Markdown editor |
| `html` | Raw HTML display |
| `link` | Hyperlink display |
| `image` | Image upload / display |
| `color` | Colour picker |
| `icon` | Icon selector |
| `slider` | Slider (range input) |
| `stars` | Star rating input |
| `select` | Dropdown select |
| `comboBox` | Searchable combo box |
| `radioButtons` | Radio button group |
| `checkboxes` | Checkbox group |
| `listBox` | List box (multi-select) |
| `multiSelectComboBox` | Multi-select combo box |
| `file` | File upload |
| `editableGrid` | Inline editable grid |
| `grid` | Read-only embedded grid |

## String field examples

```java
// Plain text
FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build()

// Password
FormField.builder().id("pwd").label("Password")
    .dataType(FieldDataType.string).stereotype(FieldStereotype.password).build()

// Textarea
FormField.builder().id("bio").label("Bio")
    .dataType(FieldDataType.string).stereotype(FieldStereotype.textarea).build()

// Email
FormField.builder().id("email").label("Email")
    .dataType(FieldDataType.string).stereotype(FieldStereotype.email).build()
```

## Numeric field examples

```java
// Integer with step buttons
FormField.builder().id("qty").label("Quantity")
    .dataType(FieldDataType.integer).stepButtonsVisible(true).step(1).build()

// Decimal
FormField.builder().id("price").label("Price")
    .dataType(FieldDataType.number).build()

// Currency
FormField.builder().id("amount").label("Amount")
    .dataType(FieldDataType.money).build()

// Slider
FormField.builder().id("rating").label("Rating")
    .dataType(FieldDataType.integer).stereotype(FieldStereotype.slider)
    .sliderMin(1).sliderMax(10).build()
```

## Boolean field

```java
FormField.builder().id("active").label("Active")
    .dataType(FieldDataType.boolean_).build()
```

## Date / time fields

```java
FormField.builder().id("dob").label("Date of birth").dataType(FieldDataType.date).build()
FormField.builder().id("start").label("Start time").dataType(FieldDataType.time).build()
FormField.builder().id("created").label("Created at").dataType(FieldDataType.dateTime).build()
```

## Select field with fixed options

```java
FormField.builder()
    .id("status")
    .label("Status")
    .dataType(FieldDataType.string)
    .stereotype(FieldStereotype.select)
    .options(List.of(
        new Option("active", "Active"),
        new Option("inactive", "Inactive")
    ))
    .build()
```

## Read-only field

```java
FormField.builder()
    .id("code")
    .label("Code")
    .dataType(FieldDataType.string)
    .readOnly(true)
    .initialValue("AUTO-001")
    .build()
```

## Wide field spanning multiple columns

```java
FormField.builder()
    .id("notes")
    .label("Notes")
    .dataType(FieldDataType.string)
    .stereotype(FieldStereotype.textarea)
    .colspan(2)
    .build()
```
