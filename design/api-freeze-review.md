# Public API freeze review (pre-beta, 3.0-alpha.410)

Date: 2026-10-10 · Base: `master` = `v3.0-alpha.409` · Branch: `api/freeze-review`

**Goal.** Before the beta, the public surface should be something we are willing to keep. Nothing in
this review breaks an existing user. Every fix is **add + deprecate**:
`@Deprecated(since = "3.0-alpha.410", forRemoval = true)` with a Javadoc that names the replacement,
`[Obsolete("…")]` in .NET, `warnings.warn(DeprecationWarning)` in Python. Nothing was renamed in
place, and **no wire field changed**.

Companion artefacts:

- the generated Stable / Experimental / Deprecated / Internal list on the stability page
  (`doc/src/content/docs/reference/stability-and-versioning.md`, block `api-stability`);
- the "Deprecated in 3.0-alpha.410" table in `reference/migrating-from-alpha.md`;
- the japicmp allowlist `backend/api-compat/japicmp-exclusions.properties`.

---

## 1. Inventory

### Java — `mateu-uidl` (authoring API): 623 public top-level types

| Package | Annotations | Interfaces | Records | Enums | Classes | Total |
|---|---:|---:|---:|---:|---:|---:|
| `io.mateu.uidl.annotations` | 158 | – | – | 11 | – | 169 |
| `io.mateu.uidl.data` | – | 2 | 244 | 52 | 2 | 300 |
| `io.mateu.uidl.interfaces` | – | 94 | 4 | 1 | 7 | 106 |
| `io.mateu.uidl.fluent` | – | 10 | 15 | 8 | 1 | 34 |
| `io.mateu.uidl` (root) | – | – | – | – | 6 | 6 |
| `io.mateu.uidl.di` | – | 1 | – | – | 1 | 2 |
| `io.mateu.uidl.layout` | – | – | – | – | 3 | 3 |
| `io.mateu.uidl.reflection` | – | 1 | – | – | 2 | 3 |

### Java — `mateu-dtos` (the wire): 270 public types

214 records, 49 enums, 4 interfaces, 3 classes. Wire field names are a contract with the renderers.
This review renamed none of them; findings about them are flagged only (see §2.6).

### Java — `mateu-core` archetypes (`io.mateu.core.infra.declarative.orchestrators.*`): 61 public types

The classes you extend (`AutoCrud`, `Crud`, `Wizard`, `Dashboard`, `Foldout`, `CalendarPage`, …)
sit next to the machinery behind them. That machinery is now classified as **Internal**: the CRUD
`actionhandlers` / `routeresolvers`, the `*Composer` and `Inferred*` bridges, `CapabilityCrud`,
`CrudAdapterHelper`, `FilterCriteriaBuilder`, `ListingSummarySpec` and `SearchableValues`.

### Status after this review (generated; `ApiStabilityListTest`)

| | Public types | Stable | Experimental | Deprecated | Internal |
|---|---:|---:|---:|---:|---:|
| Java (uidl + dtos + core archetypes) | 954 | 836 | 43 | 40 | 35 |

There are also **experimental members** on 35 otherwise-stable types (for example `Calendar.view`,
`Wizard.stepSkippable`, `@App.accessKeys`). The stability page lists them all.

### Configuration properties (`mateu.*`, user-facing)

| Area | Properties |
|---|---|
| Security | `mateu.cors.allowed-origins`, `mateu.cors.allow-credentials`, `mateu.mcp.enabled`, `mateu.remote.allowed-hosts`, `mateu.agent.companion.allow-origins` |
| Runtime | `mateu.environment`, `mateu.self-base-url`, `mateu.remote.timeout-seconds`, `mateu.remote-menu.descriptor-ttl-ms`, `mateu.static-assets.caching`, `mateu.client-log.enabled`, `mateu.actions.strict`, `mateu.sources.mock`, `mateu.micronaut.replace-json-mapper` |
| i18n | `mateu.i18n.fallback`, `mateu.i18n.raw` |
| Dev mode | `mateu.dev`, `mateu.dev.specs-dir` |
| Errors | `mateu.errors.detailed` (env `MATEU_ERRORS_DETAILED`) |
| JVM switches | `-Dmateu.layout.inference`, `-Dmateu.page.inference.disabled` |
| AI agent (experimental) | `mateu.agent.cli.*` (9 keys) |
| Build plugin (`mateu-bundle-maven-plugin`) | `mateu.bundle.*` (14), `mateu.openapi.*` (5), `mateu.server.*` (10) |

**Inconsistencies, flagged only:**

- Most properties are kebab-case, but the bundle and openapi plugin parameters are camelCase
  (`mateu.bundle.specsOnly`, `mateu.server.basePackage`). That is the Maven plugin parameter
  convention, so these are left as they are.
- `-Dmateu.layout.inference` is opt-in, while `-Dmateu.page.inference.disabled` is opt-out. The two
  switches are phrased in opposite senses. **Owner decision:** keep both forms, or add
  `mateu.page.inference` (default `true`) and deprecate `.disabled`.

### YAML authoring surface (the generated schemas)

| Schema | Definitions | Property declarations | Distinct keys |
|---|---:|---:|---:|
| `uidl-schema.json` (component catalogue) | 252 | 1992 | 515 |
| `specs-schema.json` (every `specs/ui/**` kind) | 258 | 2065 | 536 |
| `routes-schema.json` | 3 | 32 | 32 |
| `sources-schema.json` | 3 | 20 | 19 |

These schemas, together with `actions`, `mount` and `types`, are generated from the records, so the
keys are the record components. Any Java finding below applies to YAML too. Two things to know:

- `HAMBURGUER_MENU` stays accepted as `variant:` because the enum constant still exists.
- Two YAML aliases already exist and are documented: `definition:` → `layout:` and `view_model:` →
  `viewModel:`.

### .NET — `Mateu.Uidl`: 337 public types

| Kind | Count |
|---|---:|
| Attributes | 88 |
| Interfaces | 43 |
| Records | 156 |
| Classes | 30 |
| Enums | 20 |

This review adds 1 more: the `AppVariant` constants.

Some authoring types live in `Mateu.Core` (`CodeAuthoring.cs`): `IRouteEntrySupplier`,
`IMenuSupplier`, `IAppSupplier` and `AppShell`. **Owner decision:** whether to move them to
`Mateu.Uidl` before the NuGet beta.

### Python — `mateu_uidl`

Before this review, `__init__.py` bound 217 names and `__all__` listed 191 of them. By kind:

| Kind | Count |
|---|---:|
| Decorators | 52 |
| `Annotated` markers | 50 |
| Base classes | 16 |
| Mixins / interfaces | 27 |
| Dataclasses | 47 |
| Enums | 12 |

After this review `__all__` has **209** names. A new test keeps `__all__` in step with the bindings.

---

## 2. Findings and fixes

### 2.1 Typos in public names

| Old | New | How |
|---|---|---|
| `AppVariant.HAMBURGUER_MENU` | `AppVariant.HAMBURGER_MENU` | `HAMBURGER_MENU` already existed (alpha.409). `HAMBURGUER_MENU` is now `@Deprecated(forRemoval)`. AUTO now picks `HAMBURGER_MENU`. On the wire the variant still travels as `HAMBURGUER_MENU`; `AppMapper.toDto` maps both. The renderers already accept both spellings: Vaadin `appRenderer.ts`, Redwood `shellNav.mjs`, and React Native and IntelliJ, which don't branch on it. So no renderer or bundle changed. |
| .NET `[App(Variant = "HAMBURGUER_MENU")]` (string) | `AppVariant.HamburgerMenu` constant | New `Mateu.Uidl.AppVariant` constants. `AppVariant.ToWire` sends the right spelling under the wire name, like Java does. The old string still works. |
| Python `@app(variant="HAMBURGUER_MENU")` (string) | `AppVariant.HAMBURGER_MENU` (a `str` enum) | The old string now emits a `DeprecationWarning` that names the replacement. `AppVariant.to_wire` behaves the same way as in .NET. |

Other candidates were checked by splitting every identifier in uidl into words and running a
dictionary check:

- **Spanish identifiers** (`buscarHaciaAbajo`, `jerarquia`, `laImplementa`, `tipoEnCurso`) are all
  **package-private** in `uidl.reflection.GenericTypeHierarchyResolver`. They are not public. Left
  alone.
- **`IconKey.Palete`, `Megafone`, `TrendindDown`, `Funcion`** mirror upstream Vaadin icon names
  (`vaadin:palete`…), and the correct spellings exist next to them. Left alone.
- **`@DetailFormCustomisation`** is the only public identifier in British spelling. It is legitimate
  English and is used in demos and docs. Left alone; listed for the record.
- No `Deleteable`-style misspellings remain. The legacy `Deleteable` marker was already deleted in
  alpha.

### 2.2 Naming inconsistencies

Each item says whether it was fixed or left alone, and why.

- **`BadgeSupplier` ↔ `@BadgeInHeader`.**
  - This is the only supplier/annotation pair whose names do not line up. `@Badge` is a different
    thing: a field stereotype.
  - Left alone, because renaming the interface would churn every implementer for a cosmetic gain.
  - Python gained the alias `BadgeInHeader = HeaderBadge`, so the Java name works there.
  - **Owner decision:** add `HeaderBadgesSupplier extends BadgeSupplier` and deprecate
    `BadgeSupplier`?
- **Other `XxxSupplier` interfaces with no `@Xxx` annotation** are fine, because they have no
  annotation twin by design: `VisibilitySupplier` (↔ `@Hidden`), `RequiredSupplier` (↔ `@NotNull`)
  and `ButtonsSupplier` (↔ `@Button`; a plural supplier for a singular annotation).
- **`isX` / `getX` on records.**
  - `DateRange.isEmpty`, `NumberRange.isEmpty` and `LayoutDelta.isEmpty` are `@JsonIgnore`'d
    helpers that round-trip, so they are fine.
  - **`Button.getActionId()`** sits next to the record accessor `actionId()` and returns a
    *derived* value (it falls back to the camelcased label). Jackson serialises both under
    `actionId`, so it may be what the wire relies on. Left alone and flagged. **Owner decision:**
    rename it to `effectiveActionId()` after checking the wire, or keep it.
- **`Id` vs `ID`, `Url` vs `URL`.** Consistent (`Id`, `Url`) across uidl. No change.
- **`@HiddenInCreate` / `@HiddenInEditor` / `@HiddenInList` / `@HiddenInView`.**
  - "Create" is a verb, while "Editor", "List" and "View" are nouns.
  - Left alone, because all four are widely used and the meaning is clear.
- **Built-in action ids mix kebab-case and camelCase.**
  - Kebab-case: `save-and-next`, `update-row`, `cancel-new`, `_notifications-list`.
  - camelCase: `selectCollectionItem`, `switchToGrid`, `toggleEndPanel`, `openCalendarDay`.
  - Both styles use the imperative mood.
  - These ids are a wire/renderer contract, so they are **flagged only**. **Owner decision:** pick
    camelCase for new ids from the beta on.
- **Enum constant casing.**
  - lower-case: 45 enums. This is dominant for data/wire enums (`GridLayout.table`, `HeroTone.auto`).
  - UPPER: 12 enums. This is dominant for annotation-attribute enums (`PageWidthStyle.FIXED`,
    `BannerTheme.INFO`, `AppVariant`, `WizardProgressStyle`).
  - Pascal: 7 enums. These are wire discriminators: `UICommandType`, `TriggerType`, `RuleAction`,
    `IconKey`.
  - Each family is internally consistent, so there are no glaring outliers. No churn.
  - **Mixed-case enums to flag:**
    - `BackLink.{BREADCRUMBS, screen, title}`
    - `PageType` and `WizardLayoutMode`: both UPPER, with lower-case words only in Javadoc. Fine.
- **Singular/plural repeatable containers.** These are consistent: `@Actions`, `@Rules`,
  `@Triggers`, `@Validations`, `@Metas`, `@Scripts`, `@RestSources`, `@Links`. The one irregular
  name is `@SubscribesTo`, the container of `@SubscribeTo`. It reads naturally, so it is kept.

### 2.3 Leftovers (public types with zero use)

How these were found:

1. Every public uidl type was searched for in core, the adapters, demos, the e2e SUTs, starters and
   docs.
2. Every annotation was checked for a reader in core or the annotation processors. Repeatable
   containers are read through `getAnnotationsByType`.
3. Every DTO was checked for whether a live DTO reaches it.

| Deprecated (forRemoval) | Why | Replacement named |
|---|---|---|
| `annotations.ActionType` (enum) | never referenced | `@Toolbar` / `@Button` / `@Hidden` |
| `@GenericClass` | no reader; the docs claimed it worked | declare the generic type (`List<MyDto>`) |
| `fluent.ActionPosition`, `ActionStereotype`, `ActionThemeVariant` | empty enums (like the `fluent.ActionType` removed earlier) | `ButtonStyle` / `ButtonColor` / `ButtonVariant` |
| `data.Binding`, `data.BindingSource` | never read | binding by convention; `state.*` / `appState.*` |
| `data.ClientSideEvent` | never read | `UICommand.dispatchEvent` + `@SubscribeTo` |
| `data.Destination` | never read | `UICommand.navigateTo` / return a `URI` |
| `interfaces.ListAdapter` | the pre-capability listing contract, never read: a **duplicated concept** | `Listing<Row>` |
| `layout.ColumnLayoutSelector` | its role ended when `GridLayout.auto` became "table" | declare `gridLayout()` |
| 28 wire DTOs: `ActionPositionDto`, `ActionStereotypeDto`, `ActionThemeVariantDto`, `ActionTypeDto`, `BadgeColorDto`, `BadgeIconPositionDto`, `BadgeStyleDto`, `BadgeTypeDto`, `BindingDto`, `BindingSourceDto`, `ItemsDto`, `ValueDto`, `JourneyCreationRqDto`, `JourneyDto`, `JourneyStatusDto`, `JourneyTypeDto`, `ListenerDto`, `PageMainContentDto`, `RemoteJourneyDto`, `SearchFormDto`, `SectionTypeDto`, `SingleComponentDto`, `SortCriteriaDto`, `SortTypeDto`, `TelephonePrefixDto`, `ViewDto`, `ViewPartDto`, `ViewMetadataTypeDto` | the pre-3.0 wire; no live DTO references them and core never builds them | "No replacement" (stated explicitly) |

**Duplicated concepts already deprecated:** `DashboardLayout` and `ContentLayout` (→
`ResponsiveGrid`, Java `forRemoval = false`). Their .NET versions are now `[Obsolete]` and their
Python versions now warn, matching Java.

**Public, but should be internal: classified, not moved.** Moving these would be add + deprecate
for zero user benefit, so they are documented as **Internal** on the stability page and excluded
from japicmp:

- `io.mateu.uidl.reflection.*`
- `io.mateu.uidl.layout.*`
- `IconConverter`
- `RoutedClassProvider`
- the core archetype machinery (§1)

The SPIs users *implement* stay stable: `InstanceFactory`, `RouteResolver` / `RouteValue` /
`CompiledRouteValue`, `BeanProvider` / `MateuBeanProvider`. Demos and docs use them.

**Kept, though they look odd:**

- `@KeycloakSecured`: a product name in a neutral API. It is read by `IndexPage` and documented.
  **Owner decision:** generalise it to an `@Oidc` before the beta, or keep it.
- `@MainFilter`: still read by `PageListingBuilder`.

### 2.4 `@Experimental` coverage

Everything from the alpha.409 pattern-gap / PMS-parity wave is now marked. These APIs are days old,
each has exactly one demo (`demo-vb-pms` or the pattern-gap showcase), and most will be reshaped by
the first real adopter. The `value` of every mark names the feature and release.

**Types (32 new marks):**

| Feature | Marked types |
|---|---|
| Action panel | `ActionPanel`, `ActionPanelCategory`, `ActionPanelItem` |
| Matrix grid | `MatrixGrid`, `MatrixCell`, `MatrixColumn`, `MatrixRow`, `MatrixSection` |
| Map markers | `MapMarker` |
| Drag rows to a drop zone | `DropZone`, `@DragRows` |
| Docked panels | `DockedPanel` |
| Archetype display options | `Toggle`, `CrudDisplay`, `WizardDisplay`, `GeneralOverviewDisplay` |
| Record switcher | `RecordSwitcher`, `SwitcherType`, `RecordSwitcherSupplier` |
| Hero tone | `HeroTone` |
| Card menus | `MenuDisplay`, `MenuPresentation` |
| Calendar views | `CalendarDay`, `CalendarView` |
| Hover popovers | `PopoverTrigger` |
| Screen-reader announcements | `Announcement` |
| Action catalogue | `ActionCatalog`, `ActionCatalogSupplier` |
| Not-found page | `NotFound` |
| Row tones | `@RowStatus` |
| Listing cell tooltips | `@Tooltip` |
| Wizard drafts | `Draftable` |

**Members:**

| Owner | Marked members |
|---|---|
| `@App` | `accessKeys` |
| `@Menu` | `display`, `image` |
| `@Section` | `editAction`, `addAction`, `viewMoreAction` |
| `@WelcomeBanner` | `tone` |
| `@WizardCompletionAction` | `availableFromStep` |
| `UICommand` | `announce`, `announceAssertive` |
| `ResponsiveGrid` | `reorderable`, `asReorderable` |
| `Actionable` | `presentation` |
| Record components | `HeroSection.tone`; `Calendar.view` / `views` / `days` / `dayActionId`; `CalendarEvent.endDate` / `startTime` / `endTime`; `Map.markers` / `markerActionId` / `tileUrl` / `attribution`; `PlanningBoard` / `PlanningBlock` / `PlanningResource` interaction fields; `Popover.trigger`; `FoldoutPanel.summary`; the `presentation` of `Menu` / `RouteLink` / `FieldLink`; `RouteEntry.access`; `Listing.preSearch` / `rowStatusField` / `dragType`; `AppShell.accessKeys` |
| Archetype methods | `Wizard.display` / `stepSkippable` / `beforeStepNavigate`; `SmartSearchPage.preSearchContent`; `Welcome.heroTone`; the `CalendarPage` views/days hooks; `DataManagement` docked panels; `GeneralOverview.info` / `infoWidth` / `display`; `Crud.display` / `nextIdAfter` / `saveAndNextLabel`; `Dashboard.reorderable`; `Foldout.panelSummary` |

**Deliberately left stable** (older, simple, or already battle-tested):

- `UserFacingException` (the GA error boundary)
- `UICommand.downloadFile`
- the `AppShell` flags that mirror long-standing `@App` attributes (`themeToggle`, `commandCenter`,
  `chromeless`)
- `ResponsiveGrid`, `GridTrack`, `Slotted` (coherence plan, weeks in use)

### 2.5 Parity (Java / .NET / Python)

**Fixed cheaply:**

| Concept | Java | .NET | Python | Fix |
|---|---|---|---|---|
| App variant | `AppVariant` enum | string only | string only | .NET `AppVariant` constants; Python `AppVariant` `str` enum; both normalise to the Java wire value |
| Header badge | `@BadgeInHeader` | `[HeaderBadge]` | `HeaderBadge` | Python alias `BadgeInHeader` |
| Page width enum | `PageWidthStyle` | `PageWidthStyle` | `PageWidth` | Python alias `PageWidthStyle` |
| Exports | — | — | 15 public names missing from `__all__` (`app_context`, `edit_in_drawer`, `overline`, `title_placeholder`, `auto_page`, `action_options`, `PrimaryColumn`, `Aside`, `LinkTo`, `NavLink`, `CollectionDetail`, `GeneralOverview`, `GlobalSearchResult`, `GlobalSearchSupplier`, `LinkSupplier`) | added, plus a test |
| Deprecations | `@Deprecated` `DashboardLayout` / `ContentLayout` | doc-comment only | docstring only | `[Obsolete]` / `DeprecationWarning` |

**Mismatches left for the owner** (a different model, not a rename):

1. **Menus.** Java `@Menu` on a field. .NET `[MenuItem]` / `[MenuGroup]` on methods. Python
   `@menu_item` / `@menu_group`.
2. **KPI.** Java `@KPI` takes no argument. .NET `[Kpi(title)]` requires a title. Python `kpi` is a
   lowercase class used as both decorator and marker.
3. **Wizard progress style.** Java has the `WizardProgressStyle` enum. The ports take a string, and
   Python does not document `rail`.
4. **Python `Size`.** It is a Bean-Validation length constraint, but in Java and .NET `Size` is the
   sizing intent. This is a real semantic clash. **Owner decision:** add `Length` and deprecate the
   Python `Size` constraint.
5. **Edit in drawer.** Java has an overridable `Crud.editInDrawer()`, .NET a virtual property,
   Python the `@edit_in_drawer` decorator.
6. **Action options / shortcut.** Java takes them as `@Action` attributes. The ports have
   `[ActionOptions]` / `[Shortcut]` and `@action_options` / `@shortcut`. This difference is
   deliberate and already documented.
7. **`@toolbar` / `[Toolbar]`.** The ports' docstrings mention them, but they do not exist.
8. **Wizard completion.** Three mechanisms. `available_from_step` is an `int` in Python and a
   `String` in Java.
9. **Toast variants.** Java `NotificationVariant {…, primary}` vs .NET/Python
   `MessageVariant {…, Info}`.
10. **Missing members and attributes.**
    - `BannerTheme.NONE` is missing in .NET and Python.
    - .NET `[Hidden]` requires an argument.
    - Python has no `read_only_unless` decorator.
11. **Java-only APIs.** `@WizardLabels`, `@WizardLayout`, `@Help`, `@Badge`/`@Status`, `@MainFilter`
    and `@Notice` have no port equivalent.
12. **Port-only APIs.** `[Secured]` / `@secured` and `[Step]` / `Step` have no Java twin. `Step`
    also collides with the Java/.NET `Step` record.

### 2.6 Wire (flagged only — wire names are a renderer contract)

- `AppVariantDto.HAMBURGUER_MENU`. This is the wire spelling, and it stays.
  - Every first-party renderer already accepts `HAMBURGER_MENU` too, so a future wire minor could
    send the right spelling once third-party renderers have had a release to catch up.
  - **Owner decision:** whether to do that in 3.x, and when.
- **DTO constructors.** alpha.409 added components to `AppDto`, `CrudlDto`, `HeroSectionDto` and
  `PageDto`. That is additive on the wire, but it replaces the Java canonical constructor, which is
  binary-incompatible. Every future wire addition will do the same.
  - **Owner decision:** do one of the following before flipping enforcement:
    - **(a)** declare DTO constructors outside the promise (build DTOs through their builders) and
      exclude `io.mateu.dtos.*` constructors from japicmp; or
    - **(b)** keep the previous canonical constructor as a secondary constructor on each addition.
  - Today the four alpha.409 cases are in the allowlist.

### 2.7 Fixed while reviewing

`HeroSection` and `FoldoutPanel` lost their alpha.408 constructors in alpha.409, when `tone` and
`summary` were added. Both constructors are restored, so code compiled against alpha.408 links
again. The fluent `Listing` and `PageView` constructor changes are in the allowlist instead:
`Listing` is built through its builder, and `PageView` is produced by core.

---

## 3. Stability policy page

`reference/stability-and-versioning.md` now:

- defines **what "beta" means**:
  - stable API changes only through deprecation, with at least one release of overlap (deprecated
    in `beta.N`, removable in `beta.N+1` at the earliest; the one-minor rule from `3.0.0`);
  - experimental API can change in any release;
  - the wire stays additive.
- carries the **generated** package table and the full experimental type/member lists. A test fails
  when the page drifts from the code. Regenerate with
  `mvn -pl shared/uidl test -Dtest=ApiStabilityListTest -Dmateu.api.write=true`.
- documents the **Internal** classification and the beta enforcement switch.

## 4. japicmp

- The baseline moves `3.0-alpha.407` → **`3.0-alpha.408`**, compared under the `mateu-*` artifact
  ids. `3.0-alpha.409` was tagged today but **is not on Maven Central yet**: when it lands, bump
  `<mateu.japicmp.baseline>` and drop the allowlist groups that only described 408→409.
- **Blocking switch:** `-Dmateu.api.enforce=true`, or flip `<mateu.api.enforce>` in
  `backend/pom.xml`. `mateu.japicmp.enforce` follows it. With the allowlist,
  `mvn verify -pl shared/dtos,shared/uidl,shared/core -Dmateu.api.enforce=true` **passes** against
  alpha.408. Before the allowlist, the same run failed on the alpha.409 DTO constructors, which
  shows that it really blocks.
- The allowlist has 78 reviewed patterns plus the sentinel, in three commented groups:
  - the new `@Experimental` marks on API that is already released;
  - the alpha.409 DTO constructors;
  - the alpha.409 fluent `Listing` / `PageView` constructors.
- A gotcha documented in the allowlist header: japicmp drops an `@Experimental` element on the
  **new** side only. So a fresh mark on released API reads as its removal.
- The Internal types are excluded per module in the poms (`combine.children="append"`).
- How to flip enforcement on at the beta is a 3-step recipe on the stability page.

## 5. Tests added

| Test | What it pins |
|---|---|
| `DeprecationsNameTheirReplacementTest` (uidl) | every `@Deprecated` in uidl, dtos and the core archetypes has `since` and a Javadoc `@deprecated` that links/codes a replacement or says "No replacement" |
| `ApiStabilityListTest` (uidl) | the stability page's generated block equals what the code marks |
| `ApiFreezeTests` (.NET) | the wire value of `AppVariant.HamburgerMenu`; the old string keeps working; every `[Obsolete]` in `Mateu.Uidl` names a replacement |
| `test_api_freeze.py` (Python) | the enum / wire value; the old string warns naming `AppVariant.HAMBURGER_MENU`; the deprecated layouts warn; the aliases; `__all__` covers every public binding |

`LayeringTest` and `NameCollisionsTest` still pass. No new simple-name collision was introduced:
`AppVariant` is new only in the ports.

## 6. Deliberately left alone

- Every wire field and discriminator.
- `IconKey` upstream spellings.
- `@DetailFormCustomisation` (British spelling).
- `Button.getActionId()`.
- `@HiddenIn*` naming.
- Built-in action id casing.
- Enum casing families.
- `@KeycloakSecured`.
- Moving internal types to `internal` packages: they are classified instead.
- Demos still using `HAMBURGUER_MENU`. They compile with a deprecation warning, and other agents
  are working in `demo/`.

## 7. Decisions for the owner

1. **DTO constructor policy** (§2.6): exclude them from the promise, or keep old constructors on
   every wire addition.
2. Whether to switch the wire to `HAMBURGER_MENU` in a 3.x minor.
3. Python `Size` clash: add `Length` and deprecate the constraint.
4. `BadgeSupplier` vs `@BadgeInHeader`: add `HeaderBadgesSupplier`?
5. `Button.getActionId()` → `effectiveActionId()`?
6. `@KeycloakSecured`: generalise it before the beta?
7. Built-in action id casing for new ids (camelCase).
8. `mateu.page.inference.disabled` vs `mateu.layout.inference` polarity.
9. .NET code-authoring types living in `Mateu.Core`.
10. The port-only `[Secured]` / `[Step]`, and the menu/KPI/wizard-completion model differences
    (§2.5).
11. Bump the japicmp baseline to alpha.409 once it is on Central.
