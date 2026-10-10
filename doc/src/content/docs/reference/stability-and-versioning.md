---
title: "Stability & versioning"
description: "What counts as Mateu's public API, how versions are numbered, how long a deprecated API stays, and the compatibility rules of the wire."
---

From the **3.0 beta** on, Mateu commits to the rules on this page. Before it — the 3.0 alphas — the
API changed in place; [Migrating from alpha](/reference/migrating-from-alpha/) lists everything that
did.

## Version numbers

- Releases are tagged `vMAJOR.MINOR[-qualifier.N]` and published to Maven Central under `io.mateu`,
  every artifact named `mateu-*` (`mateu-uidl`, `mateu-mvc`, `mateu-vaadin`…; the pre-beta ids are
  relocation poms — see [Migrating from alpha](/reference/migrating-from-alpha/#maven-artifacts)),
  with the tag's version (`3.0-alpha.406`, `3.0-beta.1`, `3.0.0`, `3.1.0`…). Every module of one
  release shares that version — never mix versions of `io.mateu` artifacts in one app.
- **Major** (`3` → `4`): may break the public API or the wire. Announced in advance, with a migration
  guide.
- **Minor** (`3.0` → `3.1`): new features; **no breaking change** to the public API or the wire.
  May deprecate.
- **Patch** (`3.0.0` → `3.0.1`): fixes only.
- **Pre-releases** (`-alpha.N`, `-beta.N`): alphas may break anything; betas follow the
  deprecation policy below, except for fixes to defaults that were a security problem.

## What is public API

You can build on these; they follow the deprecation policy.

| Surface | Where it lives |
|---|---|
| **The authoring API** — annotations (`@UI`, `@Action`, `@Section`…), interfaces (`CrudStore`, `Listing` and its capability interfaces, suppliers…), the fluent component records and data types | the `io.mateu:mateu-uidl` artifact (`io.mateu.uidl.*`) |
| **The archetypes and orchestrators** you extend — `AutoCrud`, `FilteredAutoCrud`, `Crud`, `Wizard`, `Dashboard`, `Foldout`, `HeroSearch`, `CollectionDetail`, … | their `public`/`protected` members in `io.mateu:mateu-core` (`io.mateu.core.infra.declarative.orchestrators.*`) |
| **The wire** — the JSON exchanged between backend and renderer | the DTOs of `io.mateu:mateu-dtos` and the [wire specification](/reference/wire-specification/); compatibility rules below |
| **The authoring schemas** — `uidl-schema.json`, `routes-schema.json`, `sources-schema.json`, `specs-schema.json` (YAML `specs/ui/**`) | `backend/shared/uidl/*.json`, generated from the records |
| **The HTTP contract** — `POST {baseUrl}/mateu/v3/…` | the [wire specification](/reference/wire-specification/) |
| **Build integration** — annotation processor coordinates and options, `mateu-bundle-maven-plugin` goals and parameters | their Maven coordinates |
| **The .NET and Python authoring APIs** — `Mateu.Uidl` attributes/types, `mateu_uidl` decorators/markers | follow the same policy once published as packages (see the release notes) |

### Module layering

The three public modules depend on each other in one direction only, and a test
(`LayeringTest` in `mateu-uidl`) keeps it that way:

- **`mateu-dtos`** — the wire — depends on nothing Mateu. A renderer or a non-Java producer can
  read it without the authoring API.
- **`mateu-uidl`** — the authoring API — depends on `mateu-dtos` only through a closed set of
  *wire-boundary* types: the escape hatches that hand Mateu a ready-made wire object
  (`DtoSupplier`, `MapsToDto`, `CardRow`), the request as received (`HttpRequest.runActionRq()` /
  `getUiRq()`, used by `SearchableSelection`) and the long-task stream (`LongTask`,
  `ProgressReporter`). Everything else in `mateu-uidl` is wire-agnostic; a new import of
  `io.mateu.dtos` outside that list fails the build. It never depends on `mateu-core`.
- **`mateu-core`** depends on both, and maps the one onto the other.

An app module that only declares UIs needs `mateu-uidl` (which brings `mateu-dtos` along for those
boundary types); it never needs `mateu-core` at compile time.

**Not public** — may change in any release, without deprecation:

- anything under `io.mateu.core` other than the archetypes above (mappers, use cases, resolvers,
  `infra.*` internals), the adapters' internals (`mateu-mvc`, `mateu-webflux`, …) and the
  **generated** controllers and resolvers;
- the renderers' JavaScript/TypeScript internals (`libs/mateu`, `apps/*`) — the contract with a
  renderer is the wire, not the code;
- anything marked `@Deprecated(forRemoval = true)` or `@Experimental` (see below), or
  "experimental" or "internal" in its Javadoc or in these docs;
- log messages and the text of framework-generated error messages.

## Experimental API

Some public surfaces are still being shaped. They are marked with
**`@io.mateu.uidl.annotations.Experimental`** (on a type — which covers all its members — or on a
single member), and the rule for them is:

> **`@Experimental` API may change or be removed in a minor release**, without the one-minor
> deprecation period below. Everything else in the public API follows the deprecation policy.

The API compatibility check (see [Enforcement](#enforcement)) skips anything carrying the annotation.
When an experimental API is promoted, the annotation is removed in a minor release and the CHANGELOG
says so; from then on it is stable.

Experimental today:

| Surface | Where |
|---|---|
| The **AI assistant** chat panel and its MCP wiring | `@AI`, the `Chat` component (`io.mateu.uidl`); the MCP endpoint (`POST /mateu/mcp`, off by default) and the tool projection it serves; the `agent-cli` modules (not published) |
| The **Figma design-to-code pipeline** | the contract packaged at `META-INF/mateu/contract.json` in the uidl jar, the Figma plugin and the modux importer/codegen |

## Deprecation policy

- An API is **deprecated for at least one minor release before it is removed** — e.g. deprecated in
  `3.1`, removable in `3.2` at the earliest. Removal only in a minor or major, never in a patch.
- A deprecation always names its replacement (`@Deprecated` + `@deprecated use … instead` in Javadoc,
  the `[Obsolete]` message in .NET, a `DeprecationWarning` in Python) and is listed in the
  [CHANGELOG](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md).
- Where a rename can be bridged, the old name keeps working as an alias for the deprecation period.
- A **default that changes behaviour** is treated like a removal: announced one minor ahead, with a
  switch to keep the old behaviour for at least that minor. Security fixes are the exception: an
  insecure default can change in a patch, and the release notes say how to opt back in.

## Enforcement

Every build checks the Java public API against the **last released version** with
[japicmp](https://siom79.github.io/japicmp/): `mvn verify` compares the `mateu-uidl` and `mateu-dtos` jars, and
the archetype packages of `core` (`io.mateu.core.infra.declarative.orchestrators.*`), against
`<mateu.japicmp.baseline>` (in `backend/pom.xml`) and writes a report to
`target/japicmp/api-compatibility.{md,html,diff}` of each module; CI publishes it in the job summary.

- **Until the beta** the check is **report-only** (`mateu.japicmp.enforce=false`): the alphas
  change the API in place, and [Migrating from alpha](/reference/migrating-from-alpha/) is the record of it.
- **From the beta tag on** the baseline moves to the beta and `mateu.japicmp.enforce` is `true`: a
  binary- or source-incompatible change **fails the build** unless the type or member is
  `@Experimental`, or the change is listed in **`backend/api-compat/japicmp-exclusions.properties`**
  — the reviewed exclusion file. Adding an entry is how a planned removal (the end of a deprecation
  period, a major release) gets through; each entry names the PR or release that accepted it, and the
  list is reset whenever the baseline moves.
- Marking an existing stable API `@Experimental` is itself reported as a removal — an API cannot
  leave the promise silently; it is deprecated first like anything else.

Run it locally with `mvn verify -pl shared/uidl` (add `-Dmateu.japicmp.enforce=true` to see what
would fail; `-Dmateu.japicmp.skip=true` skips it, e.g. offline — the baseline jar comes from Maven
Central).

## Wire compatibility

The wire is versioned separately from the artifacts: every response carries `wireVersion` (currently
`3.0`). The normative rules are in the [wire specification](/reference/wire-specification/#status-and-versioning);
in short:

- **Additive within a wire major.** A minor Mateu release may add optional fields, new component
  types and new commands. It never removes a field, changes its type or changes its meaning.
- **Consumers must be tolerant**: ignore unknown fields, render unknown component types as a
  placeholder and keep going. Every first-party renderer does; a custom renderer must too.
- **Consumers check the major.** The web (Vaadin) and Redwood renderers, React Native and the
  IntelliJ plugin compare the response's `wireVersion` with the major they were built for: the same
  major is fine whatever the minor; another major shows the user a clear message ("This app's server
  speaks Mateu wire 4.x; this renderer supports 3.x") once, instead of a broken screen. The wire
  major only changes with a Mateu major.
- **Producers must be conservative**: a backend never requires a field a renderer of the same wire
  major might not send.
- A backend and a renderer of the **same wire major** interoperate. In practice: keep the backend
  and the renderer artifact on the same Mateu release (they ship together), and the .NET and Python
  backends speak the same wire as the Java one of the same release.
- The [conformance corpus](/reference/wire-specification/#conformance) is the executable definition
  of "wire-equivalent": a change that makes it fail is a breaking change.

## Schemas and YAML

The authoring schemas are generated from the records and checked by a test, so they always match the
code of their release. Within a major, a key may be **added**; a key is only removed or renamed
through the deprecation policy. A YAML file valid against one release's schema stays valid in the
next minor.

## Supported versions

Security fixes go to the **latest minor of the current major**; see
[SECURITY.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY.md) for the current
table and how to report a vulnerability.
