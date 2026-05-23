---
title: "Use cases"
---

Each use case is a complete, working example that shows one real-world pattern from start to finish.

Read them in order to build up from basic CRUD to distributed and embedded scenarios, or jump to the one closest to your situation.

---

## CRUD and listings

- [Admin panel](/java-user-manual/use-cases/admin-panel/) — full CRUD from a Java model; status badges, nested collections, column actions, toolbar buttons
- [Users CRUD with lookups](/java-user-manual/use-cases/users-crud/) — Spring injection, `@Lookup` fields, checkbox stereotype, custom editor page
- [Custom listing](/java-user-manual/use-cases/custom-listing/) — `Listing<Filters, Row>`, toolbar actions, JWT extraction, auto-load trigger
- [Nested CRUD](/java-user-manual/use-cases/nested-crud/) — hierarchical data, `@DetailFormCustomisation`, modal editors

## Architecture and integration

- [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/) — one UI composed from multiple microservices, each owning its own UI module
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/) — drop Mateu into React, Vue, or plain HTML without replacing your existing frontend

---

## Choosing a starting point

| You want to... | Start with |
|---|---|
| Build a basic CRUD from a Java model | [Admin panel](/java-user-manual/use-cases/admin-panel/) |
| Add a lookup field or custom editor | [Users CRUD](/java-user-manual/use-cases/users-crud/) |
| Query a custom data source | [Custom listing](/java-user-manual/use-cases/custom-listing/) |
| Manage hierarchical / parent-child data | [Nested CRUD](/java-user-manual/use-cases/nested-crud/) |
| Compose UI from multiple services | [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/) |
| Add Mateu to an existing frontend | [Embedded UI](/java-user-manual/use-cases/embedded-ui/) |

---

## Next

- [Admin panel](/java-user-manual/use-cases/admin-panel/)
- [Fluent components](/java-user-manual/concepts/fluent-components/)
- [Build guides](/java-user-manual/build/)
