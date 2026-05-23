---
title: "Form fields"
---

`FormField` is the fundamental building block for user input in the fluent API.

It separates **data type** (what kind of data) from **stereotype** (how it is rendered).

---

## Basic usage

```java
FormField.builder()
        .id("name")
        .label("Name")
        .dataType(FieldDataType.string)
        .build()
```

- `id` — the key used to read and write the value in form state
- `label` — the visible label
- `dataType` — the type of the value

---

## Data types

| `FieldDataType` | Value type | Default rendering |
|---|---|---|
| `string` | Text | Text input |
| `integer` | Whole number | Number input |
| `number` | Decimal number | Number input |
| `bool` | Boolean | Checkbox |
| `date` | Date only | Date picker |
| `time` | Time only | Time picker |
| `dateTime` | Date and time | DateTime picker |
| `dateRange` | Date range | Range picker |
| `file` | File upload | File upload |
| `array` | Multiple values | Multi-select |
| `money` | Monetary amount | Money input |
| `status` | Status badge | Badge |
| `component` | Embedded component | Custom renderer |

---

## String fields

```java
// Basic string
FormField.builder()
        .id("name")
        .label("Name")
        .dataType(FieldDataType.string)
        .build()

// Read-only
FormField.builder()
        .id("name")
        .label("Name")
        .dataType(FieldDataType.string)
        .readOnly(true)
        .build()

// Textarea
FormField.builder()
        .id("description")
        .label("Description")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.textarea)
        .build()

// Email
FormField.builder()
        .id("email")
        .label("Email")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.email)
        .build()

// Password
FormField.builder()
        .id("password")
        .label("Password")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.password)
        .build()

// Rich text editor
FormField.builder()
        .id("content")
        .label("Content")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.richText)
        .build()

// HTML viewer
FormField.builder()
        .id("html")
        .label("HTML")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.html)
        .initialValue("<b>Hello</b>")
        .build()

// Markdown
FormField.builder()
        .id("md")
        .label("Markdown")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.markdown)
        .build()
```

---

## Numeric fields

```java
// Integer
FormField.builder()
        .id("age")
        .label("Age")
        .dataType(FieldDataType.integer)
        .build()

// Decimal
FormField.builder()
        .id("price")
        .label("Price")
        .dataType(FieldDataType.number)
        .build()

// Money
FormField.builder()
        .id("total")
        .label("Total")
        .dataType(FieldDataType.money)
        .build()
```

---

## Boolean fields

```java
// Checkbox (default)
FormField.builder()
        .id("active")
        .label("Active")
        .dataType(FieldDataType.bool)
        .build()

// Toggle switch
FormField.builder()
        .id("enabled")
        .label("Enabled")
        .dataType(FieldDataType.bool)
        .stereotype(FieldStereotype.toggle)
        .build()
```

---

## Date and time fields

```java
// Date
FormField.builder()
        .id("birthDate")
        .label("Birth date")
        .dataType(FieldDataType.date)
        .build()

// Time
FormField.builder()
        .id("startTime")
        .label("Start time")
        .dataType(FieldDataType.time)
        .build()

// DateTime
FormField.builder()
        .id("createdAt")
        .label("Created at")
        .dataType(FieldDataType.dateTime)
        .build()
```

---

## Choice fields (select, radio, combo, checkbox)

```java
// Combo box (dropdown with search)
FormField.builder()
        .id("country")
        .label("Country")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.combobox)
        .options(List.of(
                new Option("es", "Spain"),
                new Option("fr", "France"),
                new Option("de", "Germany")
        ))
        .build()

// Select (dropdown, no search)
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

// Radio buttons
FormField.builder()
        .id("type")
        .label("Type")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.radio)
        .options(List.of(
                new Option("A", "Type A"),
                new Option("B", "Type B")
        ))
        .build()

// Checkbox group (multi-select)
FormField.builder()
        .id("roles")
        .label("Roles")
        .dataType(FieldDataType.array)
        .stereotype(FieldStereotype.checkbox)
        .options(List.of(
                new Option("admin", "Admin"),
                new Option("editor", "Editor"),
                new Option("viewer", "Viewer")
        ))
        .build()

// List box
FormField.builder()
        .id("items")
        .label("Items")
        .dataType(FieldDataType.array)
        .stereotype(FieldStereotype.listBox)
        .options(...)
        .build()
```

---

## File upload

```java
FormField.builder()
        .id("document")
        .label("Document")
        .dataType(FieldDataType.file)
        .build()
```

---

## Required and descriptions

```java
FormField.builder()
        .id("name")
        .label("Name")
        .dataType(FieldDataType.string)
        .required(true)                        // mark as required
        .description("Enter the full name")    // hint text below the field
        .placeholder("John Doe")               // placeholder text
        .build()
```

---

## Initial value

```java
FormField.builder()
        .id("status")
        .label("Status")
        .dataType(FieldDataType.string)
        .initialValue("active")   // pre-fill the field
        .build()
```

---

## Disabled

```java
FormField.builder()
        .id("id")
        .label("ID")
        .dataType(FieldDataType.string)
        .disabled(true)
        .build()
```

---

## Field stereotypes reference

| `FieldStereotype` | Rendering |
|---|---|
| `regular` | Default for the data type |
| `textarea` | Multi-line text |
| `email` | Email input |
| `password` | Password input (hidden) |
| `richText` | Rich text editor |
| `html` | HTML viewer |
| `markdown` | Markdown viewer |
| `image` | Image display |
| `icon` | Icon |
| `toggle` | Toggle switch |
| `checkbox` | Checkbox group |
| `radio` | Radio button group |
| `combobox` | Dropdown with search |
| `select` | Dropdown (no search) |
| `listBox` | Scrollable list |
| `stars` | Star rating |
| `slider` | Range slider |
| `color` | Color picker |
| `money` | Money input with currency |
| `popover` | Value shown in a popover |
| `link` | Clickable link |
| `button` | Button style |
| `grid` | Inline grid |

---

## Next

- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
- [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/)
- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/)
