---
title: "Backend-Driven UIs. Simpler, Faster, Smarter."
---

# Stop building frontends twice.

Most business applications repeat the same work in two places: backend and frontend. Two models, two validations, two routing layers, constant synchronization.

**Mateu eliminates that duplication.**

You define your UI once, in plain Java. Mateu renders it.

---

## See it in 30 seconds

```java
@Route("orders")
@Menu("Orders")
public class OrderCrudl {

    private String id;
    private String customer;

    @ForeignKey(Product.class)
    private String product;

    private OrderStatus status;

    @Action
    public void approve() {
        // your logic here
    }
}
```

That's a complete CRUD screen with navigation, a foreign key selector, an action button, and validation — **no frontend code required**.

👉 [Try the live demo](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [Build your first backoffice in 10 minutes →](https://mateu.io/java-create-your-project/springboot-mvc/)

---

## What Mateu is for

Mateu targets a specific, very common class of applications:

- Internal tools and back-offices
- CRUD-heavy business systems
- Enterprise portals and workflows
- Distributed applications with multiple services

For these, a traditional React + Spring stack creates overhead without benefit. Mateu removes that overhead entirely.

---

## How it works

```
Your Java classes → Mateu model → Simple API → Frontend renderer → UI
```

1. You define state, actions, navigation, and validation in Java.
2. Mateu exposes that as a small, generic API.
3. A renderer (Vaadin, Red Hat, SAPUI5, Redwood…) turns it into a real UI.

The frontend and backend are fully decoupled. You can swap the renderer without changing your application code.

---

## Built for distributed systems

Mateu is **stateless by design**. Every request is self-contained, which makes it a natural fit for microservices, horizontal scaling, and Kubernetes deployments.

Each service can own its own UI and menu tree. A shell composes them into one application. No frontend integration layer needed.

---

## Why not Vaadin?

Vaadin is excellent — Mateu even uses its design system. But Mateu takes a different approach:

| | Vaadin | Mateu |
|---|---|---|
| Architecture | Stateful | Stateless |
| Focus | UI components | Full application model |
| Microfrontend support | Indirect | First-class |
| Design system | Vaadin only | Pluggable (Vaadin, Red Hat, SAPUI5, Redwood…) |
| Multi-language | Java only | Java, Kotlin, C#, Python |

---

## Open source

Mateu is open source and available on [GitHub](https://github.com/miguelperezcolom/mateu).

[GitHub repo](https://github.com/miguelperezcolom/mateu) · [Documentation](https://mateu.io/java-user-manual/) · [Live demo](https://vaadin.mateu.io/fluent/use-cases/rra)
