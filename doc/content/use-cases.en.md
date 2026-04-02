---
title: "Use cases"
weight: 50
---

# Use cases

Mateu is especially powerful for a specific type of applications.

If you're building any of the following, Mateu can dramatically reduce complexity.

---

## Internal tools

Build admin panels, dashboards, and back-office tools without a frontend team.

### Typical features

- forms
- tables
- filters
- actions
- workflows

### Why Mateu fits

- no frontend duplication
- fast iteration
- simple architecture

---

## CRUD applications

Mateu shines in data-heavy applications.

### Example

```java
@UI("")
public class Users {

  List<User> users = userService.findAll();

  @Button
  Runnable create = () -> {};

}
```

Mateu generates:

- tables
- forms
- actions

---

## Enterprise apps

Large business applications often suffer from:

- duplicated models
- frontend/backend sync issues
- complex architectures

Mateu simplifies this by:

- defining UI in one place
- removing API glue
- reducing moving parts

---

## Microservice UIs

Mateu is stateless and works naturally with distributed systems.

You can:

- expose UIs from multiple services
- compose them in a single frontend
- scale independently

---

## Embedded UIs

Mateu UIs can be embedded anywhere as web components.

Use cases:

- integrate into existing apps
- expose specific forms
- build modular UIs

---

## When NOT to use Mateu

Mateu is not ideal for:

- highly custom visual experiences
- marketing websites
- animation-heavy UIs

---

## Summary

Mateu works best when:

- UI is driven by data and actions
- speed matters more than pixel-perfect design
- you want fewer moving parts

---

👉 Try the live demo: https://vaadin.mateu.io/fluent/use-cases/rra
