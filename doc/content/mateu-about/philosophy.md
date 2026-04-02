---
title: "Philosophy"
weight: 1
---

# Philosophy

Modern web development has a coordination problem.

A simple business application ends up split across:

- a backend with models, services, and validation
- a frontend with its own models, routes, and validation
- an API layer that glues them together
- duplicated logic that drifts out of sync over time

That split exists for good reasons in consumer-facing products with complex, custom UIs. But for internal tools, portals, and enterprise workflows, it creates accidental complexity that slows teams down without adding real value.

## Mateu's approach

Instead of defining your application twice, you define it once — as a backend model — and let Mateu render the UI from that.

This means:

- no separate frontend implementation to maintain
- no duplicated validation or routing
- no synchronization bugs between layers
- no frontend expertise required for backend developers

## What Mateu is not trying to do

Mateu is not a replacement for every frontend use case.

A consumer-facing product with a highly custom design, complex animations, or unique interaction patterns still needs a purpose-built frontend. Mateu does not try to solve that problem.

What Mateu does solve is the large class of applications where the UI is primarily a projection of the backend model: CRUD screens, admin panels, internal portals, enterprise workflows, data management tools.

For those, the traditional stack adds overhead without benefit.

## In one line

Less code. Fewer moving parts. Same outcome.
