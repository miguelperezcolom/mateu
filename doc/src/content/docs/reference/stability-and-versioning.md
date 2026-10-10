---
title: "Stability & versioning"
description: "What counts as Mateu's public API, how versions are numbered, how long a deprecated API stays, and the compatibility rules of the wire."
---

From the **3.0 beta** on, Mateu commits to the rules on this page. Before it — the 3.0 alphas — the
API changed in place; [Migrating from alpha](/reference/migrating-from-alpha/) lists everything that
did.

## Version numbers

- Releases are tagged `vMAJOR.MINOR[-qualifier.N]` and published to Maven Central under `io.mateu`
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
| **The authoring API** — annotations (`@UI`, `@Action`, `@Section`…), interfaces (`CrudStore`, `Listing` and its capability interfaces, suppliers…), the fluent component records and data types | the `io.mateu:uidl` artifact (`io.mateu.uidl.*`) |
| **The archetypes and orchestrators** you extend — `AutoCrud`, `FilteredAutoCrud`, `Crud`, `Wizard`, `Dashboard`, `Foldout`, `HeroSearch`, `CollectionDetail`, … | their `public`/`protected` members in `io.mateu:core` (`io.mateu.core.infra.declarative.orchestrators.*`) |
| **The wire** — the JSON exchanged between backend and renderer | the DTOs of `io.mateu:dtos` and the [wire specification](/reference/wire-specification/); compatibility rules below |
| **The authoring schemas** — `uidl-schema.json`, `routes-schema.json`, `sources-schema.json`, `specs-schema.json` (YAML `specs/ui/**`) | `backend/shared/uidl/*.json`, generated from the records |
| **The HTTP contract** — `POST {baseUrl}/mateu/v3/…` | the [wire specification](/reference/wire-specification/) |
| **Build integration** — annotation processor coordinates and options, `mateu-bundle-maven-plugin` goals and parameters | their Maven coordinates |
| **The .NET and Python authoring APIs** — `Mateu.Uidl` attributes/types, `mateu_uidl` decorators/markers | follow the same policy once published as packages (see the release notes) |

**Not public** — may change in any release, without deprecation:

- anything under `io.mateu.core` other than the archetypes above (mappers, use cases, resolvers,
  `infra.*` internals), the adapters' internals (`mvc-core`, `webflux-core`, …) and the
  **generated** controllers and resolvers;
- the renderers' JavaScript/TypeScript internals (`libs/mateu`, `apps/*`) — the contract with a
  renderer is the wire, not the code;
- anything marked `@Deprecated(forRemoval = true)`, `@Beta`, "experimental" or "internal" in its
  Javadoc or in these docs;
- log messages and the text of framework-generated error messages.

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

## Wire compatibility

The wire is versioned separately from the artifacts: every response carries `wireVersion` (currently
`3.0`). The normative rules are in the [wire specification](/reference/wire-specification/#status-and-versioning);
in short:

- **Additive within a wire major.** A minor Mateu release may add optional fields, new component
  types and new commands. It never removes a field, changes its type or changes its meaning.
- **Consumers must be tolerant**: ignore unknown fields, render unknown component types as a
  placeholder and keep going. Every first-party renderer does; a custom renderer must too.
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
