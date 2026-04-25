---
title: "Case study: SSR to SSG control plane"
weight: 1
---

# SSR to SSG control plane

This project shows Mateu used in a real distributed system.

Key characteristics:

- multiple microservices
- UI owned by each service
- query services returning DTOs
- UI models (rows) built explicitly
- stateless backend

---

## Architecture

- control plane (admin UI)
- content service
- static server
- shell (aggregates UIs)
- workflow/forms engine (eventconductor)

---

## Key idea

> Each service owns its UI.

Mateu composes them into a unified application.
