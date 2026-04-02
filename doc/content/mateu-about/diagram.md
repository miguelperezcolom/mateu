---
title: "Architecture diagram"
weight: 13
---

# Architecture diagram

```
flowchart LR
    A[Java classes\nfields · annotations · actions] --> B[Mateu model]
    B --> C[Simple API]
    C --> D[Frontend renderer]

    E[Service A UI] --> F[Shell]
    G[Service B UI] --> F
    H[Service C UI] --> F

    F --> D
```

## Reading the diagram

**Left side (single service):**

1. You write Java classes with fields, annotations, and action methods
2. Mateu translates that into an internal UI model
3. The model is exposed through a simple, generic API
4. A frontend renderer consumes the API and produces a real UI

**Right side (multi-service composition):**

Multiple services each expose their own UI through the Mateu API. A shell application collects their menu trees and composes them into one unified navigation surface. The same renderer handles everything.

## Why this matters

This diagram explains why Mateu fits so naturally with microservices:

- each service is self-contained — it owns its domain and its UI
- services are independently deployed — no frontend rebuild required
- the shell is thin — it composes, it doesn't own
- the renderer is stateless and reusable — it's a static site that talks to any Mateu backend

See [Architecture →](../architecture) for a full explanation of each layer.
