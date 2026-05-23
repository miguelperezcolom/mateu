---
title: "Action Annotations"
description: "Annotations for defining actions, buttons, and toolbar operations."
---

These annotations add interactive buttons and actions to pages, forms, and listings. They control where buttons appear, how they behave before executing (validation, confirmation), and what happens after they run.

---

## @Action

Attaches a configurable action to a method. Repeatable via the `@Actions` container, so multiple `@Action` entries can stack on the same method.

```java
@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Action {
    String id() default "";
    boolean background() default false;
    boolean validationRequired() default false;
    boolean confirmationRequired() default false;
    boolean rowsSelectedRequired() default false;
    String confirmationTitle() default "";
    String confirmationMessage() default "";
    String confirmationText() default "";
    String confirmationDenialText() default "";
    String modalStyle() default "";
    String modalTitle() default "";
    String customEventName() default "";
    String customEventDetail() default "";
    String href() default "";
    String js() default "";
    boolean sse() default false;
    String fieldsToValidate() default "";
    boolean bubble() default false;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `id` | `String` | `""` | Action ID. Auto-inferred from the method name when empty. |
| `background` | `boolean` | `false` | Run the action without blocking the UI. |
| `validationRequired` | `boolean` | `false` | Validate the form before executing. |
| `confirmationRequired` | `boolean` | `false` | Show a confirmation dialog before executing. |
| `rowsSelectedRequired` | `boolean` | `false` | Require at least one row selected in a listing. |
| `confirmationTitle` | `String` | `""` | Title shown in the confirmation dialog. |
| `confirmationMessage` | `String` | `""` | Body text of the confirmation dialog. |
| `confirmationText` | `String` | `""` | Label for the confirm button. |
| `confirmationDenialText` | `String` | `""` | Label for the cancel button. |
| `modalStyle` | `String` | `""` | Inline CSS applied to the confirmation modal. |
| `modalTitle` | `String` | `""` | Title of the modal wrapper. |
| `customEventName` | `String` | `""` | Browser custom event to fire on completion. |
| `customEventDetail` | `String` | `""` | Payload attached to the custom event. |
| `href` | `String` | `""` | Navigate to this URL instead of calling a method. |
| `js` | `String` | `""` | Execute JavaScript on the client side. |
| `sse` | `boolean` | `false` | Stream results to the UI via Server-Sent Events. |
| `fieldsToValidate` | `String` | `""` | Comma-separated field IDs to validate (subset validation). |
| `bubble` | `boolean` | `false` | Bubble the action result to the parent component. |

### Example

```java
public class OrderForm {
    String orderId;

    @Action(
        validationRequired = true,
        confirmationRequired = true,
        confirmationTitle = "Delete order",
        confirmationMessage = "This cannot be undone. Continue?",
        confirmationText = "Delete",
        confirmationDenialText = "Cancel"
    )
    void delete() {
        orderRepository.delete(orderId);
    }
}
```

`@Action` is most useful when combined with `@Toolbar` to place the button in a specific location on the screen.

---

## @Button

Marks a field or method as a button rendered inline within the form body.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Button {}
```

No attributes. The button label is derived from the method or field name.

### Example

```java
@UI("")
@Title("Simple Form")
public class SimpleForm {

    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name + "!");
    }
}
```

Unlike `@Toolbar`, `@Button` places the button inside the form layout alongside the fields rather than in the toolbar strip at the top.

---

## @RowAction

Marks a method to appear as a row-level action in a listing. The method receives the selected row as its parameter.

```java
public @interface RowAction {}
```

No attributes. The action ID is derived from the method name.

### Example

```java
public class InvoiceListing implements ListingBackend<Filters, InvoiceRow> {

    @RowAction
    void approve(InvoiceRow row) {
        invoiceService.approve(row.id());
    }
}
```

Row actions are displayed inside each row (for example as a dropdown or icon button) rather than in the page toolbar.

---

## @ListToolbarButton

Marks a method as a toolbar button in a listing view. The method receives the list of currently selected rows. Both `confirmationRequired` and `rowsSelectedRequired` default to `true`, making this annotation safe by default.

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ListToolbarButton {
    boolean confirmationRequired() default true;
    boolean rowsSelectedRequired() default true;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `confirmationRequired` | `boolean` | `true` | Show a confirmation dialog before executing. |
| `rowsSelectedRequired` | `boolean` | `true` | Disable the button until at least one row is selected. |

### Example

```java
// Products.java
@UI("/products")
@Slf4j
public class Products extends AutoCrudOrchestrator<Product> {

    @ListToolbarButton
    void doSomethingOnRows(List<Product> selection) {
        log.info("do something on {}", selection);
    }
}
```

To skip confirmation or allow execution without row selection, set the corresponding attribute to `false`:

```java
@ListToolbarButton(confirmationRequired = false)
public Object refresh(List<Grupo> selection) {
    return Message.builder().text("Refreshed " + selection.size() + " items").build();
}
```

---

## @ViewToolbarButton

Marks a method as a toolbar button on a detail or editor screen.

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ViewToolbarButton {
    boolean confirmationRequired() default true;
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `confirmationRequired` | `boolean` | `true` | Show a confirmation dialog before executing. |

### Example

```java
public class OrderDetailPage {
    String orderId;

    @ViewToolbarButton(confirmationRequired = false)
    void printOrder() {
        pdfService.print(orderId);
    }
}
```

---

## @Toolbar

Places a method or field in the toolbar area of the current view. Combine with `@Action` to add fine-grained behaviour (validation, confirmation, etc.).

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Toolbar {}
```

No attributes of its own.

### Example

```java
// CreateReleaseForm.java
@Toolbar
@Action(validationRequired = true)
Object create() {
    var businessKey = UUID.randomUUID().toString();
    return URI.create("/workflow/processes/" + businessKey + "?returnTo=/controlPlane/releases");
}
```

`@Toolbar` can also be placed on a field when the field holds a pre-built component that should appear in the toolbar.

---

## @WizardCompletionAction

Marks the final action in a multi-step wizard flow. When the annotated method is invoked, Mateu collects the state from all wizard steps before calling it.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface WizardCompletionAction {}
```

No attributes.

### Example

```java
public class SetupWizard extends WizardOrchestrator {
    StepOne stepOne;
    StepTwo stepTwo;
    StepThree stepThree;

    @WizardCompletionAction
    Object finish() {
        setupService.apply(stepOne, stepTwo, stepThree);
        return URI.create("/dashboard");
    }
}
```

The framework calls the `@WizardCompletionAction` method only after all steps have been filled in. It is the last visible button rendered in the wizard navigation.

---

## Action method return values

Action methods can return different types to drive the UI after execution:

| Return type | Effect |
|---|---|
| `void` / `null` | Nothing happens; the current view stays open. |
| A Java object or record (a form, a listing, etc.) | Mateu navigates to that object as a new view. |
| `URI` | The browser navigates to the given URL. |
| `Message` | A toast notification is shown (`Message.builder().text("...").build()`). |

```java
// Navigate to a URL
Object create() {
    return URI.create("/workflow/processes/" + UUID.randomUUID());
}

// Open another component
CreateReleaseForm createRelease(List<ChangeRow> selectedRows, HttpRequest httpRequest) {
    return createReleaseForm.withUser(extractUser(httpRequest));
}

// Show a toast
@ListToolbarButton(confirmationRequired = false)
public Object refresh(List<Grupo> selection) {
    return Message.builder().text("Refreshed " + selection.size() + " items").build();
}
```
