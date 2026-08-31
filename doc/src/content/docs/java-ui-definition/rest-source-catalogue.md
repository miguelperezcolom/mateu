---
title: "The REST source catalogue"
description: "Declare each endpoint your UI consumes once, and reference it by name from any screen."
---

A screen can declare a REST endpoint inline, right where it is consumed:

```java
@RestOptions(url = "https://api.example.com/countries", valuePath = "code", labelPath = "name")
String country;
```

That is the right thing for an endpoint exactly one screen uses. It stops being the right thing the
moment a second screen needs the same one:

- Five screens consuming one endpoint are **five copies to edit** when the host changes.
- There is **nowhere to state what is true of the endpoint** rather than of one screen — its base
  URL, its auth, whether it should be fetched through the server, which secrets it needs.
- A **statically deployed bundle cannot be re-pointed** at another environment without a rebuild,
  because the URL is baked into every screen that uses it.
- Nothing says the five declarations are **one endpoint**, so anything derived from them has to guess
  by comparing URL strings.

The catalogue fixes all four by naming each endpoint once.

## Declaring it

Two producers feed one table, exactly like the [route registry](./route-registry): annotations are
the derived half, an authored `specs/ui/sources.yaml` is merged on top, and **the authored entry
wins**.

```yaml
# specs/ui/sources.yaml
sources:
  - name: countries
    description: ISO country codes
    source:
      url: https://restcountries.com/v3.1/all?fields=cca2,name
      valuePath: cca2
      labelPath: name.common

  - name: orders
    description: The orders a screen lists
    source:
      url: /api/orders?since=${state.since}
      itemsPath: data
    totalPath: meta.total
    fields:
      customerName: customer.name
```

or in Java, wherever it reads best — typically the `@UI` app class or a dedicated catalogue class:

```java
@UI("")
@RestSource(name = "countries", url = "https://restcountries.com/v3.1/all",
            valuePath = "cca2", labelPath = "name.common")
@RestSource(name = "orders", url = "/api/orders?since=${state.since}", itemsPath = "data",
            totalPath = "meta.total", fields = {"customerName=customer.name"})
public class Home {}
```

Source names are **global**, not relative to a mount: a source is an endpoint, not a screen, and two
mounts consuming the same endpoint should say so with the same name.

For a catalogue that comes from configuration or differs per environment, implement
`RestSourceCatalogSupplier` on a bean.

## Referencing it

Any of the four surfaces takes a `source` instead of a `url`:

```java
@RestOptions(source = "countries")
String country;
```

What the surface declares still **wins** over the entry, so it can point at a shared endpoint and
still map the response its own way:

```java
@RestOptions(source = "countries", labelPath = "name.official")
String country;
```

The reference travels to the renderer as a name, and the catalogue travels with the app metadata —
or, for a static deployment, once in the bundle's `manifest.json`. **That one table is what makes
re-pointing a CDN deployment an edit instead of a rebuild.**

A reference the catalogue does not carry is never resolved to something half-built: the fetch fails
visibly rather than quietly calling an endpoint nobody declared.

## `fields`: reading a nested value under a flat name

A listing reads each column by using the column id **directly as the dot path**, and a Java record
field cannot be called `customer.name`. So a nested response field could not reach a flat column at
all — and no surface can fix that on its own, because the surface is where the constraint lives.

Declaring it on the source fixes it once for every screen that consumes it:

```yaml
fields:
  customerName: customer.name
  roomNumber: room.number
```

## `provenance`: what you serve versus what you consume

Each entry says whether the endpoint is one **somebody already serves** or one **this project still
has to build**:

| value | meaning |
|---|---|
| `existing` | somebody else's. Documented, verifiable against their published OpenAPI, never generated. |
| `generate` | yours to build. It is what [`mateu:server`](../java-user-manual/build/derived-openapi) generates a controller for. |
| `auto` (default) | inferred from the URL: relative or same-origin is yours, another origin is somebody else's. |

Declare it explicitly when you disagree with the inference:

```yaml
  - name: invoices
    provenance: generate
    source:
      url: https://api.acme-internal.example.com/invoices
```

Without the distinction the derived artifacts would be wrong in both directions: generating a Spring
controller for a third party's public API, and silently omitting an endpoint you owe.

## Proxy mode

`proxy: true` makes the fetch go through the Mateu server instead of the browser — no CORS, and
`${secret.X}` injected server-side. With a catalogue this gets **safer**, not just tidier: the
endpoint the proxy calls is resolved from a table the server holds, rather than from an annotation
scattered across fields, and never from the request. That is what keeps the proxy from becoming an
open relay.

## What is not covered

The mapping reaches **any JSON whose pieces are reachable by a dot path** — no envelope convention is
imposed. What it does not do today:

- **Non-JSON responses** (XML, CSV, plain text).
- **Value transformation** — formatting a date, changing units, joining two fields.
- **Cursor or offset paging**: `${searchText}`, `${page}` and `${size}` interpolate, but there is no
  arithmetic, so `offset = page × size` cannot be expressed.
- **A 200 carrying an error** in its body; only a non-2xx status is treated as failure.
