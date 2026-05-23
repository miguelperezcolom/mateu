---
title: "Action annotations"
---

These annotations add interactive buttons and actions to pages, forms, and grids.

---

# @Button

Renders a button that calls the annotated method or displays the annotated `Component` field as a button.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Button {}
```

## Usage on a method

```java
public class OrderForm {
    String orderId;
    String notes;

    @Button
    void save() {
        // persist order
    }

    @Button
    void cancel() { }
}
```

## Usage on a field

```java
public class MyPage {
    @Button
    Component customButton = Button.builder().label("Do something").build();
}
```

---

# @Action

Attaches a configurable action to a class or method with fine-grained control over confirmation dialogs, validation, and navigation.

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

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `id` | String | `""` | Action ID (auto-inferred from method name if empty) |
| `background` | boolean | `false` | Run the action in the background without blocking the UI |
| `validationRequired` | boolean | `false` | Validate the form before executing |
| `confirmationRequired` | boolean | `false` | Show a confirmation dialog before executing |
| `rowsSelectedRequired` | boolean | `false` | Require at least one row selected in a grid |
| `confirmationTitle` | String | `""` | Title of the confirmation dialog |
| `confirmationMessage` | String | `""` | Body message of the confirmation dialog |
| `confirmationText` | String | `""` | Confirm button label |
| `confirmationDenialText` | String | `""` | Cancel button label |
| `modalStyle` | String | `""` | Inline CSS for the confirmation modal |
| `modalTitle` | String | `""` | Title of the modal |
| `customEventName` | String | `""` | Fire a custom browser event on completion |
| `customEventDetail` | String | `""` | Payload attached to the custom event |
| `href` | String | `""` | Navigate to this URL instead of calling a method |
| `js` | String | `""` | Execute JavaScript on the client side |
| `sse` | boolean | `false` | Stream results via SSE |
| `fieldsToValidate` | String | `""` | Comma-separated field IDs to validate |
| `bubble` | boolean | `false` | Bubble the action result to the parent component |

## Usage

```java
public class OrderForm {
    String orderId;

    @Action(
        confirmationRequired = true,
        confirmationTitle = "Delete order",
        confirmationMessage = "This cannot be undone. Continue?",
        confirmationText = "Delete",
        confirmationDenialText = "Cancel"
    )
    void delete() {
        // delete the order
    }

    @Action(validationRequired = true)
    void submit() {
        // submit the order
    }
}
```

## Repeatable

Multiple `@Action` annotations can be stacked on the same method.

---

# @RowAction

Marks a method as a row-level action in a grid. The method is called with the selected row data.

```java
public @interface RowAction {}
```

## Usage

```java
public class InvoiceListingPage implements ListingBackend<Filters, InvoiceRow> {

    @RowAction
    void approve(InvoiceRow row) {
        // approve the selected invoice
    }
}
```

---

# @ListToolbarButton

Adds a toolbar button to a listing page. Can optionally require row selection and show a confirmation dialog.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ListToolbarButton {
    boolean confirmationRequired() default true;
    boolean rowsSelectedRequired() default true;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `confirmationRequired` | boolean | `true` | Show confirmation before executing |
| `rowsSelectedRequired` | boolean | `true` | Require at least one row selected |

## Usage

```java
public class CustomerListing implements ListingBackend<Filters, CustomerRow> {

    @ListToolbarButton(confirmationRequired = true, rowsSelectedRequired = true)
    void exportSelected(HttpRequest httpRequest) {
        var selected = httpRequest.getSelectedRows(CustomerRow.class);
        // export
    }
}
```

---

# @ViewToolbarButton

Adds a toolbar button to a detail/view page.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ViewToolbarButton {}
```

## Usage

```java
public class OrderDetailPage {
    String orderId;

    @ViewToolbarButton
    void printOrder() {
        // print
    }
}
```

---

# @Toolbar

Places the annotated field or method in the toolbar area of a page.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Toolbar {}
```

## Usage

```java
public class DashboardPage {
    @Toolbar
    Component filterBar = HorizontalLayout.builder()
        .content(List.of(new Text("Filters:")))
        .build();
}
```

---

# @WizardCompletionAction

Marks a field or method as the final action in a multi-step wizard, typically rendered as a "Finish" button.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface WizardCompletionAction {}
```

## Usage

```java
public class SetupWizard {
    @Tab("Step 1") String name;
    @Tab("Step 2") String plan;
    @Tab("Step 3") String payment;

    @WizardCompletionAction
    void complete() {
        // finalize setup
    }
}
```
