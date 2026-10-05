---
title: Client errors in the server log
description: The errors a renderer shows or hits are posted to the backend and written as one structured log line each, so they can be found later.
---

**Status:** ✅ Implemented (Vaadin and Redwood renderers; Spring MVC and WebFlux backends)

## Intent

The user saw «Your session is no longer valid» — and nothing on the server says so. When the request
never reached the app (a gateway rejected it, the network dropped it) or the failure was the browser's
own (an uncaught exception), the error only ever existed on one screen. You cannot debug what you
cannot find.

## Solution

Both renderers report the errors they hit or show to `POST <baseUrl>/mateu/v3/client-log`, on the
same origin and with the same `Authorization: Bearer …` header as every other `/mateu/v3` call — so a
gateway routes and authenticates it like the rest. The backend writes **one line per report** on the
logger `mateu.client`, at `WARN`:

```text
WARN  mateu.client : client-error {"level":"error","kind":"unauthorized","renderer":"redwood","message":"Tu sesión ya no es válida. Vuelve a iniciar sesión.","detail":"Mateu → HTTP 401","url":"/mateu/v3/sync/bookings","route":"/bookings","actionId":"save","pageUrl":"https://app.example.com/bookings","firstAt":"2026-10-05T14:02:11.120Z","lastAt":"2026-10-05T14:02:11.120Z","userAgent":"Mozilla/5.0 …","status":401,"count":1,"user":"ana"}
```

Nothing to configure: it is on by default. Turn it off with `mateu.client-log.enabled=false` (the
endpoint then answers 404 and the renderers stop reporting for that page). The logger is a normal
SLF4J logger, so `logging.level.mateu.client=OFF` silences the lines without touching the endpoint.

### What is reported

| Source | `kind` |
|---|---|
| A request failure the user is shown (the error toast / band) | `offline`, `timeout`, `server`, `unauthorized`, `forbidden`, `notFound`, `client`, `unknown` |
| An uncaught error (`window` `error`) | `js-error` |
| An unhandled promise rejection | `unhandled-rejection` |
| The request-loop circuit breaker tripping (Vaadin) | `request-loop` |

Never reported: `cancelled` (an abort is our own decision), failures of the report call itself (no
loops), `ResizeObserver loop` noise.

### Fields

`level`, `kind`, `renderer` (`vaadin` / `redwood`), `message` (what the user saw, ≤ 1000 chars),
`detail` (the underlying error text), `status`, `url` (the failed request), `route`, `actionId`,
`pageUrl`, `source` (file:line:col of a JS error), `traceparent` (when the request carried one),
`firstAt` / `lastAt` / `count`, `dropped`, `userAgent`, `stack` (≤ 4000 chars), and `user` — the
authenticated principal's name, added by the server. URLs lose their `#fragment`, and query values
such as `code`, `state` and `access_token` are masked as `***`.

### Volume control

- **De-duplication.** The same error (kind, status, message, url, action, first stack line) within a
  minute is one line: the first occurrence is sent after ~2 s; repeats are summed into one more line
  (`count`, `firstAt`, `lastAt`) when the minute closes or the page is hidden.
- **Rate limit.** At most 20 lines a minute per page; lines over the limit are counted in the next
  line's `dropped`.
- **Batching.** Lines go out as a JSON array, kept under the server's 16 KB body limit (413 above it).
- **Transport.** `fetch` with `keepalive` and the Bearer token. `sendBeacon` cannot carry headers, so
  it is only the last resort on `pagehide` when there is no token.

## Finding them in Loki

Each pod's stdout carries the lines, so with Alloy/Promtail shipping container logs:

```logql
{namespace="<ns>"} |= "client-error"
```

Narrow it down by parsing the JSON after the prefix:

```logql
{namespace="<ns>"} |= "client-error" | regexp `client-error (?P<report>\{.*\})` | line_format "{{.report}}" | json | kind="unauthorized"
```

## Backends

The endpoint is a servlet filter (Spring MVC) / `WebFilter` (WebFlux) on any path ending in
`/mateu/v3/client-log`, ordered after Spring Security's chain, so it is secured like the other
Mateu calls. Quarkus, Micronaut and Helidon do not expose it yet: there the report lands on the
generic `/mateu/v3/**` controller, and the renderers read its answer (a 404, a 400, a non-204 2xx, a
500) as "no endpoint here" and stop reporting for the page.

## Related

- [Session expiry](/ux-patterns/session-expiry/) — the 401 handling whose failures this makes visible
- [Slow connections](/ux-patterns/slow-connections/) — how failures are classified
