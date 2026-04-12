---
title: "When to use Mateu"
weight: 2
---

# When to use Mateu

Mateu is designed for **business applications**, not marketing sites.

It shines when your UI is:

- data-driven
- CRUD-heavy
- tightly coupled to backend logic

---

## Ideal use cases

### Backoffice / admin panels

- user management
- permissions
- configuration screens
- internal tools

👉 If your UI is mostly forms and tables, Mateu is a very strong fit.

---

### Distributed backoffices (microservices)

- multiple teams
- bounded contexts
- independent services

Each service can define its own UI, and Mateu composes everything into a single application.

👉 This is one of Mateu’s biggest advantages.

---

### Embedded business modules

- existing React / Vue apps
- gradual adoption
- hybrid architectures

Mateu can be embedded as a web component:

```html
<mateu-ui baseUrl="https://your-backend"></mateu-ui>
```

👉 No need to rewrite your frontend.

---

## When Mateu is NOT a good fit

Mateu is not designed for:

- marketing websites
- highly custom visual experiences
- pixel-perfect design systems
- frontend-heavy products (for example design tools or dashboards with very complex charts)

In those cases, a traditional frontend stack is usually a better choice.

---

## Mental model

Use Mateu when:

> the UI is a projection of your backend model

Avoid Mateu when:

> the UI is the product itself

---

## Summary

Mateu is a great choice for:

- internal tools
- admin panels
- enterprise backoffices
- backend-driven UIs

---

## Next

- [Quickstart](/java-user-manual/start-here/quickstart/)
- [Admin panel](/java-user-manual/use-cases/admin-panel/)
- [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/)
