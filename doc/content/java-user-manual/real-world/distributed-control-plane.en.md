---
title: "Case study: Distributed control plane (SSR → SSG)"
weight: 1
---

# Distributed control plane (SSR → SSG)

This project demonstrates Mateu in a **real distributed architecture**:

- multiple microservices
- UI owned by each service
- stateless backend
- DTO-driven UI
- workflows + forms integration

---

## Architecture

```
[ Browser ]
     ↓
[ Mateu Renderer ]
     ↓
[ Mateu API ]
     ↓
-------------------------
| Microservices layer   |
|                       |
| Content Service       |
| Control Plane         |
| Static Server         |
| EventConductor        |
-------------------------
```

---

## Core idea

> Mateu is a **UI orchestration layer for distributed systems**

---

# 1. Service-owned UI

Each service exposes its own UI:

```java
@UI("/_content-service")
public class ContentServiceHome {}
```

Each module defines:

- menu
- routes
- orchestrators

👉 No shared frontend needed

---

# 2. UI composition (shell)

A shell aggregates UIs:

```
[ Shell ]
   ├── Content Service UI
   ├── Control Plane UI
   └── Other modules
```

👉 Federated backoffice

---

# 3. DTO → Row → UI

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

Flow:

```
DTO → Row → Component → UI
```

👉 UI model is explicit

---

# 4. Actions as contracts

```java
new ColumnAction("compare", "Compare")
```

Flow:

```
User click → actionId → backend → use case
```

👉 No logic in frontend

---

# 5. Query services

```
[ UI ] → [ Query Service ] → [ Database / API ]
```

- no entity leakage
- no ORM dependency
- pure read models

---

# 6. Lookups across services

```java
@Lookup(search = LabelOptionsSupplier.class, label = LabelLabelSupplier.class)
```

```
UI → Supplier → Query Service → Results
```

---

# 7. Workflows + forms

```
UI → Workflow Engine → Form → User Input → Execution
```

Mateu:

- triggers workflows
- renders forms
- handles results

---

# 8. Stateless model

Each request:

1. instantiate view model
2. hydrate state
3. execute action
4. return UI diff

👉 No server session

---

# 9. Why this architecture matters

- independent deployments
- scalable
- no frontend duplication
- backend-owned UI

---

# 10. Final insight

> Mateu lets backend teams build complete distributed UIs  
> without owning a frontend stack
