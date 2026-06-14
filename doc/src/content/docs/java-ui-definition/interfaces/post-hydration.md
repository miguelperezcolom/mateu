---
title: "PostHydrationHandler"
description: "Execute logic immediately after the ViewModel is hydrated with request state."
---

**Interface** — `io.mateu.uidl.interfaces.PostHydrationHandler`

When a ViewModel implements `PostHydrationHandler`, Mateu calls `onHydrated()` after the ViewModel has been instantiated and its fields populated from the request state (path parameters, query parameters, and the component state sent by the browser). The method runs before any action is executed and before the UI is rendered.

```java
public interface PostHydrationHandler {
    void onHydrated(HttpRequest httpRequest);
}
```

---

## When to use it

Use `PostHydrationHandler` when you need to run initialisation logic that depends on the hydrated field values — for example:

- Loading related entities from a database after the id is injected.
- Computing derived fields from the hydrated state.
- Validating or correcting state before rendering.
- Setting up cached or transient data that other methods will use.

This is the recommended place for any "post-load" work that would otherwise clutter action methods or require lazy initialisation patterns.

---

## Example

```java
@UI("/orders/{id}")
public class OrderForm implements PostHydrationHandler {

    public String id;

    // populated in onHydrated, used by the form fields
    public String customerName;
    public String status;
    public List<OrderLine> lines;

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        var order = orderRepository.findById(id).orElseThrow();
        customerName = order.getCustomer().getName();
        status = order.getStatus();
        lines = order.getLines();
    }
}
```

Mateu injects `id` from the route, then calls `onHydrated()` — the rest of the fields are populated before the form is rendered or any action runs.

---

## Execution order

1. ViewModel instantiated
2. Path/query parameters and component state injected into fields
3. **`onHydrated()` called** ← here
4. Action executed (if the request is an action call)
5. UI rendered and sent to the client
