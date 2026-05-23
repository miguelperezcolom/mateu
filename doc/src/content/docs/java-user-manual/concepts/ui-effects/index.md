---
title: "UI effects"
---

UI effects are the values an action returns to control what happens in the browser after it runs.

Mateu reads the return type of each action method and dispatches the appropriate effect. You do not call any framework API to trigger an effect — you simply return a value.

---

## Message — show a notification

`Message` displays a toast notification to the user.

```java
@Button
public Message save() {
    productRepository.save(id, name, status);
    return new Message("Product saved");
}
```

The default variant is `success`. Use the builder for full control:

```java
return Message.builder()
    .variant(NotificationVariant.warning)
    .title("Stock alert")
    .text("Product is out of stock")
    .duration(8000)
    .build();
```

Available variants: `success`, `warning`, `error`, `primary`, `contrast`.

---

## State — refresh the form

`State(this)` pushes the updated ViewModel state back to the frontend.

```java
@Button
public State recalculate() {
    status = stockService.currentStatus(id);
    return new State(this);
}
```

Use this whenever an action mutates fields and you want the form to reflect the new values without a full navigation.

---

## URI — navigate to a URL

Returning a `java.net.URI` triggers a client-side navigation.

```java
@Button
public URI create() {
    String newId = productRepository.create(name, status);
    return URI.create("/products/" + newId);
}
```

This is the standard way to redirect after a create operation.

---

## Another ViewModel — open a new page

Returning a ViewModel instance tells Mateu to render it as a new page in the current slot.

```java
@Button
public ProductDetail open() {
    return productRepository.findById(id);
}
```

This avoids hardcoding URL strings and lets the framework handle routing for you.

---

## UICommand — browser-level control

`UICommand` gives direct control over browser behavior beyond simple navigation.

```java
@Toolbar
public UICommand goBack() {
    return UICommand.navigateTo("/products");
}
```

Available factory methods:

| Method | Effect |
|---|---|
| `UICommand.navigateTo(route)` | Navigate to the given route |
| `UICommand.runAction(actionId)` | Trigger a named action |
| `UICommand.runAction(actionId, targetComponentId)` | Trigger a named action on a specific component |
| `UICommand.pushStateToHistory(url)` | Push a URL to browser history without navigation |

---

## void / null — no effect

When an action returns nothing, Mateu applies no effect in the browser.

```java
@Button
public void archive() {
    productRepository.archive(id);
    // form stays as-is; user sees no change
}
```

If you mutate fields but return `void`, those mutations are lost because the form is not refreshed. Return `State(this)` to reflect mutations.

---

## Combining effects — return a List

Return a `List<?>` to apply multiple effects in a single response. See [Returning multiple results](./multiple-results/) for details.

```java
@Button
public List<?> save() {
    productRepository.save(id, name, status);
    return List.of(
        new Message("Product saved"),
        URI.create("/products/" + id)
    );
}
```

---

## Summary

| Return type | Effect |
|---|---|
| `Message` | Toast notification |
| `State(this)` | Refresh form fields |
| `URI` | Navigate to URL |
| Another ViewModel | Render new page |
| `UICommand` | Low-level browser command |
| `List<?>` | Multiple effects |
| `void` / `null` | Nothing |

---

## Next

- [Returning multiple results](./multiple-results/)
- [Action behavior](/java-user-manual/concepts/action-behavior/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
