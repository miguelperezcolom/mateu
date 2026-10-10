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

### What "beta" means

The first beta freezes the public surface listed under [What is public API](#what-is-public-api).
From that tag on:

- **Stable API changes only through deprecation.** A replacement is added, the old element is
  marked deprecated (naming the replacement) and **both work side by side for at least one
  release** — deprecated in `3.0-beta.N`, removable in `3.0-beta.N+1` at the earliest; once `3.0.0`
  is out, the one-minor rule below applies. Nothing stable is renamed in place.
- **Experimental API can change** in any beta (and later in any minor) — that is what the marker is
  for. The [list below](#stable-and-experimental-api-by-package) is the exact boundary.
- The **wire** stays additive within `wireVersion` 3.x (see [Wire compatibility](#wire-compatibility)),
  and YAML keys follow the same add-then-deprecate rule as Java names.
- The compatibility check that enforces this for Java ([Enforcement](#enforcement)) is switched to
  blocking at the beta tag.

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

### Imports: names shared by two packages

Several concepts exist both as an **annotation** and as a **fluent record** — `@Badge` on a field
and `new Badge(…)` in a component tree — so the same simple name lives in two packages. With two
star imports the bare name is ambiguous and does not compile. Java's rule settles it: **a
single-type import always wins over a star import.** Star-import the package you use most and
import the other type explicitly:

```java
import io.mateu.uidl.annotations.*;   // @Section, @Toolbar, @Badge…
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Badge;      // the record wins for the bare name `Badge`…
// …and the annotation is then written qualified: @io.mateu.uidl.annotations.Badge
```

The shared names (pinned by `NameCollisionsTest` in `mateu-uidl`, so a new one is a reviewed
decision):

| Packages | Names |
|---|---|
| `annotations` / `data` | `Avatar`, `Badge`, `Breadcrumb`, `Breadcrumbs`, `BulletedList`, `Button`, `Details`, `FormLayout`, `Icon`, `KPI`, `Menu`, `Notice`, `RestAction`, `Rule`, `Status`, `Tab`, `Text`, `Tooltip`, `Validation` |
| `annotations` / `fluent` | `Action`, `Trigger`, `UI` |
| `annotations` / `interfaces` | `App`, `Filterable`, `Searchable` |
| `fluent` / `interfaces` | `Listing` (the fluent listing component / the listing contract) |
| `data` / `interfaces` | `Page` (a page of rows / the routed-page marker) |
| `data` / `fluent` | `Step` |
| with `java.util` | `List` (`@List`), `Map`, `Calendar` — with `import java.util.*` also star-imported, import `java.util.List`/`Map` explicitly |

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
| The **AI assistant** chat panel and its MCP wiring | `@AI`, the `Chat` component (`io.mateu.uidl`); the MCP endpoint (`POST /mateu/mcp`, off by default) and the tool projection it serves |
| The **new YAML authoring catalogues** | field types (`types.yaml`: `FieldTypeEntry`, `FieldTypeCatalog`, `FieldTypeCatalogSupplier`, `GridColumn.tones`), translations (`Translations`, `TranslationsSupplier`), environments (`Environment`), YAML access keys (`Access`), the project descriptor (`ProjectSettings`, `ProjectRenderer`) and sample data on REST sources (`RestDataSource.sample`, `RestSourceEntry.sample`) — the YAML shapes and the Java types behind them |
| **Development tooling** | live reload (dev mode, `/mateu/dev/*`), the Redwood embedded `<mateu-ui>` JET component |
| The **Spring Data JPA store** | `JpaCrudStore`, `CrudStores` in the optional `io.mateu:mateu-spring-data` module ([guide](/java-user-manual/build/spring-data/)) |
| The **Figma design-to-code pipeline** | the contract packaged at `META-INF/mateu/contract.json` in the uidl jar, the Figma plugin and the modux importer/codegen |
| The **pattern-gap and PMS-parity features** of `3.0-alpha.409` — weeks old, not yet proven in production | the archetype display options (`Toggle`, `CrudDisplay`, `WizardDisplay`, `GeneralOverviewDisplay`), wizard drafts and navigation hooks (`Draftable`, `stepSkippable`, `beforeStepNavigate`, `@WizardCompletionAction(availableFromStep)`), the record switcher (`RecordSwitcher`, `RecordSwitcherSupplier`), docked panels (`DockedPanel`), the `@Section` affordances (`editAction`/`addAction`/`viewMoreAction`), hero tones, screen-reader announcements (`UICommand.announce`), pre-search content, the action panel, the matrix grid, map markers, drag rows to a drop zone, access keys, card menus, calendar views, hover popovers and cell tooltips, row tones, reorderable dashboards and the shared action catalogue (`actions.yaml`, `ActionCatalog`) |

The exact list, type by type, is [generated from the code](#stable-and-experimental-api-by-package).

### Stable and experimental API, by package

Everything public in these packages is **stable** unless it is listed as experimental here or is
deprecated. The table and the lists are generated from the `@Experimental` / `@Deprecated` markers
in the sources (by `ApiStabilityListTest` in `mateu-uidl`, which fails the build when this page is
stale), so they are exactly what the compatibility check enforces. The .NET (`Mateu.Uidl`) and
Python (`mateu_uidl`) ports follow the same boundary for the same concepts.

<!-- api-stability:start -->
<!-- generated by ApiStabilityListTest from the sources: do not edit by hand -->

| Module | Package | Public types | Stable | Experimental | Deprecated | Internal |
|---|---|---:|---:|---:|---:|---:|
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators` | 2 | 2 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.calendar` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.collectiondetail` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.crud` | 11 | 6 | 0 | 0 | 5 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers` | 11 | 0 | 0 | 0 | 11 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers` | 7 | 0 | 0 | 0 | 7 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.dashboard` | 3 | 1 | 0 | 0 | 2 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.datamanagement` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.editableview` | 2 | 2 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.foldout` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.ganttpage` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.generaloverview` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.herosearch` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.importwizard` | 8 | 8 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.itemoverview` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.masterdetail` | 2 | 2 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.smartsearch` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.todolist` | 1 | 1 | 0 | 0 | 0 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.welcome` | 3 | 1 | 0 | 0 | 2 |
| `mateu-core (archetypes)` | `io.mateu.core.infra.declarative.orchestrators.wizard` | 2 | 2 | 0 | 0 | 0 |
| `mateu-dtos` | `io.mateu.dtos` | 270 | 242 | 0 | 28 | 0 |
| `mateu-uidl` | `io.mateu.uidl` | 6 | 6 | 0 | 0 | 0 |
| `mateu-uidl` | `io.mateu.uidl.annotations` | 169 | 163 | 4 | 2 | 0 |
| `mateu-uidl` | `io.mateu.uidl.data` | 303 | 263 | 34 | 6 | 0 |
| `mateu-uidl` | `io.mateu.uidl.di` | 2 | 2 | 0 | 0 | 0 |
| `mateu-uidl` | `io.mateu.uidl.fluent` | 34 | 31 | 0 | 3 | 0 |
| `mateu-uidl` | `io.mateu.uidl.interfaces` | 104 | 96 | 5 | 1 | 2 |
| `mateu-uidl` | `io.mateu.uidl.layout` | 3 | 0 | 0 | 0 | 3 |
| `mateu-uidl` | `io.mateu.uidl.reflection` | 3 | 0 | 0 | 0 | 3 |
| **Total** | | **955** | **837** | **43** | **40** | **35** |

**Experimental types** (the whole type and its members):

- `io.mateu.uidl.annotations`: `AI`, `DragRows`, `RowStatus`, `Tooltip`
- `io.mateu.uidl.data`: `Access`, `ActionCatalog`, `ActionPanel`, `ActionPanelCategory`, `ActionPanelItem`, `Announcement`, `CalendarDay`, `CalendarView`, `Chat`, `CrudDisplay`, `DockedPanel`, `DropZone`, `Environment`, `FieldTypeCatalog`, `FieldTypeEntry`, `GeneralOverviewDisplay`, `HeroTone`, `MapMarker`, `MatrixCell`, `MatrixColumn`, `MatrixGrid`, `MatrixRow`, `MatrixSection`, `MenuDisplay`, `MenuPresentation`, `NotFound`, `PopoverTrigger`, `ProjectRenderer`, `ProjectSettings`, `RecordSwitcher`, `SwitcherType`, `Toggle`, `Translations`, `WizardDisplay`
- `io.mateu.uidl.interfaces`: `ActionCatalogSupplier`, `Draftable`, `FieldTypeCatalogSupplier`, `RecordSwitcherSupplier`, `TranslationsSupplier`

**Experimental members** of otherwise stable types:

- `io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage`: `actionOnDay`, `days`, `daysClickable`, `openCalendarDay`, `switchCalendarView`, `views`
- `io.mateu.core.infra.declarative.orchestrators.crud.Crud`: `display`, `nextIdAfter`, `saveAndNextLabel`
- `io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard`: `reorderable`
- `io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement`: `bottomPanel`, `endPanel`, `toggleBottomPanel`, `toggleEndPanel`
- `io.mateu.core.infra.declarative.orchestrators.foldout.Foldout`: `panelSummary`
- `io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview`: `display`, `info`, `infoWidth`
- `io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage`: `preSearchContent`
- `io.mateu.core.infra.declarative.orchestrators.welcome.Welcome`: `heroTone`
- `io.mateu.core.infra.declarative.orchestrators.wizard.Wizard`: `beforeStepNavigate`, `display`, `stepSkippable`
- `io.mateu.uidl.annotations.App`: `accessKeys`
- `io.mateu.uidl.annotations.Menu`: `display`, `image`
- `io.mateu.uidl.annotations.Section`: `addAction`, `editAction`, `viewMoreAction`
- `io.mateu.uidl.annotations.WelcomeBanner`: `tone`
- `io.mateu.uidl.annotations.WizardCompletionAction`: `availableFromStep`
- `io.mateu.uidl.data.Calendar`: `dayActionId`, `days`, `view`, `views`
- `io.mateu.uidl.data.CalendarEvent`: `endDate`, `endTime`, `startTime`
- `io.mateu.uidl.data.FieldLink`: `presentation`
- `io.mateu.uidl.data.FoldoutPanel`: `summary`
- `io.mateu.uidl.data.GridColumn`: `tones`
- `io.mateu.uidl.data.HeroSection`: `tone`
- `io.mateu.uidl.data.Map`: `attribution`, `markerActionId`, `markers`, `tileUrl`
- `io.mateu.uidl.data.Menu`: `presentation`
- `io.mateu.uidl.data.PlanningBlock`: `icon`, `summary`
- `io.mateu.uidl.data.PlanningBoard`: `attributeColumns`, `openActionId`, `rangeSelectActionId`, `resizeActionId`
- `io.mateu.uidl.data.PlanningResource`: `attributes`, `icon`
- `io.mateu.uidl.data.Popover`: `trigger`
- `io.mateu.uidl.data.ResponsiveGrid`: `asReorderable`, `reorderable`
- `io.mateu.uidl.data.RestDataSource`: `sample`
- `io.mateu.uidl.data.RestSourceEntry`: `sample`
- `io.mateu.uidl.data.RouteEntry`: `access`
- `io.mateu.uidl.data.RouteLink`: `presentation`
- `io.mateu.uidl.data.UICommand`: `announce`, `announceAssertive`
- `io.mateu.uidl.fluent.AppShell`: `accessKeys`
- `io.mateu.uidl.fluent.Listing`: `dragType`, `preSearch`, `rowStatusField`
- `io.mateu.uidl.interfaces.Actionable`: `presentation`

<!-- api-stability:end -->

The **Internal** column counts types that are `public` only because Java has no module-private:
the reflection helpers in `io.mateu.uidl.reflection`, the layout heuristics in
`io.mateu.uidl.layout`, `IconConverter` (Jackson plumbing of `IconKey`) and `RoutedClassProvider`
(implemented by the code the annotation processors generate), and the machinery behind the
archetypes in core — the CRUD `actionhandlers` / `routeresolvers` packages, the `*Composer` and
`Inferred*` bridges, `CapabilityCrud`, `CrudAdapterHelper`, `FilterCriteriaBuilder`,
`ListingSummarySpec` and `SearchableValues`. They are not part of the promise, the
compatibility check skips them, and they may change in any release. The extension points you
*implement* — `InstanceFactory`, `RouteResolver` / `RouteValue` / `CompiledRouteValue`,
`BeanProvider` — are stable.

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

- **Until the beta** the check is **report-only** (`mateu.api.enforce=false`): the alphas
  change the API in place, and [Migrating from alpha](/reference/migrating-from-alpha/) is the record of it.
- **The blocking configuration is ready** behind one switch: `-Dmateu.api.enforce=true` (the
  `mateu.api.enforce` property of `backend/pom.xml`; the plugin's own `mateu.japicmp.enforce`
  follows it). With it, a binary- or source-incompatible change to the **non-`@Experimental`**
  surface **fails `mvn verify`**, unless it is listed in
  **`backend/api-compat/japicmp-exclusions.properties`** — the reviewed allowlist. Adding an entry is
  how an intentional break (the end of a deprecation period, a major release) gets through; the
  comment block above the list names the release or PR that accepted each group, and the list is
  reset whenever the baseline moves. The [Internal](#stable-and-experimental-api-by-package) types
  are excluded from the check.
- Marking an existing stable API `@Experimental` is itself reported as a removal — japicmp drops the
  annotated element on the new side only — so an API cannot leave the promise silently. The marks
  added by the API freeze review on 3.0-alpha.408/409 API are in the allowlist for that reason, until
  the baseline moves past them.

**Flipping it on at the beta** — one commit, at the beta tag:

1. set `<mateu.japicmp.baseline>` to the last release before the beta (or to the beta itself once it
   is on Maven Central, for the betas that follow);
2. set `<mateu.api.enforce>true</mateu.api.enforce>` in `backend/pom.xml`;
3. empty `japicmp-exclusions.properties` down to the sentinel (its entries described the diff against
   the old baseline), run `mvn verify -pl shared/dtos,shared/uidl,shared/core`, and re-add only the
   breaks that are deliberate.

Run it locally with `mvn verify -pl shared/uidl` (add `-Dmateu.api.enforce=true` to see what would
fail; `-Dmateu.japicmp.skip=true` skips it, e.g. offline — the baseline jar comes from Maven
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
