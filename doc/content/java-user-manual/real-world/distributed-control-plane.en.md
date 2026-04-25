---
title: "Case study: Distributed control plane (SSR → SSG)"
weight: 1
---

# Distributed control plane (SSR → SSG)

This project demonstrates Mateu in a **real production-like architecture**:

- multiple microservices
- UI owned by each service
- stateless backend
- DTO-driven UI
- workflows + forms integration

---

## Architecture at a glance

- Control plane → admin UI
- Content service → domain logic
- Static server → SSG output
- Shell → UI composition
- EventConductor → workflows + forms

---

## Core idea

> Mateu is not just a UI framework.  
> It is a **UI orchestration layer for distributed systems**.

---

# 1. Service-owned UI

Each service exposes its own UI:

```java
@UI("/_content-service")
```

And defines:

- its own menu
- its own routes
- its own orchestrators

👉 No shared frontend needed.

---

# 2. UI composition (shell)

A shell aggregates multiple UIs:

- each module contributes menus
- navigation is composed dynamically

👉 This enables **federated backoffices**

---

# 3. DTOs, not entities

UI is built from DTOs:

```java
new ChangeRow(
    dto.pageId(),
    dto.page(),
    dto.country(),
    dto.language(),
    new Status(...),
    new ColumnAction("compare", "Compare")
)
```

👉 Domain model stays isolated.

---

# 4. Rows as UI models

Rows are explicitly designed:

- include formatted fields
- include status
- include actions

```java
ColumnAction("compare", "Compare")
```

👉 Actions are **contracts**, not logic.

---

# 5. Query services

All UI data comes from query services:

- no JPA in UI layer
- no entity leakage
- pure read models

👉 This aligns with CQRS patterns.

---

# 6. Lookups

```java
@Lookup(search = LabelOptionsSupplier.class, label = LabelLabelSupplier.class)
```

Backed by:

- query services
- remote APIs if needed

👉 Works across services.

---

# 7. Workflows + forms

EventConductor provides:

- workflow engine
- forms engine

Mateu UI:

- triggers workflows
- renders forms
- orchestrates execution

👉 UI becomes a control plane.

---

# 8. Stateless by design

Mateu:

- does not keep UI state on server
- rebuilds state per request

👉 Perfect for:

- Kubernetes
- autoscaling
- ephemeral pods

---

# 9. Why this matters

This architecture enables:

- independent teams
- independent deployments
- consistent UI model
- minimal frontend complexity

---

# 10. Key takeaway

> Mateu lets backend teams build complete, distributed UIs  
> without owning a frontend stack.
