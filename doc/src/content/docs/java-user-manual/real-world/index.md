---
title: "Real-world"
---

These pages show how Mateu fits into production architectures. They assume you already understand the core model — ViewModels, actions, listings, and menus.

## Topics

- [Mateu in hexagonal architecture](/java-user-manual/real-world/mateu-in-hexagonal-architecture/) — where Mateu sits in a DDD/hexagonal system and how it works with CQRS
- [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) — each microservice owns its own UI; a shell aggregates them
- [Distributed control plane](/java-user-manual/real-world/distributed-control-plane/) — case study: a multi-service backoffice with federated UI
- [Query services and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/) — how to build listing rows from query results without exposing domain entities
- [Lookups backed by query services](/java-user-manual/real-world/lookups-backed-by-query-services/) — decouple `@Lookup` fields from repositories using supplier beans
- [Workflow and forms integration](/java-user-manual/real-world/workflow-and-forms-integration/) — use Mateu as the UI layer for multi-step workflow processes
- [SSR to SSG case study](/java-user-manual/real-world/real-world-ssr-to-ssg/) — a content publishing pipeline built with Mateu

## Suggested reading order

Start with [Mateu in hexagonal architecture](/java-user-manual/real-world/mateu-in-hexagonal-architecture/) to understand the positioning. Then read [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) and [Query services and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/) — these two patterns appear in almost every production Mateu system.

## Related

- [Advanced topics](/java-user-manual/advanced/) — security, testing, extensibility
- [Concepts](/java-user-manual/concepts/) — core model reference
