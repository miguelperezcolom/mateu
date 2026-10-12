---
title: "Serve & deploy"
description: "Serve a Mateu UI from a backend in Java, .NET or Python, or ship it as a static bundle with no backend — plus guides for Netlify, Kubernetes and the app stores."
---

How a Mateu UI reaches its users is independent of how it was authored. There are two shapes, and
an app can use both.

## Served by a backend

A server hosts the Mateu endpoints (`/mateu/v3/…`) and the renderer's static assets. Each request
instantiates the view model, runs the action and answers with the wire model; nothing is kept in
memory between requests, so the server scales horizontally without sticky sessions.

Choose a backend when screens need **server-side logic**: database access, domain rules, secrets
injected into proxied API calls, server-side validation.

| Runtime | Setup |
|---|---|
| Spring Boot MVC | [Spring Boot MVC](/java-create-your-project/springboot-mvc/) |
| Spring Boot WebFlux | [Spring Boot WebFlux](/java-create-your-project/springboot-webflux/) |
| Quarkus | [Quarkus](/java-create-your-project/quarkus/) |
| Micronaut | [Micronaut](/java-create-your-project/micronaut/) |
| Helidon MP | [Helidon](/java-create-your-project/helidon/) |
| ASP.NET Core | [C#](/csharp-user-manual/) |
| FastAPI | [Python](/python-user-manual/) |

A UI authored only in YAML is served by a backend too when you want one: the generated project is a
Spring Boot application whose only Java is its `main` method ([YAML quickstart](/define/yaml/quickstart/)).

## No backend: a static bundle

The model is exported at build time into plain files — `index.html`, a `manifest.json` with the
screens, and the renderer's assets — and served from any static host or CDN. The browser calls your
REST APIs directly, as named in the [data source catalogue](/concepts/data-sources/).

- [Static bundle](/deploy/static-bundle/) — exporting, what works without a backend, hybrid bundles.
- [A 100 % static UI](/deploy/static-ui/) — authoring for it, the static-safety check, hosting,
  auth.
- [Environments](/deploy/environments/) — one catalogue, re-pointed per deployment, even after the
  bundle is built.

## Before production

- [Production checklist](/deploy/production-checklist/) — packaging, reverse proxies, auth,
  stateless view models, CSP, CORS.
- [The OpenAPI your UI implies](/java-user-manual/build/derived-openapi/) — the API contract your
  screens assume, derived from them.

## Guides

- [Netlify](/deploy/netlify/) — a static bundle (or any static site) deployed by hand or from CI.
- [Kubernetes on Hetzner with Cloudfleet](/deploy/kubernetes-hetzner-cloudfleet/) — a containerised
  backend behind ingress-nginx with Let's Encrypt certificates, the way the project's public demos
  run.
- [App Store and Google Play](/deploy/mobile-app-stores/) — making your UI available in the Mateu
  mobile app, or publishing your own branded app.
- [Standalone desktop app](/mateu-about/standalone-desktop/).

## Composing several UIs

Several deployed UIs — on different stacks, owned by different teams — can be composed into one
console. See [UI federation](/mateu-about/ui-federation/).
