---
title: "StateSupplier"
description: "Provide a custom object as the component state sent to the client."
---

By default, Mateu serialises the ViewModel itself as the component state sent to the browser. `StateSupplier` lets you return a different object instead — useful when the state the client needs is a projection, a DTO, or a computed view of the ViewModel's internal data.

```java
public interface StateSupplier {
    Object state(HttpRequest httpRequest);
}
```

The returned object is serialised to JSON and sent to the browser as the component's initial state. Field values in the returned object become available in client-side rule expressions as `state.<fieldName>`.

---

## When to use it

Use `StateSupplier` when:

- The ViewModel contains fields that should not be exposed to the client (e.g., internal service references, sensitive data).
- The client state is a computed projection rather than the raw ViewModel fields.
- You need to control exactly what is serialised without using `@Hidden` on every private field.

If you only want to hide a few fields, `@Hidden` or `VisibilitySupplier` is simpler. `StateSupplier` gives you full control at the cost of having to manage the projection manually.

---

## Example

```java
@UI("/orders/{id}")
public class OrderForm implements StateSupplier {

    private final OrderService orderService;  // injected — should not reach the client
    public String orderId;
    public String status;
    public double total;

    public record OrderState(String orderId, String status, double total) {}

    @Override
    public Object state(HttpRequest httpRequest) {
        return new OrderState(orderId, status, total);
    }
}
```

Only `orderId`, `status`, and `total` are sent to the browser; `orderService` is never serialised.
