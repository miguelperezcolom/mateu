---
title: "Portability and exit strategy"
description: "What you own, how to self-host, and how to leave — the guarantees that make a Mateu UI a portable asset rather than a bet on one vendor."
---

Adopting a UI framework is a long-term commitment, so the honest question a serious team asks is not
"how good is it today" but **"what happens if the project is abandoned, and how do we leave?"** This
page answers that directly. It is a first-class guarantee, not an afterthought.

The short version: **your UI is a declarative definition — data you own and keep in your own
repository — served by an open-source (Apache 2.0) runtime you can self-host indefinitely.** There is
no proprietary project store to be locked out of, and there are three concrete exit routes.

## What you actually own

- **The definition.** Your screens are `@UI` classes (Java/C#/Python) and/or YAML (`routes.yaml`,
  `sources.yaml`, layout definitions) living in **your** version control. There is nothing to
  "export" from a vendor cloud — the source of truth is already yours.
- **The wire.** At runtime the backend emits a documented JSON model (`UIIncrementDto` and friends)
  with a generated JSON Schema of its own (`wire-schema.json`), and the authoring surface has
  published JSON Schemas too (component catalog, routes, sources, the unified specs schema) — all
  served from `backend/shared/uidl/*.json` on `master` (see the
  [wire specification](/reference/wire-specification/#the-machine-readable-schemas)). Four independent renderers already
  consume the same wire, and three backends (Java, .NET, Python) emit it — so "any server serves any
  renderer" is demonstrated, not asserted.
- **The runtime.** Mateu is **Apache 2.0** — a permissive license with an explicit patent grant. You
  can run it, fork it, patch it and self-host it forever, with no license fee and no vendor runtime.

## The license guarantee (the backstop)

Portability of the *definition* is moot if the *runtime* cannot be legally self-hosted after an
abandonment. Mateu is licensed **Apache License 2.0** (`LICENSE.txt` at the repository root). That is
a deliberate choice for corporate adoption:

- **Permissive** — no copyleft obligations on what you build on top.
- **Explicit patent grant** — the clause corporate legal and procurement look for.
- **Self-hostable in perpetuity** — freeze a version, keep an internal buildable fork, own your build.

This is not source-available or "open core": there is no revenue/seat threshold that flips it to a
paid license. The whole runtime is under Apache 2.0.

## Three ways out

If you ever need to leave Mateu, you have three routes, in increasing order of effort:

### 1. Self-host the open-source runtime (the default backstop)
Because the runtime is Apache 2.0 and lives in your build, "the vendor disappeared" does not stop you:

- **Pin the version** you are on; keep an internal, buildable fork with its own CI.
- **Own the build** — the app is a normal Spring Boot / Quarkus / Micronaut / Helidon / ASP.NET /
  FastAPI service (see the per-framework guides under *Create your project*, and the demo
  `Dockerfile`s for containerization). Nothing about deployment depends on an upstream service.
- Continuity is then **independent of upstream** — you are running your own code.

### 2. Ship the static bundle (no backend at all)
For screens that are pre-renderable, `mvn -Pbundle package` (or `GET /mateu/v3/bundle`, once `mateu.bundle.endpoint.enabled=true`) produces a
static SPA (`index.html` + `manifest.json` + assets) that a CDN serves **with no Mateu backend**. See
[Static bundle](/deploy/static-bundle/). This subset of your UI outlives the runtime
today. (Its limits: no server-side behaviour/secrets, and it depends on any external APIs being
reachable from the client — see that page.)

### 3. Render the definition with another engine
The wire model is documented and bounded, and the renderer surface is measured by a **conformance
harness** (`e2e/conformance.*` against a shared set of fixtures) with three levels — **Core**,
**Standard**, **Full**. The [renderer contract](/design-systems/renderer-contract/) states exactly
what a renderer must do. So building a **Core-level** renderer for your frozen wire version is a
bounded engineering task, not a rewrite of your application. (Full parity is a real project — Mateu
itself has retired renderers — but Core is what "keep the lights on" requires.)

## Honest limits

We would rather you read this than discover it:

- **The value split.** The definition is declarative *intent*; the *behaviour* (layout inference,
  CRUD orchestration, filter/state semantics) is produced by the Mateu runtime. Migrating the
  definition to another engine means re-implementing those **derivation semantics**, which today live
  mostly in code and docs rather than in one formal spec. The static bundle sidesteps this for
  pre-renderable screens; anything with server logic does not travel as data alone.
- **Not a multi-vendor standard.** The wire is documented, schema-backed and versioned
  (`wireVersion` `3.0` on every response, additive within a major — see the
  [wire specification](/reference/wire-specification/)), but it has one producer family and it
  evolves. It is re-implementable against a **pinned wire version** — "freeze this wire version" is
  the supported procedure — but no other vendor implements it.
- **Skills, not just files.** The definition has no vendor lock on the *files*, but the derivation
  runtime and the Mateu-specific skills are, today, effectively single-vendor. This is a materially
  better position than any proprietary low-code platform (which traps the app in its runtime), and a
  *different* trade-off than hand-built React (portable skills, but framework-coupled code and a
  hand-written API-for-the-UI). Choose with that framing, not on a slogan.

## Self-host runbook (pointers)

A Mateu app is an ordinary backend service; deploy it the way you deploy any of these:

- **Per-framework setup:** *Create your project* → Spring Boot MVC / WebFlux · Quarkus · Micronaut ·
  Helidon MP (annotation-processor wiring included), plus .NET and Python guides.
- **Containerization:** the `demo/demo-vaadin-*` modules ship multi-stage `Dockerfile`s (Maven build
  → runnable JAR → JDK 21 runtime) you can copy.
- **Backend-free:** [Static bundle](/deploy/static-bundle/) for CDN deployment.

## Making portability verifiable, not theoretical

What turns this page's guarantees from "true in principle" into "verifiable":

1. **A versioned wire** — every envelope carries `wireVersion`, with an additive-within-a-major
   compatibility policy ([wire specification](/reference/wire-specification/#status-and-versioning)).
2. **The wire + derivation semantics as one versioned spec** — the
   [wire specification](/reference/wire-specification/), with its generated JSON Schemas and the
   conformance corpus.
3. **A minimal Core reference renderer** — the dependency-free
   [reference renderer](/design-systems/reference-renderer/) the conformance harness measures.
