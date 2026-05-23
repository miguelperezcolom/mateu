---
title: "The Mateu mental model"
---

A Mateu UI is a **specification**, not a page. The backend defines what exists. The renderer decides how it appears.

## Three concepts

Everything in Mateu maps to three things:

**State** — the fields that describe the current situation.

**Actions** — the methods that change it.

**Structure** — annotations that control layout, routing, navigation, and rendering behavior.

```java
public class OrderEditor {

    // state
    String orderId;
    OrderStatus status;
    List<OrderLine> lines;

    // action
    @Button
    public Message confirm() {
        // call use case
        return new Message("Order confirmed");
    }
}
```

That class is a complete UI definition. Mateu produces the form, the button, the validation, and the browser feedback from it.

## From definition to UI

Mateu works in three steps:

```text
ViewModel (Java class)
  -> UI definition (Mateu internal representation)
  -> rendered UI (browser)
```

The ViewModel is your code. The UI definition is produced by Mateu by introspecting fields, methods, and annotations. The rendered UI is what the browser receives.

You only write the ViewModel. You never write the UI definition directly, and you never write the rendered output.

## The stateless cycle

Mateu does not store UI state on the server between requests. Each browser interaction follows this path:

```text
1. request arrives (browser sends current field values + action id)
2. Mateu instantiates the ViewModel
3. Mateu hydrates it with the field values from the request
4. Mateu executes the action
5. Mateu serializes the result as a UI definition
6. browser renders the result
```

This means your ViewModels are plain Java classes with no server-side lifecycle. They are created, used, and discarded per request.

## What you define

The full set of things you can express in a ViewModel:

| Concept | How |
|---|---|
| State | fields |
| Actions | methods annotated `@Button` or Runnable fields |
| Validation | Bean Validation (`@NotEmpty`, `@NotNull`, `@Size`, ...) |
| Layout | `@Colspan`, `@Style`, `@Section` |
| Routing | `@UI`, `@Route` |
| Navigation | `@Menu` |
| Rendering intent | `@Stereotype` |
| Relationships | `@Lookup` |
| Dynamic rules | `@Rule` |
| Browser feedback | return `Message` or `UICommand` from actions |

## What Mateu produces

From those definitions, Mateu generates:

- form rendering
- list rendering
- navigation structure
- browser validation
- interaction model
- API communication between browser and backend

## The Products/Orders example

A `Product` record implementing `Identifiable`:

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

Mateu reads this and can produce a list with four columns, a detail view with four fields, and an edit form with the same fields. The `status` field, if typed as an enum, becomes a dropdown automatically.

An `OrderEditor` ViewModel adds behavior:

```java
public class OrderEditor implements Identifiable, CrudEditorForm<String> {

    @NotEmpty
    String orderId;

    @NotEmpty
    @Lookup(search = ProductOptionsSupplier.class, label = ProductLabelSupplier.class)
    String productId;

    @Min(1)
    int quantity;

    final SaveOrderUseCase saveOrderUseCase;

    @Override
    public void save(HttpRequest request) {
        saveOrderUseCase.handle(new SaveOrderCommand(orderId, productId, quantity));
    }

    @Override
    public String id() { return orderId; }
}
```

The `@Lookup` annotation tells Mateu to resolve the product relationship dynamically from the backend. The `@Min(1)` constraint is enforced in the browser. The `save` method is called when the user submits the form.

## One model, not three

The same class defines:

- what the form looks like
- what validation it enforces
- what happens when the user saves

There is no separate frontend model, no separate API controller, and no separate validation layer.

## Next

- [The basics](/mateu-about/the-basics) — a practical walkthrough of the building blocks
- [How to think in Mateu](/mateu-about/how-to-think-in-mateu) — the mindset shift
- [Architecture](/mateu-about/architecture) — how the system is structured internally
