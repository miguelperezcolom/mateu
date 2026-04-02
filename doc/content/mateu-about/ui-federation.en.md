---
title: "UI federation"
weight: 22
---

# UI federation

Mateu allows you to compose UIs from multiple backend services.

## The idea

Instead of a single frontend aggregating everything, each service can expose its own UI — and those UIs can be composed together.

## Example

A service can integrate UI exposed by another service.

```java
@MicroFrontend("/orders")
Object orders;
```

## What this enables

- UI owned by each service
- independent deployment
- no central frontend bottleneck

## Compared to traditional micro frontends

Traditional micro frontend architectures usually require:

- a frontend application shell
- a micro frontend integration framework
- explicit client-side composition

With Mateu:

- the backend defines the UI
- the UI is exposed as a service
- composition happens without a separate frontend application layer

## Why this matters

This aligns naturally with microservices:

- service owns data
- service owns logic
- service owns UI

## One sentence

UI federation without a frontend application.
