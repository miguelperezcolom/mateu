---
title: "The basics"
weight: 2
---

# The basics

Any user interface does two things: **display information** and **enable interaction**. Mateu lets you describe both using plain Java — no HTML, CSS, or JavaScript required.

## Starting point

You link a URL to a Java class. When a user navigates to that URL, Mateu reads the class and renders a UI from it.

From there, you have two approaches.

---

## The declarative approach

This is the most common way to use Mateu. You describe *what* the UI contains, and Mateu figures out *how* to render it.

**Expose a button:**

```java
@Action
public void approve() {
    this.status = Status.APPROVED;
}
```

Annotating a method with `@Action` turns it into a button. When clicked, the method executes on the server and the UI updates.

**Collect user input:**

```java
private String customerName;
private LocalDate deliveryDate;

@ForeignKey(Product.class)
private String productId;
```

Fields in your class become form inputs automatically. Mateu infers the field type and generates the appropriate control — text input, date picker, dropdown, and so on.

**Collect input before an action:**

```java
@Action
public void reschedule(LocalDate newDate, String reason) {
    // newDate and reason are collected via a form before the method runs
}
```

Method parameters on an `@Action` method generate a form that collects those values before the method is called.

You can fine-tune layout, labels, visibility rules, and more with annotations — but the above is the core model.

---

## The imperative approach

For more complex or dynamic UIs, Mateu provides a fluent API that gives you full control over the component tree.

```java
public class OrderDetail implements ComponentSupplier, ActionHandler {

    @Override
    public Component buildContent() {
        return VerticalLayout.of(
            FormLayout.of(
                TextField.of("Customer", this.customer),
                DatePicker.of("Delivery date", this.deliveryDate)
            ),
            Button.of("Approve", this::approve)
        );
    }
}
```

This approach is more verbose but gives you complete control over structure and behavior.

---

## What Mateu handles automatically

Regardless of which approach you use, Mateu takes care of:

- rendering the appropriate component for each field type
- wiring actions to server-side methods
- managing the request/response cycle
- keeping the UI in sync with the server state
- navigation and routing from your `@Menu` and `@Route` annotations
