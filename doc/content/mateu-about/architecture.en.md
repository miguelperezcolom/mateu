---
title: "Architecture"
weight: 1
---

# Architecture

Mateu is intentionally simple at a high level:

1. backend code defines the UI
2. Mateu exposes that through a small API
3. a renderer turns it into a real browser UI

That separation makes Mateu a strong fit for:

- microservices
- stateless systems
- distributed UIs
- pluggable renderers

## Real-world architecture

Mateu also fits naturally in hexagonal systems, where the UI is just another inbound adapter.

- [Mateu in hexagonal architecture](/java-user-manual/real-world/mateu-in-hexagonal-architecture/)
- [Distributed control plane case study](/java-user-manual/real-world/distributed-control-plane/)
