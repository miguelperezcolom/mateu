# Visual editor — execution plan (pausable / resumable)

How we build the Mateu **visual editor** to the model agreed in `design/visual-builder-vb-mapping.md`
(follow Oracle Visual Builder's *authoring surfaces*, keep Mateu's *model*, at **€0**). Long task, done
in **phases we can stop and resume**. The **Status section at the bottom is the live state**; this doc
is the sequence, the rules, and each phase's done-criteria.

This is the concrete build-out of coherence-plan ideas **#12** (visual builder as the on-ramp) and **#1**
(JSON canonical + client-side expander); the full €0 loop (Phase 7 here) depends on coherence **Phase 6**.

## What already exists (baseline, do not rebuild)

- **Shared web editor** `frontend/web/monorepo/apps/visual-editor` (TS/Lit, ~3k LOC): palette · canvas
  (WYSIWYG via the reserved `__preview__` action) · properties · outline · routes/app/mount editors.
  Build green. **Pointer drag-and-drop with precise drop + reposition is already done** (the app
  README's "Next: drag-drop" is stale).
- **IntelliJ host** `frontend/app/intellij-plugin/.../visualeditor` (JCEF FileEditor for `specs/ui/*.yaml`,
  in-plugin HTTP server, message bridge) + `.../schema` (`specs-schema.json` IntelliSense) + `.../contract`
  (binding annotator that resolves the ViewModel via PSI and flags dangling `fieldId`/`actionId`).
- **VSCode extension** `frontend/app/vscode-extension` (CustomTextEditor hosting the same bundle + backend proxy).
- **Project awareness** (`host/hostBridge.ts listFiles()`, `model/projectIndex.ts`, `__contract__` pickers).

**The gap is not "build an editor" — it is: (a) nobody has live-verified the IDE hosts end-to-end, and
(b) the surfaces that make it feel like VB (behaviour/flow, services, model sync, quick starts) aren't wired.**

## The four pillars (guardrails — every phase honours them)

1. **Inferred by default, explicit as override** → edit **deltas** (`pageModel.ts` layoutDelta); snapshot
   only as last resort (a snapshot freezes the screen out of inference).
2. **Renderer-neutral** → work against the schema-derived catalog (`uidl-schema.json`) + the wire model,
   never a specific design system's components.
3. **ViewModel optional** → the classless/data path (definition-only routes, `actions:` with `restAction`,
   `Steps` in YAML, REST-source contract) is first-class and is the €0 path; editing a class is an
   **IDE-only bonus** when one exists.
4. **Zero-cost is a first-class output** → nothing we add may *require* an always-on/paid backend; preview
   is a **configurable source** (remote / local / mock / client).

## Execution rules (every phase)

1. **Additive-first, non-breaking.** No change breaks existing YAML, the renderers, or the wire. New editor
   surfaces are opt-in.
2. **Small PRs, gated.** Gate: the editor **`vite build` green**, `libs/mateu`/editor **vitest green**,
   backend/port suites green where touched, e2e/probe where user-visible.
3. **Tests mandatory, per phase.** Pure editor logic → **vitest** (model ops, diffing, flow lowering).
   Cross-producer/parity invariants → a **backend guard test** (like `UidlSchemaTest`). User-visible IDE
   behaviour → a **host probe / e2e** run against a real backend. A phase is not done without them.
4. **Verify independently.** Re-run builds/tests myself; **live-verify inside a real host** (IntelliJ
   `runIde`, VSCode Extension Dev Host) — env-gated verification is documented, never faked.
5. **Ship demoable increments.** The editor is a static bundle; each phase is demoable in a browser and in
   at least one IDE host.
6. **Full parity where wire-visible.** Anything touching the wire/authoring model gets Java + .NET + Python
   coverage (e.g. the parity guard); editor-only work is single-implementation (the shared bundle covers
   browser + both IDEs).
7. **Surface the forks.** Each open decision gets a sensible reversible default + a note; the maintainer can
   course-correct at any checkpoint.

## Resume protocol

- **Where are we?** = the **Status** section below + merged PRs on master + the latest demo/alpha.
- Each phase carries its scope + done-criteria. To resume: read the in-progress phase, check its merged
  PRs, continue its next PR. Sub-steps land as PRs referencing the phase.

## The sequence (foundation + verifiability first)

| Phase | Covers | Depends on | Done when |
|---|---|---|---|
| **0. Guards** | Authoring↔wire **parity guard** (per component, wire knob ⇒ authoring counterpart, allowlist for derived e.g. `observed`; close the known holes `FormFieldDto.rightAligned/.bold`/field `.badges`). **Palette completeness guard** (exposes full authorable catalog minus `EXCLUDED`; each insertable type yields a default node that renders under `__preview__`). | — | both guards green in CI (Java + ported where wire-visible); the FormField holes are either exposed on the authoring record or explicitly allowlisted with a reason. |
| **1. IDE hosts, live** | Live-test + harden **IntelliJ JCEF** and **VSCode** end-to-end against a demo backend: load a `specs/ui/*.yaml`, render via `__preview__`, select, edit a prop, **save to disk**, verify `listFiles()` responders + the binding annotator fire. | 0 | a documented, repeatable run in **both** hosts: open → render → edit → save round-trips; a host probe asserts it (headless where possible). Foundation for everything below. |
| **2. Preview source** | A **preview-source selector** with modes `remote` / `local` (embedded Mateu — reuse `MateuVisualEditorServer`) / `mock` (MSW + fixtures) / `client` (stub → Phase 7). **AI-assisted fixture generator** (inspect ViewModels / REST sources → MSW handlers). | 1 | you can preview with **no paid/remote backend** via `local`+`mock`; the selector persists per project; recipes documented per mode. |
| **3. Behaviour / flow editor** *(marquee)* | An **action-chain-style editor** authoring declared-flow **`steps`** on an action/trigger (Navigate/Emit/CloseOverlay/RunAction/MarkClean·Dirty; grow verbs as demand pulls), `RunAction` **delegates** to a named `@Action`. Trigger wiring (on-load / on-click / on-event). **Menu-leaf "Action"** (`RuleLink` `RunAction`) surfaced in `app-editor`. First: **verify classless `Action.steps` end-to-end** (tests + `__preview__`). | 1 | a button/menu can run a bounded flow authored visually, **classless**, previewed; JS is present only as a relegated "custom step"; vitest on flow lowering; a demo. |
| **4. Data & services** | A **`sources.yaml` (Services) editor** (name → url/auth/paths/proxy/fields), the data-native contract source. **Binding validation** (reject unknown `fieldId`/`actionId` from `__contract__`/source) + **expression autocomplete** (`state.`/`data.` members). Read-only **"state available" inspector**. | 1 (3 for RunAction targets) | a classless page can bind to a named source with validated refs + expression help; no VB-style Variables subsystem. |
| **5. Layout ↔ ViewModel sync** | `modelView:` **picker** (pure-YAML, all hosts). **ViewModel→layout** (add declared members). **layout→ViewModel diff** + per-item **"Create in ViewModel"** scaffolding (field of inferred `dataType` / `@Action` stub) as **IntelliJ quick-fixes** off the existing annotator — **ask, never auto**; degrades gracefully with no class / no IDE. | 1 | in an IDE host: pick a VM, drop its members, and create a missing field/action in the class from a diff; browser keeps the picker + VM→layout half. |
| **6. Quick Starts & templates** | **New-from-template** (Mateu archetypes / the `mateu-screen` scaffolder). Contextual **Quick Starts** ("Add data / Turn into listing / Wire an action") editing YAML (+ model when in an IDE), **AI-assisted** where it adds value. | 3,4,5 | starting a screen from a template + at least two contextual quick-starts, demoed. |
| **7. Zero-cost loop** | **Static export** of the authored bundle + **client-side render** with no backend (`client` preview mode becomes real). | coherence **Phase 6** (client expander) | author visually → export static → serve on a free CDN tier, **no backend**; a static demo. Blocked until coherence Phase 6 lands — tracked, not hidden. |
| **8. Polish** | "**Surround with**" + explicit insert before/inside/after; complex/nested-prop editors; interactive **Live** toggle (un-inert events against the preview source); custom components (`ComponentAdapter`) in the palette. | 1 | incremental; picked up as bandwidth allows. |

Phases **0 and 1 can run in parallel** (0 is backend-only, 1 is host-only). Everything user-facing ships
through Phase 1.

## Sequencing against the coherence plan (DSL churn)

The coherence plan will keep changing the DSL (Phase 3 layout/grid, Phase 4 archetypes→**templates**,
Phase 5 **vocabulary renames**, Phase 6 JSON/expander, Phase 7 tables/custom) — and it schedules the
visual builder itself late (its Phase 8). So we **do not** start the whole plan at once. We **sequence by
DSL exposure**, and — crucially — **Phase 0's parity guard is the safety net that makes tracking a moving
DSL safe**: when coherence changes the model, the guard fails loudly and pinpoints the broken authoring
surface. A live editor (Phase 1) also **pressure-tests** those DSL changes as a real authoring consumer.

- **Start now (immune to churn, and de-risk it):** Phase 0 (guards — *helps* coherence catch drift),
  Phase 1 (host plumbing — agnostic to component shapes), Phase 2 (transport/config). Plus the **stable
  parts** of Phase 3 (trigger wiring, menu-leaf "Action") and Phase 5 (the `modelView:` picker, VM→layout).
- **Gate explicitly on a coherence phase:** the **deep verb palette** of Phase 3 → after coherence Phase 2
  stabilises; **Phase 6 (templates)** → after coherence **Phase 4**; **Phase 7 (€0 loop)** → after
  coherence **Phase 6**; **Phase 8 layout-mutation** ("surround with", complex-prop canvas) → after
  coherence **Phase 3** settles.
- **Two operational safeguards:** (a) **avoid file collisions with the coherence thread** — Phases 0/1
  touch backend *test* files and the *editor app / IDE plugin*, disjoint from coherence's layout/wire
  edits, so the phases we start now barely overlap; (b) **lean on coherence's own additive-first +
  deprecation-alias rule** so vocabulary renames (Phase 5) never break us in-flight.

## Cross-cutting principles (the "feel")

Don't invent — reuse the catalog (`uidl-schema.json`), the wire model, the archetypes, and the hooks that
already exist (`__preview__`, `__contract__`, the annotator, `projectIndex`). The editor edits **UIDL as
data**; behaviour is bounded declared **Steps** delegating to typed `@Action`s; raw JS is a relegated
escape. Same capability as VB, deployable and operable at **€0**, coupled to no design system.

## Status

- **Alignment + map captured** (`design/visual-builder-vb-mapping.md`). This plan drafted + approved.
  Sequencing-vs-coherence agreed: start 0/1/2 now, gate the DSL-coupled phases.
- **Phase 0 — Palette completeness guard: DONE.** `apps/visual-editor/src/model/paletteCompleteness.test.ts`
  (5 tests) pins the palette exposes the full ~125-component authorable catalog = every schema `type`
  const minus a sanctioned `PLUMBING` list, anchors present, no plumbing leaks, every component grouped,
  and `createNode` yields a valid default node (type set, containers get `content[]`, required scalars
  seeded). `createNode` hardened with generic required-scalar seeding. Full app suite green (76 tests) + tsc.
- **Phase 0 — Parity guard: DONE (independently re-run green).**
  `backend/shared/core/src/test/java/io/mateu/core/application/AuthoringWireParityGuardTest.java` — enumerates
  the component DTOs from `ComponentMetadataDto` `@JsonSubTypes`, pairs each `<X>Dto`→`<X>` record, and
  asserts every DTO field is covered by the record ∪ the **envelope** (`ServerSideComponentDto` +
  `ClientSideComponentDto`, crediting `id/style/cssClasses/slot/…`) ∪ renames ∪ an explicit allowlist. It's
  a **ratchet**: a new unmatched field, or a DTO losing its record, fails with a named message. Renames
  needed: `Crudl`→`Listing`, `Page`→`PageView` (PageDto was falsely pairing the pagination `Page<T>`),
  field `fieldId`→`id`. **Outcome: the allowlist is entirely DERIVED, ZERO real HOLEs** — the earlier
  `rightAligned`/`bold`/`badges` suspicions are all server-computed. (`FormField.min/max` is the *opposite*
  direction — an unwired authoring knob, a no-op — explicitly out of scope, documented in the test.) DTOs
  with no authoring record pinned: `AppDto`, `ResultDto`, `StepperDto`. Verified: `mvn -pl shared/core test
  -Dtest=AuthoringWireParityGuardTest -Djacoco.skip=true` → Tests run: 1, BUILD SUCCESS.
- **Phase 1 — IDE hosts: IN PROGRESS, big step.** **Critical bug fixed** — the VSCode host never persisted
  edits (matched `save`; the web posts `contentChanged`) → `MateuVisualEditorProvider.ts` now accepts both.
  Builds verified: VSCode `tsc` clean; IntelliJ `compileKotlin` + `registryProbe` + `test` all green
  (incl. `MateuVisualEditorServerTest`, which proves `__preview__` proxies end-to-end). Live target is
  **`demo-starwars` (:8600, 27 page YAMLs)** — the default `mateu.baseUrl`s (:8594/:8080) match no demo.
  **Hardening applied:** VSCode `media/` embed now fails with an actionable "run `npm run copy:web`" panel
  instead of a blank ENOENT (`MateuVisualEditorProvider.buildHtml`); the `mateu.baseUrl` config description
  now points at demo-starwars :8600. VSCode `tsc` still clean.
  **Remaining:** GUI live-run (human-in-the-loop) + backlog: IntelliJ `externalChange` desync, wire
  `copy:web` into builds so the embed can't go stale, `listFiles` bound, https proxy, custom-editor
  `priority` drift.
- **Phase 2 — Preview source: DONE (contract/binding scope; web editor, build + 84 vitest green + tsc).**
  Pure model `apps/visual-editor/src/model/previewSource.ts` (8 tests) — modes `remote`/`local`/`mock`/
  `client` + `renderBaseUrl`/`rendersClientSide`/`contractFixtureFor`/`fixtureAsMembers` + fixture helpers
  (`setContractFixture`/`removeContractFixture`/`fixturedViewModels`/`parseContractFixtures`) + serialise/
  parse; persisted via `previewSourceStore.ts`. Toolbar **selector** + a **fixtures UI** (mock mode):
  **Capture `<VM>`** records the bound view model's live `__contract__` as a fixture (connect → capture →
  work offline), fixture chips with remove, and **Export/Import JSON** — which is also the *AI-generated
  fixtures* path (a fixture is plain `{vm: {fields, actions}}`, generate it however and Import). Canvas
  takes an explicit `clientRender` flag (so IntelliJ same-origin `baseUrl:''` ≠ client mode) with an honest
  Phase-7 placeholder. Per-mode recipes documented in the app README. **Deliberately deferred (not the
  contract slice):** data-source **row** mocking (`__preview__` renders layout with no data, so binding
  fixtures were the offline gap; row mocking lives in `libs/mateu` `fetchExternalJson` — a later, cross-
  cutting change), a real embedded **`local`** backend boot (labelled `remote` for now), and the true
  no-backend **render** (`client`) which is coherence **Phase 6**.
- **Phase 3 — Behaviour editor: STARTED (verification + first slice).** The mandated first step (verify
  classless `Action.steps` end-to-end) found a **real gap**: flow `steps:` is NOT authorable in YAML —
  `io.mateu.uidl.fluent.Step` is unregistered in `YamlUidlMapperFactory` and its schema `$def` name
  collides with `io.mateu.uidl.data.Step` (the ProgressSteps item). That is flow-DSL / coherence-Phase-2
  territory and the coherence thread is active, so it was **handed off** (a note in
  `design/coherence-execution.md`) rather than changed here. Meanwhile the DSL-independent slice landed:
  a **menu-leaf "Action"** in `app-editor` — a `RuleLink` with a single `RunAction` rule (the unified
  `route | rule` model), authored/round-tripped via `appModel.ts` (richer rules — RunJS/Set*/filters —
  stay `raw` so nothing is edited lossily). **Trigger wiring: DONE** — page-level `triggers:` are now
  authorable in classless YAML end-to-end (a definition-only page can preload on load, react to an event,
  recompute on a field change). Backend enablement (Java-core, mirrors the `actions:` write-half):
  `SeededYamlPage` implements `TriggersSupplier`, `YamlUidlLoader.triggersOf` parses `triggers:`,
  `YamlUidlMapperFactory` registers the six `Trigger` subtypes, and `UidlSchemaGenerator` adds `triggers`
  to the page envelope (schema regenerated). Editor: a **Triggers panel** (on-load/on-event/on-value-change
  → actionId) in `mateu-visual-editor.ts`; `pageModel.ts` gained page-level `triggers` **and** preserves
  the rest of the envelope verbatim — fixing a pre-existing bug where the editor **dropped `actions:`** on
  save. Verified: 1062 core tests + UidlSchemaTest (12) + `YamlDeclaredTriggersSyncTest` (4) green; frontend
  88 vitest + tsc + build. **Remaining in Phase 3:** the `steps` flow editor (blocked on the coherence
  handoff) and authoring behaviour on buttons/actions (not just menus).
- **Phase 6 — Quick Starts & templates: STARTED (new-from-template).** Its coherence-Phase-4 dependency
  landed (#523/#524: `ResponsiveGrid` + `gridTemplateAreas` + `Slotted` named slots). Delivered: a
  **starter-template gallery** (`model/templates.ts`, `Templates` toolbar button) with 5 curated,
  renderer-neutral/classless starters — Form, Listing, Two-columns, Dashboard, and a **Named-slot template**
  that showcases the coherence Phase 4 primitive (ResponsiveGrid + `Slotted`). Picking one replaces the
  layout (keeping any model binding), with a confirm when the page isn't empty. Each template is pinned to
  parse + round-trip by `templates.test.ts`. **Contextual Quick Starts: DONE** — a `Quick Start` panel with
  three one-click scaffolds backed by pure, tested ops in `model/quickStarts.ts`: **Bind data source**
  (set `modelView`, then load its contract), **Lay out fields from data** (data-first — append a `FormField`
  per contract member, honouring the mock preview source), and **Turn into listing** (replace the page with
  a `Listing` whose columns come from its fields). **Wire an action: DONE** — a "Wire an action…" Quick
  Start adds a `Button` bound to an `actionId` and gives the action a home context-aware: a **bound** page
  leaves the id for an `@Action` (created via the §G Sync / IDE quick-fix); a **classless** page also gets a
  page-level `actions:` `restAction` stub to edit. (This also fixed a latent `serializePage` bug — a *bare*
  page dropped `rest`/`triggers` on save.) **AI-assisted scaffolds: DONE** — an **AI panel** that composes a
  complete prompt (the component catalog + the page's bound-model context) to paste into any AI, and imports
  + **validates** the YAML it returns (`model/aiScaffold.ts`: `buildScaffoldPrompt` / `validateScaffoldYaml`
  — rejects unknown component types, tolerates ```yaml fences). Same €0, tool-agnostic shape as the
  mock-fixtures Import: **no embedded/paid LLM, no key**. 108 vitest + tsc + build. **Phase 6 essentially
  complete** (templates + bind/scaffold/turn-into-listing/wire-an-action + AI). **Only leftover:** the
  editor-tree friction selecting INTO a `Slotted` child (renders/round-trips fine; deep-edited via YAML).
  Model-editing quick starts are covered by §G's IntelliJ "Create in ViewModel".
- **Phase 5 — Layout ↔ ViewModel sync: STARTED (the web-editor reconciliation half).** A **Sync panel**
  shows the structural diff between the page and the bound view model's contract (pure, tested
  `model/viewModelSync.ts`): **in the model, not on the page** → per-member **"Add to page"** (a `FormField`
  / an action `Button`), and **on the page, not in the model** (dangling `FormField.id`/`actionId`) → flagged
  as *create in the ViewModel (IDE)*. 99 vitest + tsc + build. **The code-writing half: DONE (IntelliJ).**
  The binding annotator's dangling-`id`/`actionId` errors now carry Alt+Enter quick-fixes —
  `CreateFieldInViewModelFix` ("Create field 'email' in CustomerView": adds `private <type> email;`, the
  type following the declared `dataType`, records excluded) and `CreateActionInViewModelFix` ("Create action
  'save' …": adds `public void save() {}`), both editing the resolved PSI class. Verified: `compileKotlin`
  green + 2 new `MateuYamlBindingAnnotatorTest` cases (suite 8/8) that apply the fix and assert the member
  appears (field typed `Double` from `dataType: number`, method created). **Remaining in Phase 5:** the same
  quick-fix for the **VSCode** host (needs an LSP/code-action; the web diff panel already degrades gracefully
  there) and the `modelView:` picker upgrade (a dropdown from `projectIndex.viewModels`; the Quick Start
  prompt covers it for now).
- **Next actions:** the human **GUI live-test** of the IDE hosts against demo-starwars (`:8600`); the
  coherence thread closes the classless-`steps` gap → then the `steps` flow editor; the IntelliJ
  "Create in ViewModel" quick-fix; remaining Phase-1 hardening; finish Phase 2 (data mocking).
