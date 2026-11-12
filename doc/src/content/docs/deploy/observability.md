---
title: "Observability: traces, metrics and an audit trail"
description: "Every Mateu request as an OpenTelemetry span with metrics — through the OpenTelemetry API only, a no-op when your app has none — and an audit hook that tells your code who did what, on which records and how it ended."
---

Mateu observes every request it serves (`POST …/mateu/v3/sync/{route}` and `…/mateu/v3/sse/{route}`)
in two independent ways:

- **Traces and metrics** through **OpenTelemetry** — the API only. Mateu ships no SDK and no
  exporter: your application (or the OpenTelemetry Java agent) provides them, and decides where the
  data goes. Without them nothing is recorded and nothing costs anything.
- **An audit hook** — an interface your application implements. Mateu says what happened; where the
  trail is kept is yours (Mateu ships UI only).

Java, .NET and Python emit the same span names, attributes and metrics.

## Turn tracing on

### Java — with the OpenTelemetry Java agent

The agent instruments the HTTP server and clients and installs the global `OpenTelemetry` that
Mateu uses. Mateu declares `io.opentelemetry:opentelemetry-api` as an **optional** dependency, so add
it to your app (the agent bridges the API your app has on its classpath):

```xml
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-api</artifactId>
</dependency>
```

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=backoffice \
     -Dotel.exporter.otlp.endpoint=http://collector:4317 \
     -jar app.jar
```

The agent's server span becomes the parent of Mateu's span; the REST calls a proxied source makes
nest under Mateu's child span.

### Java — Spring Boot

Spring Boot's OpenTelemetry support (for example `spring-boot-starter-opentelemetry`, or the
Micrometer tracing bridge `micrometer-tracing-bridge-otel` with an OTLP exporter) declares an
`OpenTelemetry` bean. Mateu uses that bean when there is one, and `GlobalOpenTelemetry` otherwise.

### Java — Quarkus, Micronaut, Helidon

`quarkus-opentelemetry` produces an `OpenTelemetry` bean, and so do the OpenTelemetry modules of
Micronaut and Helidon MP: Mateu picks it up the same way. On Quarkus, metrics also need
`quarkus.otel.metrics.enabled=true`.

### .NET

Mateu uses the native .NET instruments: an `ActivitySource` and a `Meter` named **`Mateu`**
(`Mateu.Core.Observability.MateuTelemetry.Name`). With OpenTelemetry .NET:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddSource(MateuTelemetry.Name).AddOtlpExporter())
    .WithMetrics(m => m.AddMeter(MateuTelemetry.Name).AddOtlpExporter());
```

Any `ActivityListener` / `MeterListener` works too.

### Python

Install the API (`pip install "mateu-ui[otel]"`, i.e. `opentelemetry-api`) plus the SDK and exporter
you want, or run under `opentelemetry-instrument`. Mateu imports the API only when it is there.

### Switching it off

`mateu.telemetry.enabled=false` (Java: any Mateu setting source — `application.properties`, `-D`,
`MATEU_TELEMETRY_ENABLED`) and `MATEU_TELEMETRY_ENABLED=false` (Python) stop the spans and metrics
even with OpenTelemetry present. On .NET, simply do not listen to the `Mateu` source.

## What is recorded

### The request span

One span per request, named `mateu <action> <route template>` (`mateu save /products/:id/edit`,
`mateu __load__ /orders`). It is a child of the HTTP server span when your server is instrumented;
otherwise it is a server span that continues the caller's `traceparent`.

| Attribute | Value |
|---|---|
| `mateu.route` | the route as sent (`/products/42/edit`) |
| `mateu.route.template` | the route with id-like segments as `:id` (`/products/:id/edit`) |
| `mateu.action` | the action id; `__load__` for a load |
| `mateu.view` | the view class the request resolved to |
| `mateu.outcome` | `ok`, `user_error`, `forbidden`, `not_found` or `error` |
| `mateu.correlation_id` | the request's correlation id (`X-Mateu-Correlation-Id`, else the trace id) |
| `mateu.record.count` | how many records the action acted on, when the CRUD knows |
| `error.type` | the exception type, for `user_error` and `error` |
| `mateu.error.reference` | the reference the user was shown, for `error` |

An `error` outcome (a bug: the user saw "Something went wrong") sets the span status to ERROR; a
`user_error` (a `UserFacingException` or a validation message) does not — it is the application
answering. A streamed request (a `LongTask`) is one span until its last answer.

### Child spans

- **`mateu rest_proxy <METHOD>`** — each server-side call of a proxied REST source (`__restfetch__`,
  a proxied `restAction`): `http.request.method`, `url.template` (the source's url **template**
  without its query — never the resolved url, which may carry a `${secret.X}`), `mateu.rest_source`
  (the catalogue name) and `http.response.status_code`.
- **`mateu microfrontend <remote>`** — each micro frontend or content slot the host resolves on the
  server: `mateu.remote.id`, `url.full`, `mateu.content_slot`, `mateu.microfrontend.outcome`
  (`embedded`, `from_cache`, `timeout`, `error`, `empty`), `mateu.microfrontend.degraded_to` and the
  correlation id the remote received. A timeout or an error marks it ERROR.

### Metrics

| Instrument | Type | Attributes |
|---|---|---|
| `mateu.request.duration` | histogram, seconds | `mateu.route.template`, `mateu.action`, `mateu.outcome` |
| `mateu.request.errors` | counter | `mateu.route.template`, `mateu.action`, `error.type` |

Metric attributes are kept **low-cardinality** — each distinct value is a time series:

- never an id or a parameter value: routes are measured by their template;
- a refused (`forbidden`) or `not_found` request is measured as `_other` / `_other` — its route and
  action are whatever the caller sent, and must not mint series;
- at most 1000 (route, action) pairs per process; past that, new ones are `_other` too.

Spans carry the concrete route as well: a span is one event, not a series.

## The audit hook

Implement the listener and register it; it hears **every** request once it has ended.

```java
@Component
public class AuditTrail implements ActionAuditListener {   // io.mateu.uidl.audit

  record AuditRecord(String who, String view, String actionId, List<String> recordIds,
      ActionOutcome outcome, Instant at, String correlationId) {}

  private final BlockingQueue<AuditRecord> queue = new LinkedBlockingQueue<>(); // drained elsewhere

  @Override
  public void onAction(ActionAuditEvent event) {
    if (event.reservedAction() || event.actionId().isEmpty()) return; // plumbing and loads
    queue.offer(new AuditRecord(event.caller().name(), event.view(), event.actionId(),
        event.recordIds(), event.outcome(), event.at(), event.correlationId()));
  }
}
```

```csharp
builder.Services.AddSingleton<IActionAuditListener, AuditTrail>();   // Mateu.Uidl
```

```python
add_mateu(app, views, audit_listeners=[AuditTrail()])   # mateu_ui.uidl.ActionAuditListener
```

The event carries:

| Field | |
|---|---|
| caller | who called, **as the host framework authenticated them** (anonymous when nobody did) — Mateu never decodes a token itself |
| route, action id, view | what was asked and which view answered |
| record ids | the records the action acted on, when the CRUD knows them: save, create, delete (single and selection), restore, update-row and — Java — a bulk `@ListToolbarButton` over the selection |
| at, duration | when it started and how long it took |
| outcome | `OK`, `USER_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `ERROR` |
| correlation id, error reference | to join the trail with the logs and the traces |

It **never** carries field values, component state or action parameters: what the user typed stays
out of the audit trail. When you need the values, read them from your own store with the record ids.

Any number of listeners may be registered. A listener that throws does not fail the request: Mateu
logs it once per listener class (WARN) and goes on. Listeners run on the thread that finished the
request, after the answer — keep them quick and hand the event to a queue when the trail is remote.

Both the listener and the event are `@Experimental` in 3.0: they may still change in a minor release.

## Differences between the backends

- Java and .NET observe a streamed request until its last answer; so does Python.
- `NOT_FOUND` is reported by Java (its not-found page); the .NET and Python ports have no not-found
  page and report a missing route as the error or refusal they answer with.
- The bulk-action record ids (`@ListToolbarButton` over a selection) are Java's only; the ports
  report the ids of their CRUD writes.
