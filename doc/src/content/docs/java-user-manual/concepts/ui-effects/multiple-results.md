---
title: "Returning multiple results"
---

An action can return a `List<?>` to apply more than one effect in a single response.

All effects in the list are processed by the frontend in the same request cycle. There is no extra round-trip.

---

## Basic example

```java
@Button
public List<?> save() {
    productRepository.save(id, name, status);
    return List.of(
        new Message("Product saved"),
        new State(this)
    );
}
```

What happens here:

- `Message("Product saved")` → shows a success toast
- `State(this)` → refreshes the form with the current ViewModel state

---

## Combining message, state update, and navigation

```java
@Button
@Action(validationRequired = true)
public List<?> publish() {
    status = Status.Available;
    productRepository.save(id, name, status);
    return List.of(
        new Message("Product is now available"),
        URI.create("/products/" + id + "/detail")
    );
}
```

- `Message` shows feedback before navigation starts
- `URI` navigates to the product detail page

---

## Combining message and UICommand

```java
@Toolbar
public List<?> closeAndNotify() {
    auditService.log(id, "closed");
    return List.of(
        new Message("Session closed"),
        UICommand.navigateTo("/dashboard")
    );
}
```

---

## Combining State and UICommand

Use this when you want to update visible state and also trigger a browser-level command:

```java
@Button
public List<?> refresh() {
    stockCount = inventoryService.getStock(id);
    return List.of(
        new State(this),
        UICommand.pushStateToHistory("/products/" + id + "?refreshed=true")
    );
}
```

---

## Order of effects

Effects are applied in list order. In practice, the order matters only when one effect depends on another (for example, showing a message before navigating away).

---

## When to use a List

Use a `List<?>` when a single action naturally produces more than one outcome — feedback plus navigation, state update plus history push, and so on. For a single outcome, return the effect directly.

---

## Next

- [UI effects](/java-user-manual/concepts/ui-effects/)
- [Action behavior](/java-user-manual/concepts/action-behavior/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
