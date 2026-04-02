---
title: "API"
weight: 12
---

# The Mateu API

Mateu exposes your UI through a small, generic API — not a hand-built application-specific one.

The goal is to let any renderer talk to any Mateu backend through a shared protocol, without either side knowing anything specific about the other.

## Why a generic API matters

In a traditional setup, you design a custom REST API for every screen: endpoints for fetching data, endpoints for submitting forms, endpoints for triggering actions. This is repeated for every feature.

Mateu replaces all of that with a single protocol. The renderer knows how to talk to any Mateu backend. Your backend doesn't need to expose screen-specific endpoints.

## What the API covers

- fetching the component tree for a given route
- submitting field values
- triggering actions
- navigating between routes
- handling server-side responses (messages, redirects, UI updates)

## Explore the spec

The full OpenAPI spec is available here:

👉 [Mateu API on Swagger Editor](https://editor.swagger.io/?url=https://mateu.io/openapi/mateu.yaml)

## Implications

Because the API is generic and stable:

- **You can build custom renderers** for any design system or platform
- **Renderers are swappable** without changing backend code
- **Native apps** can use the same backend — see [Native](../../native/)
- **AI agents** can drive Mateu UIs through the same protocol — see [AI](../../ai/)
