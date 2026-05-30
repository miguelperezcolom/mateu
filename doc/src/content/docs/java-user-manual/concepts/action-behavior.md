---
title: "Action behavior"
---

Actions are public methods on your ViewModel that are exposed to the browser as interactive triggers.

Where an action appears, how it behaves before execution, and what it returns are all controlled declaratively.

---

## Where actions appear: @Button vs @Toolbar vs @ListToolbarButton

### @Button

`@Button` places the action as a button in the **form footer area**.

```java
@Button
public Message save() {
    productRepository.save(id, name, status);
    return new Message("Product saved");
}
```

Use `@Button` for the primary actions of a form page (save, submit, check, etc.).

---

### @Toolbar

`@Toolbar` places the action in the **toolbar** — more prominent than `@Button`, typically at the top of the screen.

```java
@Toolbar
@Action(validationRequired = true)
public URI publish() {
    String newId = productRepository.publish(name, status);
    return URI.create("/products/" + newId);
}
```

In a listing, a `@Toolbar` method receives the currently selected rows and, optionally, the `HttpRequest`:

```java
@Toolbar
public Message archiveSelected(List<Product> selectedRows) {
    selectedRows.forEach(p -> productRepository.archive(p.id()));
    return new Message("Archived " + selectedRows.size() + " products");
}
```

---

### @ListToolbarButton

`@ListToolbarButton` adds a button to the **listing toolbar** that operates on the selected rows.

```java
@ListToolbarButton
public Message markAvailable(List<Product> selection) {
    selection.forEach(p -> productRepository.setStatus(p.id(), Status.Available));
    return Message.builder()
        .text("Marked " + selection.size() + " products as available")
        .build();
}
```

Use `confirmationRequired = false` to skip the default confirmation dialog:

```java
@ListToolbarButton(confirmationRequired = false)
public Message refresh(List<Product> selection) {
    return new Message("Refreshed " + selection.size() + " items");
}
```

---

## Controlling behavior: @Action

`@Action` configures how an action behaves before and during execution.

### Require validation

```java
@Button
@Action(validationRequired = true)
public URI create() {
    String id = productRepository.create(name, status);
    return URI.create("/products/" + id);
}
```

When `validationRequired = true`, Mateu validates all form fields before calling the method. If validation fails, the method is not called and errors are shown next to the affected fields.

### Require confirmation

```java
@ListToolbarButton(confirmationRequired = true)
public Message deleteSelected(List<Product> selection) {
    selection.forEach(p -> productRepository.delete(p.id()));
    return new Message("Deleted " + selection.size() + " products");
}
```

A confirmation dialog is shown before the method runs. The user must confirm to proceed.

---

## Automatic save: @AutoSave

`@AutoSave` on a class tells Mateu to call a save action automatically whenever the user changes a field, without requiring a button click. The call is debounced so it fires once the user has been idle for `debounceMillis` milliseconds (default 800).

```java
@UI("/settings")
@AutoSave
public class SettingsForm {

    String displayName;
    String email;

    @Toolbar
    public Message save() {
        settingsService.update(displayName, email);
        return new Message("Saved");
    }
}
```

Use `debounceMillis` and `action` to tune the behaviour:

```java
@AutoSave(debounceMillis = 1500, action = "persist")
public class DraftEditor {

    @Stereotype(FieldStereotype.richText)
    String content;

    @Toolbar
    public void persist() {
        draftService.save(content);
    }
}
```

`@AutoSave` is a good fit for settings screens, draft editors, and any form where saving should feel invisible to the user.

---

## Accessing the HTTP request

Actions can declare `HttpRequest` as a parameter to access headers, authentication tokens, or any other request metadata.

```java
@Toolbar
public Message auditAccess(HttpRequest httpRequest) {
    String auth = httpRequest.getHeaderValue("Authorization");
    String token = auth.split(" ")[1];
    auditService.log(id, token);
    return new Message("Access logged");
}
```

Mateu injects `HttpRequest` automatically when it appears as a method parameter. No wiring is needed.

---

## Row-level actions (ColumnAction)

Actions in a listing can be attached to individual rows using `ColumnAction` and `ColumnActionGroup`.

Define the action in the row model:

```java
record Product(
    String id,
    String name,
    Status status,
    ColumnActionGroup action
) {
    Product {
        action = new ColumnActionGroup(new ColumnAction[]{
            new ColumnAction("markAvailable", "Mark available"),
            new ColumnAction("markOutOfStock", "Mark out of stock")
        });
    }
}
```

Handle each action in the orchestrator with a method whose name matches the `actionId`:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    void markAvailable(Product row) {
        productRepository.setStatus(row.id(), Status.Available);
    }

    void markOutOfStock(Product row) {
        productRepository.setStatus(row.id(), Status.OutOfStock);
    }

}
```

---

## What actions can return

The return value controls what happens in the browser. See [UI effects](/java-user-manual/concepts/ui-effects/) for the full reference.

| Return type | Effect |
|---|---|
| `Message` | Show a toast notification |
| `State(this)` | Refresh the form |
| `URI` | Navigate to a URL |
| `UICommand.navigateTo(...)` | Programmatic navigation |
| Another ViewModel | Render that page |
| `List<?>` | Multiple effects |
| `void` / `null` | Nothing |

---

## Summary

| Annotation | Where it appears | Receives |
|---|---|---|
| `@Button` | Form footer | — |
| `@Toolbar` (on form) | Form toolbar | — |
| `@Toolbar` (on listing) | Listing toolbar | selected rows, HttpRequest |
| `@ListToolbarButton` | Listing toolbar | selected rows |
| `ColumnAction` | Per-row in listing | the row |

---

## Next

- [UI effects](/java-user-manual/concepts/ui-effects/)
- [Validation](/java-user-manual/concepts/validation/)
- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)
