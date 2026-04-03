---
title: "CRUD patterns"
weight: 20
---

# CRUD patterns

This page defines the **default way** to build CRUD applications in Mateu.

## The Mateu CRUD pattern

A typical CRUD module consists of:

1. ViewModel
2. CRUD Adapter
3. CRUD Orchestrator

---

## 1. ViewModel

Defines:

- fields (state)
- validation
- relationships
- actions

```java
public class UserViewModel {

  String name;

  @Email
  String email;

}
```

---

## 2. Adapter

Connects UI to application layer.

- reads → query services
- writes → use cases

---

## 3. Orchestrator

Exposes CRUD as a module in the UI.

---

## Mental model

- ViewModel → UI definition
- Adapter → integration
- Orchestrator → exposure

---

## Golden rule

Do not mix:

- domain logic
- UI definition

Keep them separate.
