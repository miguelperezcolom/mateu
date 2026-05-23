---
title: "How to think in Mateu"
---

The shift Mateu requires is not technical — it is conceptual. You are not building screens. You are defining a model that becomes a UI.

## Stop thinking in pages

Traditional frontend development starts with a page. You design the page, then you wire it to the backend.

In Mateu, you start with the model. The page is a consequence of the model, not the starting point.

When you need a product management screen, you do not ask "what does this screen look like?" You ask "what is the state of a product, and what can you do with it?"

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

That question — answered in Java — is the UI definition.

## Classes are screens

Each ViewModel class corresponds to a screen or a section of a screen. A class with four fields produces a form with four fields. A class with a `@Menu` field produces a navigation entry.

There is no separate screen configuration. The class is the screen.

## Fields are state

Every field on a ViewModel is a piece of state that the browser tracks. Mateu binds it in both directions — field values flow from the browser to the backend on each action, and updated values flow back.

You do not manage this binding. You define the fields. Mateu handles the rest.

## Methods are intents

A method annotated with `@Button` represents a user intent — something the user wants to do. Mateu turns it into a button in the UI. When clicked, the current field values are sent to the backend, the method is called, and the result is reflected in the browser.

```java
@Button
public Message approveOrder() {
    approveOrderUseCase.handle(new ApproveOrderCommand(orderId));
    return new Message("Order approved");
}
```

The frontend does not own the logic. The button is just a signal. The backend decides what it means.

## Validation belongs to the model

Bean Validation annotations on ViewModel fields are not UI hints. They are constraints on the model. Mateu enforces them in the browser as a convenience, and on the backend for safety. The source of truth is always the backend constraint.

```java
@NotEmpty
String name;

@Min(0)
BigDecimal price;
```

## Relationships stay on the backend

When a field references another entity, the lookup logic stays on the backend. A `@Lookup` annotation points to a backend supplier — a plain Java class that can call any query service or repository.

```java
@Lookup(search = ProductOptionsSupplier.class, label = ProductLabelSupplier.class)
String productId;
```

The browser does not know how to resolve this relationship. It asks the backend. The backend returns options. The browser displays them.

This means your relational logic stays in one place, and you can change it without touching any frontend code.

## Actions return effects, not pages

In most frameworks, navigation is managed by the frontend. A button click triggers a route change. Mateu inverts this. Actions on the backend can return browser effects:

```java
@Button
public UICommand goToOrders() {
    return UICommand.navigate("/orders");
}
```

This keeps navigation intent in the backend, where it belongs. The frontend executes the effect; it does not decide what it is.

## The mental checklist

When building any screen in Mateu, ask:

1. What state does this screen need? (fields)
2. What can the user do? (methods / actions)
3. What validation applies? (Bean Validation)
4. What relationships need to be resolved? (`@Lookup`)
5. What does a successful action produce? (`Message`, `UICommand`, or nothing)

That is the complete specification. Mateu handles everything else.

## What you do not do

You do not:

- write HTML or JSX
- configure frontend routes
- write API clients
- manage frontend state
- duplicate validation
- synchronize models across layers

## Related

- [The basics](/mateu-about/the-basics) — the building blocks in practice
- [The Mateu mental model](/mateu-about/mental-model) — how definitions become UIs
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes) — a complete worked example
