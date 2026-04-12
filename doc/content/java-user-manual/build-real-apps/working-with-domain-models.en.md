---
title: "Working with domain models"
weight: 4
aliases:
  - /java-user-manual/working-with-domain/
---

# Working with domain models

Mateu is designed to work with **DDD and hexagonal architectures**.

## Separation

- Domain → business rules
- Application → use cases
- Mateu → UI layer

## Recommended flow

UI → Use case → Domain → Repository

## Mental model

Mateu sits on top of your backend.

It does not replace it.
