---
title: "Configuration properties"
description: "The application properties every Mateu adapter understands: CORS, MCP, client error log, asset caching and debug."
---

Every Java adapter — Spring MVC, Spring WebFlux, Micronaut, Quarkus and Helidon MP — reads the same
properties, from wherever the framework reads its configuration (`application.properties`/`.yml`,
`microprofile-config.properties`, environment variables…). The behaviour behind each one is
implemented once, in Mateu's core, so it is the same on every adapter.

| Property | Default | What it does |
|---|---|---|
| `mateu.cors.allowed-origins` | *(empty: no CORS)* | Comma-separated origins allowed to call Mateu's endpoints from another origin. `*` = any origin; `https://*.example.com` patterns are accepted. |
| `mateu.cors.allow-credentials` | `false` | Adds `Access-Control-Allow-Credentials: true` for the listed origins. Never combined with `*`. |
| `mateu.mcp.enabled` | `false` | Serves the native [MCP endpoint](/reference/agent-operability/) at `POST /mateu/mcp`. |
| `mateu.client-log.enabled` | `true` | Accepts the renderers' error reports at `POST <baseUrl>/mateu/v3/client-log` ([client error log](/ux-patterns/client-error-log/)). |
| `mateu.static-assets.caching` | `true` | Caches Mateu's frontend assets: `/version_<n>/…` immutable for a year, `/assets/…` revalidated (`no-cache`). |
| `mateu.debug` | `false` | Starts the renderer in debug mode (`<mateu-ui debug="true">`). |

## Cross-origin access (CORS)

A Mateu UI is normally served by the same origin as its API, and then the browser never asks for
CORS. You only need it when the renderer runs **somewhere else**: a Visual Builder app served by
`vb-serve` or VB Studio, a static bundle on a CDN, a dev server on another port.

```properties
mateu.cors.allowed-origins=https://ui.example.com,http://localhost:9006
```

The allow-list applies to Mateu's own endpoints only — every path under a `/mateu/` segment
(`<baseUrl>/mateu/v3/**`, `/mateu/mcp`) — never to the application's own controllers. A preflight
from a listed origin is answered by Mateu before your security layer (so Spring Security, for one,
needs no extra CORS configuration for it); a request from any other origin gets no CORS headers, so
the browser refuses it.

:::caution[Breaking change]
Up to `v3.0-alpha.406` the generated controllers carried a bare `@CrossOrigin` on Spring MVC and
WebFlux (and on Micronaut, with credentials), so **every Mateu app could be called from any web
page**. CORS is now off unless you list the origins. If a renderer hosted on another origin stops
working after the upgrade, add it to `mateu.cors.allowed-origins`.
:::

On Micronaut, keep in mind its own drive-by-localhost protection: a server running on `localhost`
refuses requests from a non-localhost origin before any application filter sees them, unless
`micronaut.server.cors.localhost-pass-through=true`.

## MCP endpoint

`POST /mateu/mcp` lets an agent discover and operate the screens of the app (see
[Agent operability](/reference/agent-operability/)). It is **off by default** — it gives any caller
holding a valid token a programmatic way to drive every screen, which an application has to decide
to expose:

```properties
mateu.mcp.enabled=true
```

Permissions are still enforced per request over the caller's token, exactly as on the UI endpoints.
