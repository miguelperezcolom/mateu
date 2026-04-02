---
title: "Architecture diagram"
weight: 6
---

# Architecture diagram

This is the shortest way to understand Mateu.

```mermaid
flowchart LR
    A[Java classes, fields, annotations, actions] --> B[Mateu model]
    B --> C[Simple API]
    C --> D[Frontend renderer]

    E[Service A UI] --> F[Shell]
    G[Service B UI] --> F
    H[Service C UI] --> F

    F --> D
```

## Read it like this

- your backend code defines the UI model
- Mateu exposes that model through a simple API
- a renderer turns it into a real UI
- multiple services can contribute UI modules to one shell

## Why it matters

This is why Mateu fits so naturally with:

- microservices
- distributed systems
- stateless architectures
- internal tools and business apps
