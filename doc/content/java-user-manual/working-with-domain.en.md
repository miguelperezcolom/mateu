---
title: "Working with domain models"
weight: 21
---

# Working with domain models

Mateu is designed to work with **DDD and hexagonal architectures**.

---

## Separation

- Domain → business rules
- Application → use cases
- Mateu → UI layer

---

## Recommended flow

UI → Use case → Domain → Repository

---

## ViewModel vs Domain

- ViewModel → UI representation
- Domain → business logic

They are not the same.

---

## Mapping

You usually map:

- DTO → ViewModel
- ViewModel → Command

---

## Mental model

Mateu sits on top of your backend.

It does not replace it.
