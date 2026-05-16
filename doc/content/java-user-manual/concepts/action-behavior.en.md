---
title: "Action behavior"
weight: 5
aliases:
  - /java-user-manual/actions/
---

# Action behavior

Actions are public methods on your ViewModel that are exposed to the browser as interactive triggers.

Where an action appears, how it behaves, and what it returns are all controlled declaratively.

---

## Where actions appear: @Button vs @Toolbar vs @ListToolbarButton

### @Button

`@Button` places the action as a button in the **form footer area**.

```java
@Button
public Message greet() {
    return new Message("Hello " + name);
}
```

Use `@Button` for the primary actions of a form page (save, submit, check, etc.).

---

### @Toolbar

`@Toolbar` places the action in the **toolbar** of a form or listing — more prominent than `@Button`, typically at the top of the screen.

```java
@Toolbar
@Action(validationRequired = true)
Object create() {
    var businessKey = UUID.randomUUID().toString();
    return URI.create("/workflow/processes/" + businessKey);
}
```

In a listing, a `@Toolbar` method receives the currently selected rows as a parameter:

```java
@Toolbar
public CreateReleaseForm createRelease(
        List<ChangeRow> selectedRows,
        HttpRequest httpRequest) {
    // ...
    return createReleaseForm.withUser(user);
}
```

---

### @ListToolbarButton

`@ListToolbarButton` adds a button to the **listing toolbar** that operates on the selected rows.

```java
@ListToolbarButton
void doSomethingOnRows(List<Product> selection) {
    log.info("do something on {}", selection);
}
```

The parameter receives whichever rows the user has selected in the list.

```java
@ListToolbarButton(confirmationRequired = false)
public Object refresh(List<Grupo> seleccion) {
    return Message.builder().text("Refreshed " + seleccion.size() + " items").build();
}
```

---

## Controlling behavior: @Action

`@Action` configures how an action behaves before and during execution.

### Require validation

```java
@Toolbar
@Action(validationRequired = true)
Object create() { ... }
```

When `validationRequired = true`, Mateu validates all form fields before calling the method. If validation fails, the method is not called and errors are shown to the user.

### Require confirmation

```java
@ListToolbarButton(confirmationRequired = true)
void deleteSelected(List<Product> selection) { ... }
```

When `confirmationRequired = true` (or set via `@Action`), a confirmation dialog is shown before the method runs.

---

## Accessing the HTTP request

Actions can receive the current `HttpRequest` as a parameter to access headers, authentication tokens, or other request data.

```java
@Toolbar
public CreateReleaseForm createRelease(
        List<ChangeRow> selectedRows,
        HttpRequest httpRequest) {

    var auth = httpRequest.getHeaderValue("Authorization");
    var jwt = auth.split(" ")[1];
    // decode JWT, extract user...
    return createReleaseForm.withUser(user);
}
```

Mateu injects `HttpRequest` automatically when you declare it as a method parameter. It does not need to be wired explicitly.

---

## Row-level actions (ColumnAction)

Actions in a listing can also be attached to individual rows using `ColumnAction` and `ColumnActionGroup`.

Define the action in the row model:

```java
record Product(
    String id,
    String name,
    ColumnActionGroup action  // shown as per-row action buttons
    // ...
) {
    Product {
        action = new ColumnActionGroup(new ColumnAction[]{
            new ColumnAction("setAsBlue", "Set as blue"),
            new ColumnAction("setAsGreen", "Set as green")
        });
    }
}
```

Handle it in the orchestrator with a method whose name matches the `actionId`:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    void setAsBlue(Product row) {
        // called when "Set as blue" is clicked for that row
    }

    void setAsGreen(Product row) {
        // called when "Set as green" is clicked for that row
    }
}
```

---

## What actions can return

The return value of an action method controls what happens in the browser. See [UI effects](/java-user-manual/concepts/ui-effects/) for the full list.

Quick summary:

| Return type | Effect |
|---|---|
| `Message` | Show a toast |
| `State(this)` | Refresh the form |
| `URI` | Navigate to a URL |
| `UICommand.navigateTo(...)` | Programmatic navigation |
| Another ViewModel | Open that page |
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
- [Listing row actions](/java-user-manual/build/listing-row-actions/)
- [Custom listing](/java-user-manual/use-cases/custom-listing/)
