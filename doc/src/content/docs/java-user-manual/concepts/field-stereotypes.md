---
title: "Field stereotypes"
---

Mateu infers the UI control for each field from its Java type. `@Stereotype` overrides that inference when the default is not what you want.

---

## Default inference

| Java type | Default control |
|---|---|
| `String` | Text field |
| `int` / `long` / `double` | Number input |
| `boolean` | Checkbox |
| `LocalDate` | Date picker |
| `LocalDateTime` | Datetime picker |
| `enum` | Combobox |
| `List<String>` | Multi-select |

This means a basic form requires no annotations beyond field declarations:

```java
public class ProductForm {

    String name;
    Status status;   // enum → combobox
    boolean active;
    LocalDate releaseDate;

}
```

---

## Overriding with @Stereotype

Use `@Stereotype` when the inferred control is not the right choice for that field's presentation intent.

```java
enum Status { Available, OutOfStock }

@Stereotype(FieldStereotype.radio)
Status status;           // radio group instead of combobox
```

```java
@Stereotype(FieldStereotype.textarea)
String description;      // multi-line instead of single-line
```

```java
@Stereotype(FieldStereotype.toggle)
boolean active;          // toggle switch instead of checkbox
```

```java
@Stereotype(FieldStereotype.password)
String apiKey;           // masked input
```

```java
@Stereotype(FieldStereotype.richText)
String body;             // rich text editor
```

```java
@Stereotype(FieldStereotype.markdown)
String notes;            // markdown editor
```

```java
@Stereotype(FieldStereotype.email)
String contactEmail;     // email input with built-in format hint
```

```java
@Stereotype(FieldStereotype.money)
double price;            // currency-formatted number
```

```java
@Stereotype(FieldStereotype.stars)
int rating;              // star rating control
```

```java
@Stereotype(FieldStereotype.color)
String themeColor;       // color picker
```

---

## Full list of stereotypes

Defined in `io.mateu.uidl.data.FieldStereotype`:

`regular`, `radio`, `checkbox`, `textarea`, `toggle`, `combobox`, `select`, `email`, `password`, `richText`, `listBox`, `html`, `markdown`, `image`, `icon`, `link`, `money`, `grid`, `color`, `choice`, `popover`, `slider`, `button`, `stars`

---

## Why "stereotype" and not "component"

Mateu does not ask you to pick a low-level UI component. It asks you to express presentation intent.

The data type says what the field holds. The stereotype says how it should be presented. The framework maps that combination to the appropriate component in the active UI technology.

This separation means the same ViewModel can be rendered with different frontend technologies without changing the Java code.

---

## Mental model

> inference-first, override-when-needed

Define the data. Mateu chooses the control. Override with `@Stereotype` only when the inference is wrong.

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Validation](/java-user-manual/concepts/validation/)
- [Declarative vs fluent](/java-user-manual/concepts/declarative-vs-fluent/)
