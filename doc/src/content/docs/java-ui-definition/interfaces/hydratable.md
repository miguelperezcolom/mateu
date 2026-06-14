---
title: "Hydratable"
description: "Take full control of ViewModel hydration, bypassing automatic field injection."
---

**Interface** — `io.mateu.uidl.interfaces.Hydratable`

By default, Mateu hydrates a ViewModel by iterating over the component state sent by the browser and writing each key-value pair into the matching field via reflection. When a ViewModel implements `Hydratable`, this automatic injection is **skipped entirely** and `hydrate()` is called instead, letting the ViewModel deserialise the request state however it needs.

```java
public interface Hydratable {
    void hydrate(HttpRequest httpRequest);
}
```

---

## When to use it

Use `Hydratable` when:

- The ViewModel's internal structure does not map 1-to-1 with the state fields the client sends.
- You need to deserialise state into a complex or nested structure that reflection cannot handle.
- You want to apply validation or transformation during hydration itself.
- The ViewModel wraps a domain object that should not expose public setters.

For the common case of running extra logic *after* automatic hydration, use [`PostHydrationHandler`](post-hydration/) instead — it is simpler and does not require you to manually read all fields from the request.

---

## Execution order

1. ViewModel instantiated
2. **`hydrate()` called** ← replaces automatic field injection
3. `PostHydrationHandler.onHydrated()` called (if also implemented)
4. Action executed (if the request is an action call)
5. UI rendered and sent to the client

---

## Example

```java
@UI("/orders/{id}")
public class OrderForm implements Hydratable {

    private Order order;  // domain object — no public setters

    @Override
    public void hydrate(HttpRequest httpRequest) {
        var state = httpRequest.getState(Map.class);
        var id = (String) state.get("id");
        this.order = orderRepository.findById(id).orElseThrow();
        // apply any edits the user made
        if (state.containsKey("status")) {
            this.order.setStatus((String) state.get("status"));
        }
    }

    public String getId()     { return order.getId(); }
    public String getStatus() { return order.getStatus(); }
}
```

> **Note:** When implementing `Hydratable`, you are responsible for reading all relevant fields from `httpRequest`. Any state the client sends that you do not read in `hydrate()` will not be applied to the ViewModel.
