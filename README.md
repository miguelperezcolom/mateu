# Mateu

[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white)](https://discord.gg/YFb9utDMYK)

Mateu is a way to define **business UIs once, agnostically**:

- **one model**, authored as **YAML**, in the **visual editor** (IntelliJ / VS Code), or in **code** —
  Java (Spring Boot MVC & WebFlux, Quarkus, Micronaut, Helidon MP), C# (ASP.NET Core) or Python
  (FastAPI). All of them produce the same model;
- **rendered anywhere**: on the web with Vaadin or Oracle Redwood (also embedded in Visual Builder
  apps), on phones with the Mateu mobile app, on the desktop inside IntelliJ;
- **served by any backend, or by none**: a server in any of those languages, or a static bundle on a
  CDN that calls your REST APIs straight from the browser;
- **composable**: UIs owned by different teams and domains federate into one console.

The backend is an option, not the definition. Docs: **https://mateu.io** — start at
[Choose your path](https://mateu.io/start-here/choose-your-path/).

---

## Why Mateu

An LLM will write you a React admin panel in a minute. So "less code" is no longer the point.

The point is what happens **on day 200**.

Generated code **derives** from your model and then **diverges** from it: the moment someone edits
it, it is theirs to maintain, and it drifts. Mateu does not generate the UI — it **derives** it, so
it cannot drift. Change the model and the screen is already correct.

That is one distinction, and it is the whole framework:

> **Source of truth vs artifact.** You maintain the declaration. Everything downstream — the UI, the
> API contract it implies, a static bundle — is derived, and nobody edits it.

### Start from whatever you already have

|  |  |
|---|---|
| A domain model? | Declare view classes in Java, C# or Python (`@UI` / `[UI]` / `@ui`) — inside-out |
| A design or a mockup? | Draw it in the visual editor — outside-in |
| An existing REST API? | Point the screens at it |
| Prefer data over code? | Declare it in YAML — `type: UI` mounts, `routes.yaml`, layout definitions |

They all land on the same declaration. Code-first tools cannot start from a design; design-first
low-code tools cannot start from your domain model.

### And the UI travels with the domain

Each service ships its own screens with it — a jar, a .NET or Python service, or a folder of YAML —
and they aggregate into one shell, or embed into an IDE, a mobile app, a Visual Builder app or
another product's page. Eight teams can own, version and deploy their slice of the same back office
independently.

That is micro-frontends without the micro-frontend tax: what federates is a **declaration**, not a
JS bundle, so there is one framework version, no runtime composition and no CSS collisions.

---

## Example: the same screen, three ways

As data (no code) — `specs/ui/products.yaml`, by hand or written by the visual editor:

```yaml
type: Listing
title: Products
searchable: true
rowsSource:
  ref: products            # an endpoint named once in sources.yaml
columns:
  - {type: GridColumn, id: name, label: Name}
  - {type: GridColumn, id: price, label: Price}
  - {type: GridColumn, id: status, label: Status, dataType: status}
```

In Java (a full CRUD over a record):

```java
record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) double price,
    @NotNull ProductStatus status
) implements Identifiable {}

@UI("")
public class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
        return ProductStore.INSTANCE; // findById, save, findAll, deleteAllById
    }
}
```

In C# (`[UI("products")] class Products : Crud<Product>`) or Python (`@ui("products") class
Products(Crud[Product])`) — see [`starters/dotnet`](starters/dotnet) and
[`starters/python`](starters/python).

Each becomes a searchable listing (the code versions also get create, detail, edit and delete,
validated on both sides), in any renderer:

![Products CRUD](https://mateu.io/images/docs/first-app/starter-products.png)

---

## Quickstart: three front doors

1. **The IDE wizard** — IntelliJ IDEA: *File › New › Project… › Mateu*; VS Code: *Mateu: New
   Project…*. Pick how you author (code, code + YAML, YAML served by a backend, YAML static) and the
   runtime.
2. **The Maven archetype** —
   ```bash
   mvn archetype:generate -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype \
       -DarchetypeVersion=<release> -DgroupId=com.acme -DartifactId=my-app
   # add -Dauthoring=yaml (YAML served by Spring Boot) or -Dauthoring=static (no backend)
   ```
3. **YAML only, no code** — copy [`starters/yaml`](starters/yaml) (or [`starters/static`](starters/static)
   for a bundle with no backend) and follow [Quickstart: YAML](https://mateu.io/define/yaml/quickstart/).

Or clone a starter for your runtime: [`starters/`](starters) has Spring MVC, WebFlux, Quarkus,
Micronaut, Helidon MP, .NET, Python, YAML and static — CI builds and boots each one. Java
quickstart: https://mateu.io/java-user-manual/start-here/quickstart/.

---

## What you get

- forms and inputs from fields (in code) or from a definition (in YAML)
- validation from annotations or rules
- menus and app shells, declared in code or as data
- full CRUD with minimal code
- responsive UI out of the box
- the same screens on the web (Vaadin, Redwood), on phones (the Mateu app) and inside IntelliJ —
  no renderer work
- a [static bundle](https://mateu.io/deploy/static-bundle/) when you want no backend at all:
  the same app served from a CDN (guides for [Netlify](https://mateu.io/deploy/netlify/),
  [Kubernetes](https://mateu.io/deploy/kubernetes-hetzner-cloudfleet/) and the
  [app stores](https://mateu.io/deploy/mobile-app-stores/))

---

## When to use Mateu

Mateu is a great fit for:

- admin panels
- internal tools
- enterprise backoffices
- CRUD-heavy applications

Mateu is **not designed for**:

- marketing websites
- highly custom visual experiences
- frontend-heavy products

When one screen out of forty does need to be special, you drop to a custom component for that one
and keep routing, state, validation, i18n and the rest of the app.

---

## 💬 Community

Have questions, ideas or feedback?

👉 **Join our Discord**: https://discord.gg/YFb9utDMYK

---

## 📚 Documentation

- Docs: https://mateu.io — [Choose your path](https://mateu.io/start-here/choose-your-path/) ·
  [Concepts](https://mateu.io/concepts/) · [Define the UI](https://mateu.io/define/) ·
  [Renderers](https://mateu.io/design-systems/) · [Serve & deploy](https://mateu.io/deploy/)
- Starters (one per runtime): [`starters/`](starters) · Demos: [`demo/`](demo)
- What changed: [CHANGELOG.md](CHANGELOG.md) · Upgrading: https://mateu.io/reference/migrating-from-alpha/
- What is public API: https://mateu.io/reference/stability-and-versioning/

---

## Contributing & security

- [CONTRIBUTING.md](CONTRIBUTING.md) — build order, module map, tests, sign-off.
- [SECURITY.md](SECURITY.md) — report vulnerabilities privately, never in a public issue.
- [Code of conduct](CODE_OF_CONDUCT.md) · Licensed under [Apache-2.0](LICENSE.txt).

---

## One-sentence summary

Mateu derives real business UIs from one model you keep — written as YAML or code, rendered anywhere,
served by any backend or none — so they cannot drift away from it.
