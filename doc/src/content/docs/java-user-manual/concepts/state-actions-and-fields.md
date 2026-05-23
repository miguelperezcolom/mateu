---
title: "State, actions and fields"
---

A Mateu ViewModel is a plain Java class. Its fields are the UI state; its annotated methods are the actions.

## State (fields)

Each field in a ViewModel maps to a form control in the browser. Mateu infers the control type from the Java type.

```java
public class ProductForm {

    String name;           // → text field
    boolean active;        // → checkbox
    Status status;         // → combobox (enum)
    int stockCount;        // → number input
    LocalDate releaseDate; // → date picker

}
```

The field value is hydrated from request data before any action runs and serialized back after the action completes. There is no persistent state between requests.

### Field types and default controls

| Java type | Default control |
|---|---|
| `String` | Text field |
| `int` / `long` / `double` | Number input |
| `boolean` | Checkbox |
| `LocalDate` / `LocalDateTime` | Date / datetime picker |
| `enum` | Combobox |
| `List<String>` | Multi-select |

### Overriding the inferred control with @Stereotype

Use `@Stereotype` when the inferred control is not what you want.

```java
enum Status { Available, OutOfStock }

@Stereotype(FieldStereotype.radio)
Status status;             // → radio button group instead of combobox

@Stereotype(FieldStereotype.textarea)
String description;        // → multi-line text area instead of single-line

@Stereotype(FieldStereotype.richText)
String body;               // → rich text editor

@Stereotype(FieldStereotype.password)
String secret;             // → password input (masked)

@Stereotype(FieldStereotype.toggle)
boolean active;            // → toggle switch instead of checkbox
```

The full list of available stereotypes is defined in `FieldStereotype`:
`regular`, `radio`, `checkbox`, `textarea`, `toggle`, `combobox`, `select`, `email`, `password`, `richText`, `listBox`, `html`, `markdown`, `image`, `icon`, `link`, `money`, `grid`, `color`, `choice`, `popover`, `slider`, `button`, `stars`.

### Read-only fields

```java
@ReadOnly
String computedValue;
```

Read-only fields are shown in the form but cannot be edited by the user.

### Hidden fields

```java
@Hidden
String internalId;
```

Hidden fields carry state across requests but are not rendered.

---

## Actions

Actions are public methods that the user can trigger from the browser.

### Toolbar actions

`@Toolbar` places the action in the toolbar, typically at the top of the screen.

```java
@Toolbar
public void refresh() {
    // re-load data from backend
}
```

### Form actions

`@Button` places the action in the form footer area.

```java
@Button
public void save() {
    productRepository.save(id, name, status);
}
```

### Inline buttons

A `Runnable` field annotated with `@Button` behaves like a regular form field, so it can be positioned inline inside the form layout.

```java
@Button
Runnable generate = () -> {
    name = "Generated-" + System.currentTimeMillis();
};
```

---

## What actions can return

The return value of an action controls what happens in the browser after it completes.

### Return nothing — state mutation only

```java
@Button
public void normalize() {
    name = name.trim().toUpperCase();
}
```

When an action returns `void`, Mateu sends no explicit effect. Use `State(this)` if you want the form to reflect mutated field values.

### Return a Message — show feedback

```java
@Button
public Message check() {
    if (status == Status.OutOfStock) {
        return Message.builder()
            .variant(NotificationVariant.warning)
            .text("Product is out of stock")
            .build();
    }
    return new Message("Product is available");
}
```

`Message` shows a toast notification. The default variant is `success`.

### Return State — update the form

```java
@Button
public State validate() {
    if (name == null || name.isBlank()) {
        name = "(unnamed)";
    }
    return new State(this);
}
```

`State(this)` pushes the current ViewModel state back to the frontend, refreshing all form fields.

### Return a URI — navigate to a URL

```java
@Button
public URI create() {
    String id = productService.create(name, status);
    return URI.create("/products/" + id);
}
```

### Return another ViewModel — open a new page

```java
@Button
public ProductDetail open() {
    return productService.load(id);
}
```

Returning a ViewModel instance tells Mateu to render that object as a new page.

### Return a UICommand — browser-level control

```java
@Toolbar
public UICommand closeAndRefresh() {
    return UICommand.navigateTo("/products");
}
```

`UICommand` gives low-level control over browser behavior: navigation, running actions, pushing history state, and more.

---

## Validation

Standard Bean Validation annotations are enforced automatically. They prevent invalid form submissions and display errors next to the affected field.

```java
@NotBlank
String name;

@NotNull
Status status;

@Size(max = 200)
String description;
```

See [Validation](/java-user-manual/concepts/validation/) for more detail.

---

## Full example

```java
@UI("/products/new")
public class NewProductForm {

    @NotBlank
    String name;

    @NotNull
    @Stereotype(FieldStereotype.radio)
    Status status = Status.Available;

    @Stereotype(FieldStereotype.textarea)
    String description;

    @ReadOnly
    String summary;

    @Button
    Runnable preview = () -> {
        summary = name + " (" + status + ")";
    };

    @Button
    @Action(validationRequired = true)
    public Object save() {
        String id = productRepository.save(name, status, description);
        return List.of(
            new Message("Product saved"),
            URI.create("/products/" + id)
        );
    }

}
```

---

## Next

- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)
- [Validation](/java-user-manual/concepts/validation/)
- [UI effects](/java-user-manual/concepts/ui-effects/)
