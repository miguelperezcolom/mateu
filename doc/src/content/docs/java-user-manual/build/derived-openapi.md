---
title: "The OpenAPI your UI implies"
description: Derive the API contract from the endpoints your screens already declare — and use it as a check, not just a file.
---

**Status:** ✅ Emitter, contract check, server generator and Maven goals implemented. Not yet exposed
as a runtime endpoint.

Every entry of the [source catalogue](../../java-ui-definition/rest-source-catalogue), and every
`@RestOptions`, `@RestListing`, `@RestData` and `@RestAction`, already states a URL, a method, the
parameters it interpolates and the shape it reads back. **That is an endpoint contract** — it was just
never written down.

So the declaration stops deriving one artifact and starts deriving two:

```
                 ┌──▶  the UI      (wire → renderers)
  declaration ───┤
                 └──▶  the API contract it implies  (OpenAPI)
```

## Emitting it

From the build:

```bash
mvn mateu-bundle:openapi     # → target/mateu-openapi.json
```

| Parameter (`-Dmateu.openapi.*`) | Default | Meaning |
|---|---|---|
| `outputFile` | `target/mateu-openapi.json` | where the document is written |
| `title` | the project name | the document's `info.title` |
| `from` | `both` | where to read declarations from: `classes`, `bundle` or `both` |
| `manifestFile` | `target/mateu-bundle/manifest.json` | the exported bundle to read wire JSON from |
| `failOnEmpty` | `false` | fail when nothing declares an endpoint (usually a misconfiguration) |

### It reads every authoring channel, not just annotated Java

`from = bundle` is what makes this work for a mount authored as **data**. A screen declared in YAML has
no annotated class to reflect over, and everything it declares still reaches the wire — so the contract
is derived from the exported bundle's pre-rendered increments, with no classpath involved at all. That
is the deployment that most needs a contract: a statically served UI has no backend of its own to ask.

The named source catalogue is always read; it needs neither channel, and it is the richest of the three.
It is what gives an operation its identity — two surfaces referencing one name are **one** operation,
declared rather than guessed by comparing URL strings — and that name becomes the `operationId` a
generated server is built around.

Or in code:

```java
String json = OpenApiEmitter.emitJson("My API", List.of(Orders.class, Dashboard.class));
```

From a screen like this:

```java
@UI("/orders")
@RestListing(url = "https://api.example.com/orders?since=${state.since}", itemsPath = "data")
public class Orders {

  @RestOptions(url = "https://api.example.com/countries", valuePath = "code", labelPath = "name")
  String country;

  @RestAction(url = "https://api.example.com/orders/${state.id}/approve", method = "POST")
  void approve() {}
}
```

you get `/orders` (GET, with `since` as a required parameter), `/countries` (GET) and
`/orders/{}/approve` (POST), each origin listed as a server, and each operation recording the path
the screen reads (`data`, `items`, `result`).

## What you serve versus what you consume

Each operation carries two vendor extensions:

- `x-mateu-source` — the catalogue entry it came from.
- `x-mateu-provenance` — `generate` when this project owes the endpoint, `existing` when somebody else
  already serves it (see [the catalogue](../../java-ui-definition/rest-source-catalogue)).

That distinction keeps both derived artifacts honest. The generator builds only what you owe, so a third
party's API never gets a Spring controller; and the contract check has its best use on the `existing`
ones — *"the UI needs this from your API, does it offer it?"* — verifiable against their published
document. The `servers` block reflects it too: external origins are described as dependencies.

## It is a lower bound — and that is the honest claim

| The UI knows | The UI cannot know |
|---|---|
| paths, methods | error codes |
| the parameters the screens interpolate, and their types | authentication |
| the fields the screens read, nested where the endpoint nests them | idempotency, side effects |
| the total of a server-paged response | business rules, versioning |

*"This is the minimum your API must satisfy"* is exact and useful. *"This generates your API"* would
be false, and the emitted document says so in its own `info.description` rather than letting a reader
assume error codes were considered.

## The better use: a check, not a file

A file has to be looked at. `ApiContractCheck` compares the derived spec against a **server's own**
OpenAPI and reports the gaps:

```java
List<Gap> gaps = ApiContractCheck.check(
    OpenApiEmitter.emit("UI needs", views),
    yourServersOpenApi);
```

```
GET /orders — the screens send 'since' and the API does not accept it
```

This is not an alternative to generating a server — it is the other half, and the only half available
for the endpoints you do not own:

- **Nothing to regenerate**, so nothing to conflict with the code you wrote.
- **Works against any backend** — Java, .NET, Python or a third party's.
- **Catches drift in both directions**: the server changing a response the screens read, *and* the
  screens starting to need something the server does not offer.

That last one is the quiet failure it exists for: the endpoint answers `200`, ignores the filter the
screen sends, and the user sees the wrong rows with nothing in any log.

The check deliberately stays silent about error codes, auth and schemas. A check that failed on
things the UI cannot know would report noise — and a check that reports noise gets ignored, which is
worse than not having one.

## Generating the server it implies

```bash
mvn mateu-bundle:server     # → target/mateu-server/, a runnable Spring Boot module
```

| Parameter (`-Dmateu.server.*`) | Default | Meaning |
|---|---|---|
| `openApiFile` | `target/mateu-openapi.json` | the contract to implement |
| `outputDirectory` | `target/mateu-server` | where the module is written |
| `groupId` / `artifactId` / `version` | the project's, with `-api` appended | the module's coordinates |
| `basePackage` | `<groupId>.<artifactId>` | the module's base package |
| `springBootVersion` / `javaVersion` | `3.3.4` / `21` | the module's parent and language level |
| `provenance` | `generate` | which operations to implement: `generate`, `existing` or `all` |
| `failOnEmpty` | `false` | fail when the contract asks this project for nothing |

It reads an OpenAPI **file** rather than the declarations directly, so the two goals compose — and so
this one also works on a hand-written or third-party document.

You get a controller and a port per group, response records, and a runnable application:

```java
public interface ReservationsApi {
  /** Reservations arriving on a given date */
  ReservationsResponse reservations(String arrival);
}
```

### The rule that is not negotiable

> Never mix generated code and hand-written code in the same file.

The controller and the port are generated. **The adapter is not** — you write it, in a file the
generator never produces and therefore can never overwrite:

```java
@Service
class ReservationsAdapter implements ReservationsApi {
  // your queries, your use cases, your business rules
}
```

The failure mode this avoids is the generated `OrderService` with a `// TODO` inside: the second run
either destroys the work somebody put there or skips the file forever, and from then on the contract
and the code drift in silence. That is a one-shot scaffolder, not a derivation.

Because every file in the module is generated, the whole thing can be rewritten on every build without
risk — which is what makes regenerating cheap enough to actually do. The generator only writes its own
files and never deletes, so your adapters can sit in the same module.

### An unimplemented port stops the application

Not a stub returning empty — a **missing bean**:

```
APPLICATION FAILED TO START

Description:
No implementation of ReservationsApi was found, so the endpoints it declares cannot be answered.

Action:
Write a bean implementing ReservationsApi — for example a @Service called ReservationsAdapter.
```

A skeleton that started up and answered `200` with nothing would look like a working server, which is a
far worse thing to hand somebody than one that refuses.

## The path this completes

```
draw the screens  →  run them with no backend  →  derive the contract  →  generate the server  →  write the logic
```

Each step lands somewhere ordinary: a YAML definition, a static bundle on a CDN, an OpenAPI document, a
Maven module with Spring controllers. Nothing about the result is locked in — the answer to *"and when
this falls short?"* is that you keep the contract and the module, and carry on in your own stack.
