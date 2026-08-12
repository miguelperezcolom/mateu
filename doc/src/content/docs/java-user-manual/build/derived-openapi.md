---
title: "The OpenAPI your UI implies"
description: Derive the API contract from the endpoints your screens already declare — and use it as a check, not just a file.
---

**Status:** ✅ Emitter, contract check and Maven goal implemented. Not yet exposed as a runtime endpoint.

Every `@RestOptions`, `@RestListing`, `@RestData` and `@RestAction` already states a URL, a method,
the parameters it interpolates and the shape it reads back. **That is an endpoint contract** — it was
just never written down.

So the declaration stops deriving one artifact and starts deriving two:

```
                 ┌──▶  the UI      (wire → renderers)
  declaration ───┤
                 └──▶  the API contract it implies  (OpenAPI)
```

## Emitting it

From the build:

```bash
mvn mateu:openapi     # → target/mateu-openapi.json
```

| Parameter (`-Dmateu.openapi.*`) | Default | Meaning |
|---|---|---|
| `outputFile` | `target/mateu-openapi.json` | where the document is written |
| `title` | the project name | the document's `info.title` |
| `failOnEmpty` | `false` | fail when no screen declares an endpoint (usually a misconfiguration) |

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

## It is a lower bound — and that is the honest claim

| The UI knows | The UI cannot know |
|---|---|
| paths, methods | error codes |
| the parameters the screens interpolate | authentication |
| the field the screen reads back (`itemsPath`, `resultPath`) | idempotency, side effects |
| bean-validation constraints on the fields | business rules, versioning |

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

Why this beats generating controllers:

- **Nothing to regenerate**, so nothing to conflict with the code you wrote.
- **Works against any backend** — Java, .NET, Python or a third party's.
- **Catches drift in both directions**: the server changing a response the screens read, *and* the
  screens starting to need something the server does not offer.

That last one is the quiet failure it exists for: the endpoint answers `200`, ignores the filter the
screen sends, and the user sees the wrong rows with nothing in any log.

The check deliberately stays silent about error codes, auth and schemas. A check that failed on
things the UI cannot know would report noise — and a check that reports noise gets ignored, which is
worse than not having one.

## What is not here yet

**Generating controllers.** It is deliberately last, and it comes with a rule that is not negotiable:

> Never mix generated code and hand-written code in the same file.

Generate the controller and the port (the use-case interface); the human writes the adapter in a file
the generator never touches. The failure mode to avoid is a generated `OrderService` with `// TODO`
inside: the second run either destroys work or is skipped forever, and from then on the contract and
the code drift in silence. That would be a one-shot scaffolder, not a derivation.
