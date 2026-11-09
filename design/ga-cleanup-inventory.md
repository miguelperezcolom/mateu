# GA clean-up inventory — compatibility kept only for the 3.0 pre-releases

Owner decision for 3.0.0: *"lo importante es la versión que sacaremos. no hace falta soportar
versiones antiguas como las alphas o betas"*. 3.0.0 is the first stable release and keeps no
compatibility with the alphas, betas or release candidates. Batch 1 (#1079) removed the alpha-era
deprecated API; this pass (`cleanup/pre-ga-compat`) removes everything else that existed only so a
pre-release app, server, renderer, file or binary kept working.

Legend: **removed** = gone in this branch; **kept** = stays, with the reason.

## Java public API (uidl, core, adapters)

| Item | Where | Replacement | Status |
|---|---|---|---|
| `@App(accentStrip)`, `@App(accentStripSeed)` (deprecated beta.15, no effect) | `uidl/annotations/App.java` | `@App(accentColor)`; nothing draws a strip | removed |
| `io.mateu.core.infra.AccentStrip` (strip generator, deprecated beta.15) + its test | core `infra/` | — | removed |
| `AppShell`'s pre-`ai` constructor (deprecated beta.50) | `uidl/fluent/AppShell.java` | canonical constructor / `AppShell.builder()` | removed |
| `ProgressReporter(String, boolean)` (deprecated rc.1) | `uidl/data/ProgressReporter.java` | the reporter `LongTask#run` hands over | removed |
| `DashboardLayout` (deprecated alpha.348) | `uidl/data/DashboardLayout.java` (+ .NET `[Obsolete]` MATEU002, Python `DeprecationWarning`) | `ResponsiveGrid` | **kept** — `PageTemplates` still lays a `DashboardLandingPage`'s panels out with it (id `dashboard-panels`); deprecated for authors, removable in 4.0 |
| `AutoLayout`/`AutoPage` Javadoc naming the pre-3.0 setting aliases | uidl annotations | — | removed (the aliases themselves were already gone in Java) |

## Wire (mateu-dtos, wire-schema.json)

| Item | Where | Replacement | Status |
|---|---|---|---|
| `ResultDto` (`Result`), `StepperDto` (`Stepper`) — registered, never produced | `ComponentMetadataDto` subtypes | — | removed; renderers' type lists/gates updated |
| `AppVariantDto.HAMBURGUER_MENU` | dtos + every renderer that accepted it | `HAMBURGER_MENU` | removed |
| `AppDto.accentStrip`, `AppDto.generatedAccentStrip` (always null) | dtos, libs `App.ts`, goldens | — | removed |
| 28 unreachable pre-3.0 DTOs marked `@Deprecated(forRemoval)` since alpha.410 (`JourneyDto`, `JourneyTypeDto`, `JourneyStatusDto`, `JourneyCreationRqDto`, `RemoteJourneyDto`, `ViewDto`, `ViewPartDto`, `ViewMetadataTypeDto`, `PageMainContentDto`, `SingleComponentDto`, `SearchFormDto`, `SortCriteriaDto`, `SortTypeDto`, `ItemsDto`, `ValueDto`, `ListenerDto`, `BindingDto`, `BindingSourceDto`, `TelephonePrefixDto`, `SectionTypeDto`, `ActionTypeDto`, `ActionPositionDto`, `ActionStereotypeDto`, `ActionThemeVariantDto`, `BadgeColorDto`, `BadgeTypeDto`, `BadgeStyleDto`, `BadgeIconPositionDto`) | `backend/shared/dtos` | — | removed |
| `wire-schema.json` | uidl | regenerated with `-Dwire.schema.write=true -Dwire.schema.break=true` | regenerated; `wireVersion` stays `3.0` (no 3.0.0 producer or consumer uses any removed member) |
| Wire version policy (additive within a major, consumers check the major) | spec + all renderers | — | **kept** |
| `MessageDto.undoLabel/undoActionId/undoParameters` (the "legacy" single undo, also sent as an `actions` entry) | dtos, ports, renderers | `actions` with style `undo` | **kept** — not deprecated, still produced by every server this release and read by every renderer; dropping it is a cross-backend wire + conformance change better done on its own (candidate follow-up) |
| `ContentLayoutDto` | dtos | — | **kept** — the .NET/Python `@Aside` path still emits it |

## Endpoints

| Item | Where | Replacement | Status |
|---|---|---|---|
| `POST …/mateu/v3/components/_/action` | .NET `MateuExtensions.cs`, Python `fastapi/__init__.py` (explicit routes); Java: implied by the generated controllers' catch-all `v3/{operation}/**` | `POST …/mateu/v3/sync/{route}` | removed. Callers migrated first: Redwood transport/capture/editor preview, the visual editor's Redwood play, `starters/smoke-test.sh`, the e2e specs, the IT foundations |
| Java catch-all `v3/<anything>/**` | the 5 generated `controller.ftl` + the 5 YAML-mount routings (MVC, WebFlux, Micronaut, Quarkus, Helidon) | `v3/sync/**` (+ the unchanged `v3/sse/**`, manifest, pwa, client-log, documents, bundle) | narrowed |
| `POST …/mateu/v3/ui`, `…/v3/journeys/_/<id>` (pre-3.0 operations only the catch-all still answered) | webflux `GetUiIT`, `CreateJourneyIT` + foundations | — | removed (tests deleted; `RunActionIT` moved to `sync`) |

## YAML and settings aliases

| Item | Where | Replacement | Status |
|---|---|---|---|
| `definition:` on a route entry | Java `RouteRegistry`, .NET `RouteRegistry.cs`, Python `route_registry.py`, `routes-schema.json`/`specs-schema.json`, visual editor `routesModel.ts`, IDE docs | `layout:` | removed; every fixture/demo/test moved to `layout:`. The `RouteEntry.definition` record field / wire key stays (it is the field, not the alias) |
| `modelView:` on a page definition | Java `YamlUidlLoader`, `UidlValidator`; .NET `YamlComponentBuilder`; Python `yaml_preview`, validator; schema; IntelliJ annotator; VS Code `createInViewModel`; visual editor | `viewModel:` | removed. Kept: the dev contract endpoint's JSON field `modelView` (a tooling wire field, not the YAML key) and internal variable names |
| `mateu.layout.inference`, `mateu.page.inference.disabled` | `InferenceSwitches` (Java, .NET, Python) | `…inference.enabled` | already removed in #1079; stale Javadoc/doc mentions removed now |
| `view_model` / `viewModel` dual spelling (ports) | .NET/Python | — | **kept** — not deprecated, the ports' idiom |

## Packaging

| Item | Where | Replacement | Status |
|---|---|---|---|
| Maven relocation poms for the pre-rename ids (`uidl`, `dtos`, `core`, `mvc-core`, `vaadin-lit`, `redwood`, the APs…) + their `mateu-bom` entries + `MateuBomCompletenessTest.everyRelocationPointsAtAPublishedArtifact` | `backend/relocations`, `backend/mateu-bom/pom.xml` | the `mateu-*` artifacts | removed (versions already on Central stay there) |
| Python shim packages `mateu_uidl`, `mateu_dtos`, `mateu_core`, `mateu_fastapi` + `mateu_ui/_compat.py` | `backend/python`, `pyproject.toml`, CI wheel check | `mateu_ui.*` | removed |
| .NET `TypeForwards.cs` (Mateu.Core → Mateu.Uidl forwards for binaries built on alpha.412/426) | `backend/dotnet/src/Mateu.Core` | none needed (same full names) | removed; `api/Mateu.Core.public-types.txt` re-pinned |

## Renderers and data formats

| Item | Where | Replacement | Status |
|---|---|---|---|
| `HAMBURGUER_MENU` accepted | libs `AppVariant.ts`/`appRenderer.ts`, RN `AppRenderer.tsx`, Redwood `shellNav.mjs` + VB chains | `HAMBURGER_MENU` | removed |
| Quill Delta JSON → HTML conversion of rich-text values | libs `richTextValue.ts`, Redwood `richtext.mjs`, RN `richTextValue.ts`, IntelliJ `RichTextValue.kt` | the value is HTML | removed |
| `Result`/`Stepper` in renderer type lists | libs `ComponentMetadataType.ts`, parity gates | — | removed |
| "older server" fallbacks for optional fields (`MenuOption.path` standing in for `prefix`, selection gate, wireVersion absent…) | libs, Redwood, RN, IntelliJ | — | **kept** — every one also covers the field simply being absent (NON_NULL wire, static bundles, custom producers); they are tolerance rules of the wire, not pre-release support |
| IntelliJ `OidcSessions.kt` migration of the old refresh-token account | IntelliJ plugin | — | **kept** — a one-time local storage migration on the user's machine, not a wire or API alias; harmless, removable later |
| The renderers' legacy condition matcher | libs | — | **kept** — a syntax safety net for rule expressions, not tied to a pre-release |
| Mobile hub app compatibility (`app-compat.json`, `minAppVersion`, `mateuVersion`) | RN, IntelliJ hub | — | **kept** — the store app updates over the air together with the renderers; the rule (compatible / recommended / required by release) still holds for 3.0.0 and later |

## Figma pipeline (preview tool)

| Item | Where | Replacement | Status |
|---|---|---|---|
| A Section with an empty content slot absorbs the layers that follow it (libraries older than native slots) | `to-yaml/src/convert.mjs`, `contract.json` `yamlConventions.sections`, docs, tests | drag the fields into the Section's slot | removed (the native fixture's Notes field now sits in its plain `slot:content` frame) |
| `#config` text layer | converter, contract | — | **kept** — the current plugin still writes it for a prop Figma refuses as a property; only the "older library" wording went |
| Text layers read when no property is bound | converter | — | **kept** — also how a detached copy is read |

## Docs

| Item | Status |
|---|---|
| `reference/migrating-from-alpha.md` (+ sidebar entry and 6 links) | removed |
| `stability-and-versioning.md`: "What beta means", "Removed in 3.0.0", "Until the beta…" → 3.0.0 presented as the first stable release; the promise starts at 3.0.0 | rewritten |
| `support-policy.md` pre-release row and note | rewritten (pre-releases unsupported, upgrade to 3.0.0) |
| Python "Upgrading from 3.0-alpha.428" note, Quarkus "Upgrading from alpha.406" note, metadata-suppliers "Renamed in alpha.412", crud-store "Deprecated alias", HAMBURGUER/accentStrip/Quill/`definition:`/`modelView:` mentions | removed / reworded |
| CHANGELOG `[Unreleased] → Removed` | extended with everything above; historic links to the deleted page unlinked |

## japicmp: why exclusions and not "baseline = 3.0.0" today

japicmp needs the baseline jar on Maven Central, and `3.0.0` is not released yet. Pointing the
baseline at an unreleased version would make every build fail to resolve it (or force
`-Dmateu.japicmp.skip=true`, which would leave the other in-flight PRs unguarded until the tag).
So the intended breaks of this branch are recorded as reviewed exclusions against the current
baseline (`3.0-beta.32`), exactly like #1078/#1079 did — `App#accentStrip()`,
`App#accentStripSeed()`, the old `AppShell` constructor and `ProgressReporter(String, boolean)` —
and the policy is documented: once `3.0.0` is on Central, `scripts/bump-example-version.sh` moves
the baseline to it and the exclusion list is reset to the sentinel, so the post-GA promise is
measured from 3.0.0 (stability page, "Java: how the check works"; the header of
`japicmp-exclusions.properties`). The build passes with `-Dmateu.api.enforce=true`.
