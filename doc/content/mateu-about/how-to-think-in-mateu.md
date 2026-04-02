---
title: "How to think in Mateu"
weight: 11
---

# How to think in Mateu

Mateu requires a small but important mental shift.

You are not building screens. You are defining a model, and the screens emerge from it.

---

## The shift in practice

In a traditional stack, you might think:

> "I need a list screen with a search field and a detail page with a form. I'll build the API endpoint, then the frontend components."

In Mateu, you think:

> "I have an `Order` entity with these fields and these actions. Let me define that."

```java
@Route("orders")
@Menu("Orders")
public class OrderCrudl {
    private String id;
    private String customer;
    private OrderStatus status;
    private LocalDate deliveryDate;

    @Action
    public void approve() { ... }

    @Action
    public void cancel(String reason) { ... }
}
```

From this, Mateu produces: a list view, a detail form, action buttons, a confirmation dialog for `cancel` (because it has a parameter), navigation, and routing. No additional code needed.

---

## The core mapping

| What you define | What Mateu produces |
|---|---|
| A class | A screen |
| Fields | Form inputs and list columns |
| Methods with `@Action` | Buttons |
| Method parameters | Input forms before the action runs |
| `@Menu` | A navigation entry |
| `@ForeignKey` | A dropdown or selector |
| Bean Validation annotations | Client and server validation |

---

## Key principle

> The UI is a projection of your model.

If the model is well-defined, the UI follows. You don't design screens — you design the domain, and the screens emerge.

---

## What to stop doing

- Don't think about which components to use. Think about what data you have and what actions are available.
- Don't think about routing configuration. Annotate your classes with `@Route` and `@Menu`.
- Don't think about validation in the frontend. Use Bean Validation on your fields.

---

👉 Ready to build? [Create your first project →](../../java-create-your-project/springboot-mvc/)
