# Visual Builder → Mateu — feature map (research + gap analysis)

**Goal.** Don't invent a visual-editor UX from scratch. Follow a proven model — **Oracle Visual
Builder (VBCS) Designer** — and map each of its authoring surfaces onto what the Mateu visual editor
(`frontend/web/monorepo/apps/visual-editor`, hosted in IntelliJ via JCEF and in VSCode via a Webview)
already has, is missing, or should deliberately NOT copy.

This is the reference for prioritising the visual-editor work in this thread. It is research + a map,
not a build plan yet.

## The one thing that changes everything: where behaviour lives

VB and Mateu solve the same problem (build UI without writing frontend code) with **opposite centres
of gravity**, and every mapping below hangs off this:

- **Visual Builder** puts *state and behaviour in the client*: page/flow/app **Variables**, **Types**,
  **Service Data Providers** (REST bound in the browser), and **Action Chains** (Navigate, Call REST,
  Assign Variable, If/For-Each…) authored visually and run in the browser. The page is the program.
- **Mateu** puts *state and behaviour in a typed backend model* (the Java/.NET/Python **ViewModel**:
  fields = state, `@Action` methods = behaviour) and **infers** the UI from it. The model is the
  program; the screen is a projection.

So we **adopt VB's authoring *surfaces*** (palette, canvas, structure, properties, an action-chain-like
editor, a service editor) but keep **Mateu's *model*** (typed backend + inference + bounded declared
flows). We are not porting VB's client-side variable/SDP runtime — that would fight the framework.

**Crucial correction: the ViewModel is OPTIONAL, not the centre.** A Mateu UI can be authored and can
run **with no backing class at all** — this is a first-class path, and it is the €0 path:
- **definition-only routes** (`definition:` with no `viewModel:`), `actions:` on a definition that
  **write** via `restAction` with no server round trip and no class, `Listing.rowRoute`, and
  `demo-starwars` (a full CRUD with no Java beyond the Spring Boot `main`, against a REST service);
- the **static bundle** deliberately exports the viewModel-less routes ("a class is what a bundle with
  no backend cannot use").

Therefore the ViewModel is one **optional contract source**, not a requirement. The editor's **Data
panel resolves the contract from EITHER** (a) a ViewModel via `__contract__`, **or** (b) the **shape of
a REST source** (`sources.yaml`: `fields`, `itemsPath`…). The data-only path is the default; *editing
the model* is an **IDE-only bonus** when a class happens to exist, never a precondition.

**Behaviour without a class, declaratively (the answer to VB's "inject TS/JS").** VB lets you drop into
TS/JS. Mateu's equivalent is **declarative and class-free**: the fluent `Action` record already carries
**both** `restAction` (a REST write) **and** `steps: List<Step>` (the declared client flow, Phase 2
#506), and `YamlUidlLoader.actionsOf` deserialises each `actions:` YAML entry straight into that
`Action`. So **authoring `steps` in YAML with no ViewModel is structurally already possible** — it is
the declarative replacement for injected TS/JS. Raw **JS stays a relegated escape hatch** (`RunJS`
already exists in menu rules), never the default — matching the plan's spine, "escape hatches explicit
and relegated". *To verify:* end-to-end coverage of classless `Action.steps` (tests, `__preview__`) —
the scaffolding is there; the coverage is unconfirmed.

## The point of the whole exercise: same capability, **zero cost**

The maintainer's driving motivation is **price**, not just architecture: Oracle VB billed **€400 in a
month** for a trial. The differentiator we are chasing is *"everything VB does, deployable and operable
at €0"* — and Mateu has a real path to it, it is not aspirational:

- **Static bundle to a free CDN tier, no backend.** Coherence idea #1 (JSON canonical + a **client-side
  expander**) and **Phase 6** ("the declarative path renders client-side, no backend; a static demo").
  The authored table already travels in `manifest.json` (+ `routes.yaml`). Author visually → export a
  static bundle → drop it on Netlify / GitHub Pages / Cloudflare free tier → **€0**.
- **The editor itself is free to run** — a static web bundle in a browser or embedded in the IDE
  (JCEF / VSCode). There is no paid design-time service like VB's.

Two non-negotiable design pillars fall out, on top of "inferred by default, explicit as override" and
"renderer-neutral (schema + wire, never a specific DS)":

3. **Zero-cost deployment is a first-class output.** The editor's artifacts must be exportable as a
   **static, no-backend bundle**. Nothing we add should *require* an always-on/paid backend to run the
   finished app.
4. **Preview is a configurable "preview source", not a hard backend dependency.** Split what preview
   needs into two very different concerns:
   - **Rendering the layout (`__preview__`)** is a *pure function of the YAML being edited* — it changes
     on every keystroke, so it **cannot be served by static fixtures**; "mocking" it well IS the Phase 6
     client-side expander. This piece needs an actual **renderer**.
   - **Feeding data + contract (`__contract__`, listing rows, options, REST sources)** is the classic
     **mocking** case — recorded or **AI-generated** fixtures (e.g. MSW), keyed by model/endpoint.

   So the editor gets a **preview-source selector** with documented modes (none require a paid cloud):

   | Mode | What | Cost | Renders | Data |
   |---|---|---|---|---|
   | `remote` | point at any running backend (dev/staging/demo) | €0 if you have one | ✅ | ✅ real |
   | `local` | IDE/CLI boots an embedded Mateu (the plugin already has `MateuVisualEditorServer`) | €0, offline | ✅ | ✅ / mock |
   | `mock` | MSW + fixtures (recorded or AI-generated from the ViewModels) for contract/data/REST | €0 | ❌ (needs a renderer from `local`/`client`) | ✅ |
   | `client` | Phase 6 client-side expander, no backend | €0 real | ✅ | ✅ |

   **Today's cheap complete path = `local` (embedded renderer) + `mock` for data you don't want to
   wire.** Pure `mock` alone can't render; that gap closes with Phase 6. Infra already present: a
   configurable `baseUrl`, `MateuVisualEditorServer` proxying `/mateu`, `BrowserHost` (localStorage).
   **To build:** the preview-source selector + per-mode recipes + an **AI-assisted fixture generator**
   (inspect ViewModels → emit MSW handlers / fixtures).

The happy accident that makes a VB-style behaviour editor *possible without breaking the model*:
**Phase 2 of the coherence plan already shipped a bounded client-side flow language** — `Step`
(`Navigate`, `Emit`, `CloseOverlay`, `RunAction`, `MarkClean`, `MarkDirty`), each lowering 1:1 to a
`UICommand`, runnable with **no server round-trip** (see `design/coherence-execution.md`, PR #506
"declared flow"). That is Mateu's native, model-safe answer to VB Action Chains. The runtime primitive
exists; **there is no editor for it yet.** This is the single highest-value alignment (see §C).

## Legend

✅ have it · 🟡 partial · ❌ missing · 🚫 deliberately NOT copying (fights the Mateu model)

---

## A. Page Designer — layout authoring surfaces

| VB Designer surface | Mateu equivalent | Status | Notes / decision |
|---|---|---|---|
| **Components palette** (JET components, categories, filter, drag-to-canvas) | `palette/editor-palette.ts` — schema-driven from `uidl-schema.json`, search + groups, click-insert + pointer-drag | ✅ | Fully dynamic (no hardcoded list). Component **Exchange** (add third-party components) → see §E. |
| **Design view** (WYSIWYG canvas, drag-drop) | `canvas/editor-canvas.ts` — renders via reserved `__preview__` action; `id="ve-<path>"` DOM↔node mapping; pointer DnD with 4px threshold, precise drop line, reposition | ✅ | **DnD is already done** — the app README's "Next: drag-and-drop" is stale. Events are inert in edit mode (click selects, doesn't fire). |
| **Structure view** (hierarchical tree, reorder, add) | `outline/editor-outline.ts` (layers tree) | ✅ | Collapsible, hints from id/label/text/actionId/ref. |
| **Properties pane** (typed prop editors) | `properties/editor-properties.ts` — enum `<select>`, boolean checkbox, number/text, datalist ref-pickers | ✅ | Typed from component schema. Complex/nested props (`kind:'complex'`) → 🟡 "edited on canvas" placeholder, not editable. |
| **Properties pane → Quick Starts** (contextual scaffolds: "Add Data", "wire an action") | Mateu has **archetypes/templates** (Dashboard, CollectionDetail, CRUD…) but no *in-editor* scaffold | ❌ | High value: an "Add data / Turn into listing / Add action" quick-start that rewrites the YAML+model stub. Maps cleanly onto Mateu templates. |
| **Design / Live / Code** synchronized toggle | Canvas (design) + **Show YAML** source view (code). No interactive "Live/run" mode | 🟡 | Canvas is a faithful render but inert. A **Preview/Run toggle** (un-inert events against the real backend) would complete the triad. Full 3-way live sync is a nice-to-have. |
| **Breadcrumb** (path to selected, jump to ancestors/siblings) | `mateu-visual-editor.ts` breadcrumb | ✅ | Ancestors only; VB also shows siblings on hover (minor). |
| **Canvas context menu** (Select parent, **Surround with**, Insert before/inside/after, Delete) | Selection toolbar: ⤴ parent, ↑↓ reorder, ⧉ duplicate, ✕ delete | 🟡 | Missing **"Surround with"** (wrap selection in a container) and an explicit insert-before/inside/after menu (DnD covers positional insert). |
| Panel repositioning to quadrants, grid/list palette layout | — | 🚫 | Cosmetic; not worth it. |

---

## B. Data — Variables, Types, Services, bindings

| VB surface | Mateu equivalent | Status | Notes / decision |
|---|---|---|---|
| **Variables** (page/flow/app scope, primitive/structured/dynamic) | ViewModel **fields** = component state; no client variables | 🚫 | **Default = everything bound by inference; nothing to declare.** We do NOT build a VB-style Variables subsystem. An *optional* explicit layer **already exists in data-native form** — route scopes `state:`/`appState:` (literal seeds = "a variable with an initial value") — so at most we *surface* those, not invent client variables. Editor gets a **read-only "state available" inspector** (from `__contract__` or the source shape) for discoverability, not an authoring panel. |
| **Types** (structured type editor) | Class (backed) **or the REST source shape** (`sources.yaml` `fields`) in classless mode | 🚫 | No type-editor subsystem. The data's "type" is already described by the source shape (classless) or the ViewModel (backed). |
| **Service Data Provider / REST connections** (bind a component to a REST endpoint) | **`sources.yaml`** (REST source catalogue) + `@RestData`/`@RestOptions(source=…)` | ❌ | **Clean 1:1 gap.** There is a routes/mount/app editor but **no `sources.yaml` editor**. A "Services" editor (name → url/auth/paths/proxy) maps exactly onto VB's Service connections and onto `sources-schema.json`. |
| **Data palette** (data-first: start from data, pick a representation) | `__contract__` returns the model's inferred fields; inference builds the UI at build time | 🟡 | Mateu IS data-first, but at build time from the model — not "drag a field from a data palette onto the page". A field-binding picker exists (datalists) but not a drag-from-data flow. |
| **Expression bindings** `${...}` + **Expression Editor** | Runtime supports `${state.x}` / `${data.y}` interpolation in labels/titles/etc. (see CLAUDE.md) | ❌ (editor) / ✅ (runtime) | The runtime already interpolates expressions; the editor has **no expression-builder UI** and no autocomplete for `state.`/`data.` members from `__contract__`. |
| **Binding validation** (is this field/action real?) | Datalist pickers show what exists; nothing rejects a bad ref | ❌ | `__contract__` already knows the valid field/action ids — validating typed refs is low-hanging fruit. |

---

## C. Behaviour — Action Chains & events  ← the marquee gap

| VB surface | Mateu equivalent | Status | Notes / decision |
|---|---|---|---|
| **Action Chain editor** (drag Navigate / Call REST / Assign / Fire Notification / If / Switch / For-Each / Call Chain; input params + return type; page/flow/app scope) | **Declared flow** = a fluent `Action` carrying `steps` (`Step` v0 verbs), lowered to `ActionDto.commands`, run client-side with **no round-trip** (coherence Phase 2, PR #506). Heavier logic = `@Action` method on the ViewModel (one round-trip). | ❌ (editor) / ✅ (runtime) | **The single highest-value alignment.** The runtime primitive is shipped and model-safe. Build an **action-chain-style editor** that authors `steps` on a button/action: pick from the bounded verb set (Navigate, Emit, CloseOverlay, RunAction, MarkClean/Dirty), extendable as Phase 2 grows the verbs (set/validate/callRest/branch/forEach). Bounded on purpose — it is not a programming language; deep logic stays in the ViewModel. |
| **Event triggers** (component `ojAction`, page lifecycle `vbEnter`/`vbExit` start a chain) | `@Trigger(OnLoad,…)`, `@SubscribeTo`/`@Emits`, an `Action` on a button | 🟡 (runtime) / ❌ (editor) | The trigger→action model exists (coherence Phase 1). The editor authors **none** of it — no "on load", "on click", "on event" wiring UI. Pairs with the flow editor above. |

**Why this is safe to copy.** VB action chains feel powerful because you *see* the behaviour. Mateu can
give the same feel by editing the **declared-flow `steps`**, while the framework's guarantee (real logic
is typed + tested in the ViewModel) is preserved — the editor only authors the bounded, presentational
client flow. This is "don't invent": VB's UX, Mateu's already-built model.

**Caveat / fork to flag.** Declared-flow *authoring* is currently **Java + web only** (the .NET/Python
ports reach the same outcome via a *returned* flow, one round-trip — see `coherence-execution.md`). An
editor that writes `steps` into a **page YAML** is port-agnostic (it's data on the wire), so the editor
can lead here — but we should confirm the YAML/`__preview__` path carries `steps` before committing.

---

## D. Page flow & navigation

| VB surface | Mateu equivalent | Status | Notes |
|---|---|---|---|
| **Page flows** (navigation graph between pages/flows) | **`routes.yaml`** / `RouteEntry` (parent/children, fixed/default params, scopes) | ✅ (table) / 🟡 (diagram) | `routes/routes-editor.ts` is a table editor — functionally complete for navigation. No visual flow *diagram* (VB doesn't really have one either; minor). |
| **App / shell / menu** | **`type: AppShell`** | ✅ | `app/app-editor.ts` — title/chrome/menu tree (recursive groups), widgets preserved. |
| **Menu option runs an *action*** (not just navigate) | **Unified menu-leaf `route \| rule`** (2026-09-06): a `RuleLink` carrying a `RunAction`/`RunJS` rule runs instead of navigating. In the model AND authorable in YAML (`specs-schema.json` knows `RuleLink` + `rules`); classless/data-native. | ✅ (model+YAML) / ❌ (editor) | **Model gap: none.** Editor gap: `app-editor.ts` only offers Link/Group/Separator; a rule leaf falls to `kind:'raw'` ("edit in YAML"). **To build: a first-class "Action" menu-leaf** whose `RunAction` targets a declared flow (`Steps`) or a named `@Action`. Ties the menu into the §C flow editor; €0-friendly. |
| **Mount** (base path + route files) | **`type: UI`** mount | ✅ | `mount/mount-editor.ts`. |

Navigation authoring is the **most complete** area vs VB.

---

## E. Custom / third-party components

| VB surface | Mateu equivalent | Status | Notes |
|---|---|---|---|
| **Component Exchange** (add custom JET web components to the palette) | `ComponentAdapter<T>` SPI + custom components (coherence #14) | ❌ (editor) | Mateu can render arbitrary domain objects and per-renderer custom components, but they are **not surfaced in the palette**. Lower priority than §C. |

---

## F. IDE integration — where Mateu already goes *beyond* VB

VB is cloud-only (browser Designer). Mateu embeds the **same web editor bundle** in native IDEs:

| Piece | Where | Status |
|---|---|---|
| Shared web editor (browser + both IDEs) | `apps/visual-editor` | ✅ Phase A done, build green |
| **IntelliJ** host (JCEF FileEditor for `specs/ui/*.yaml`, in-plugin HTTP server, message bridge, `specs-schema.json` IntelliSense, binding annotator vs the ViewModel PSI) | `frontend/app/intellij-plugin/.../visualeditor/`, `.../schema/`, `.../contract/` | ✅ exists, **not live-tested** |
| **VSCode** extension (CustomTextEditor for `specs/ui/*.yaml`, backend proxy) | `frontend/app/vscode-extension` | ✅ exists (first cut), **not live-tested** |
| Project awareness / reference pickers (`listFiles()`, `projectIndex`) | `host/hostBridge.ts`, `model/projectIndex.ts` | ✅ browser-verified; IDE responders compile, not live-tested |

**Reconciliation note:** the two hosts DO exist in the plugin/extension repos (the layout-only deep-read
of `apps/visual-editor/src` couldn't see them and assumed "stubs"). What is genuinely pending is
**end-to-end live verification** inside a running IDE against a real backend.

---

## Early cross-cutting guards (do first — they enforce the pillars)

- **Authoring↔wire parity guard** (early task, agreed). Authoring completeness ("the UIDL is the complete
  model, so everything the frontend renders is settable in YAML") is an **invariant to enforce, not an
  assumption**. Add a test that, per component, diffs the authoring record (`io.mateu.uidl.data.*`) against
  its wire DTO (`*Dto`) and **fails when a wire knob has no authoring counterpart**, with an explicit
  allowlist for genuinely-derived/runtime fields (e.g. `observed`). Known holes found while checking:
  `FormFieldDto.rightAligned`, `.bold`, field-level `.badges` exist on the wire but not on
  `data.FormField` — so they can't be authored from YAML today. Same spirit as `UidlSchemaTest`.
- **Palette completeness guard** (early task). The palette is schema-driven from the generated
  `uidl-schema.json` (~130 types) so it is complete *by construction* — but add a guard that (a) it exposes
  the full **authorable** catalog (minus `EXCLUDED` wire plumbing: `ServerSideComponent`,
  `ModelViewComponent`, `PageView`), and (b) each insertable type yields a default node that actually
  renders under `__preview__`. Work here is **curation** (default props on insert, child-only context,
  grouping/altitude), not adding components.

## G. Layout ↔ ViewModel sync (resolves "how far does the editor touch the model?")

When a ViewModel **is** present (the backed path), the editor offers a **"Sync with ViewModel"**
reconciliation panel — a *structural* two-way sync, not arbitrary model-property editing. This is the
concrete, bounded form of that open question; it degrades gracefully when there is no class.

1. **Pick the ViewModel** (not copy/paste the FQN) → a `modelView:` picker from `projectIndex.viewModels`.
   Pure-YAML, works in every host. Easy win.
2. **ViewModel → layout** — declared members are selectable to drop into the layout (`__contract__`
   pickers, in "add to layout" mode). Note: on the **delta** path this is *already automatic* via
   inference (a new model field just appears); explicit placement matters mainly on the snapshot path.
3. **Layout → ViewModel** — a `FormField.id`/`Button.actionId` referenced in the layout but **absent from
   the class** shows in a **diff**, with a per-item **"Create in ViewModel"** that scaffolds a field of
   the inferred `dataType` / an `@Action` stub. **Ask, never auto** (diff + explicit apply).

Honest constraints & existing hooks:
- The **code-writing half is IDE-only** (creating a field/method edits Java/.NET/Python source → needs
  IntelliJ PSI or a VSCode LSP). Browser/standalone keeps the `modelView:` picker + ViewModel→layout;
  the "create in model" half is simply absent there. Matches "editing the model = IDE-only bonus".
- **Half-built on IntelliJ already:** the plugin's **binding annotator** resolves the ViewModel via PSI
  and flags dangling `fieldId`/`actionId`. "Create in ViewModel" is the natural next step — turn those
  flags into **quick-fixes** ("Create field 'email' in CustomerView"), idiomatic IntelliJ intentions.
- `__contract__` already carries enough (id + `dataType`/`stereotype`) to both list members and scaffold
  sensible stubs.
- **AI enrichment (decision C):** a deterministic stub is the baseline; "create the field with a sensible
  type/validation" or "implement this `@Action`" is where an AI-assisted Quick Start adds value.

## Priority shortlist (candidates for this thread)

Ordered by value × alignment-with-"don't-invent", not yet committed:

1. **Live-test & harden the IDE hosts end-to-end** (IntelliJ JCEF + VSCode) against a demo backend —
   load a `specs/ui/*.yaml`, render via `__preview__`, select, edit a prop, save to disk, verify the
   `listFiles()` responders and binding annotator actually fire. *Foundation: everything else ships
   through these.* (§F)
2. **Action-chain-style behaviour editor** authoring declared-flow `steps` on actions/buttons, plus the
   trigger (on-load / on-click / on-event) wiring. *The marquee VB feature, and the model primitive is
   already shipped.* (§C)
3. **`sources.yaml` (Services) editor** — the clean 1:1 with VB Service connections; closes the "no data
   source editor" gap and feeds the binding pickers. (§B)
4. **Binding validation + expression autocomplete** from `__contract__` (reject unknown field/action
   ids; suggest `state.`/`data.` members). *Small, high polish.* (§B)
5. **Quick Starts** (contextual scaffolds: "Add data / Turn into listing / Add action") backed by Mateu
   archetypes/templates. (§A)
6. **"Surround with" + explicit insert-before/inside/after** context menu; complex/nested-prop editing. (§A)
7. **Preview/Run toggle** (interactive "Live" mode) and Component-Exchange-style custom components. (§A/§E)

## What we are explicitly NOT copying

- Client-side **Variables / Types / Service Data Provider runtime** as the state model (🚫 §B) — Mateu
  state is the typed ViewModel; the editor *surfaces* it, never re-invents it.
- VB's unbounded client action language — Mateu's flow is **bounded by design**; deep logic stays in the
  ViewModel (typed + tested). We copy the *editor UX*, not the *unbounded runtime*.
- Panel-quadrant cosmetics (🚫 §A).

## Sources

- Oracle VB — Page Designer: <https://docs.oracle.com/en/cloud/paas/app-builder-cloud/visual-builder-developer/use-page-designer.html>
- Oracle VB — Components palette: <https://docs.oracle.com/en/cloud/paas/visual-builder/visualbuilder-building-applications/page-designer-components-palette.html>
- Oracle VB — Action chains: <https://docs.oracle.com/en/cloud/paas/visual-builder/visualbuilder-building-applications/action-chains.html>
- Oracle VB — Variables & bindings (Studio docs index): <https://docs.oracle.com/en/cloud/paas/app-builder-cloud/visual-builder-developer/understand-variables.html>
- Mateu side: `apps/visual-editor/src/**`, `frontend/app/intellij-plugin/.../visualeditor`, `frontend/app/vscode-extension`, `design/coherence-plan.md` (#1, #12), `design/coherence-execution.md` (Phase 2 flow), `design/visual-editor-project-awareness.md`.
