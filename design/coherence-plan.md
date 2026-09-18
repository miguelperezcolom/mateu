# Mateu coherence plan (living)

> **The problem (maintainer, 2026-09):** Mateu has accumulated a lot of individually-excellent
> capability, but the *whole* doesn't announce how to use itself. A newcomer sees ~60 features and
> can't see *the* path. The incoherence is mostly **perception/onboarding**, for **both** audiences
> (the newcomer's first 10 minutes AND the experienced dev's "canonical way to do X"). Goal:
> consolidate the pieces into a coherent whole whose path is perceived immediately.
>
> This is a living doc — ideas are captured as they come, then structured and prioritised.

## Frame (where each idea lands)

1. **The 10-second click** — what anyone grasps instantly (positioning / one-liner / the mental gif).
2. **The golden path** — newcomer: "zero to your first app in N steps"; experienced: "the canonical way to do X".
3. **The single mental model** — the story that makes all the modes click as one thing, not loose features.
4. **Consolidate / demote** — what gets promoted to "the path" and what becomes an explicit *escape hatch*, so the path is *seen* without noise.
5. **Where the path lives** — docs, scaffolding/CLI, visual builder, the home — so it's *perceived*, not just *exists*.

---

## Idea #1 — JSON as the canonical format + a client-side expander (front-first, zero-backend)

**Origin:** "maybe instead of YAMLs we need to work only with JSON, so it's directly usable from
the web front." Refined in conversation to: what's really wanted is **B — a front that consumes the
spec directly, with no backend and no build.**

**The key distinction that dissolves the YAML-vs-JSON tension: *consumed* ≠ *authored*.**
- **Consumed by the front = JSON** — required (the front is JSON-native). Non-negotiable for B.
- **Authored by a human = whatever is nicest** — YAML (still), or JSONC/JSON5, or the visual builder —
  with a trivial converter down to JSON. A separate concern.
- So: **JSON is canonical and consumed; YAML survives as optional 1:1 authoring sugar.** We don't lose
  YAML's readability; we just stop making *the front* depend on it.

**Story it buys:** *"One model. The front consumes it as JSON (runs anywhere, no backend). You author
it however you like — visually, or in YAML/JSONC."* (Frame slots: #1 the click, #3 the mental model.)

**What the friction actually is (correcting the premise):** the costly step is NOT the YAML→JSON
parse — it's the **spec→wire expansion** (route resolution → definition→component tree → layout
inference → data binding) that today the server (or the static-bundle exporter) performs. Two JSONs
must not be conflated: **(i) the authored spec** (routes/sources/definitions, high-level) vs **(ii)
the wire** (`UIIncrementDto`, the expanded tree the renderer paints). The front renders (ii). Changing
the authoring serialization (YAML→JSON) does not remove the expansion. In *backend-driven* mode the
server reads YAML live (no Maven/npm plugin, no extra step); the conversion-step pain only appears in
a **front-only / no-backend** workflow — which is exactly B.

**So B = a client-side EXPANDER.** Move the spec→wire expansion into the browser. Much of it already
exists client-side (route resolution runs in the browser in `libs/mateu` + the VB core; the REST
source catalogue resolves client-side; the static bundle already renders in the client). The genuinely
new piece is a **`definition`→component-tree expander** that runs without the server-side exporter.

**Honest scope boundary:** B works for the **100% declarative path** — routes with `definition` +
`sources`, **no `viewModel`** (no Java/.NET/Python class). A `viewModel` route runs server logic and
cannot execute in the browser, so it still needs a backend. Clear, documentable frontier.
`demo-starwars` (already 100% DSL over an external API) is the poster child: today it needs the
backend or the bundle build; B would let it run purely client-side from JSON specs.

**Plan sketch (NOT started — planning):**
1. **JSON = canonical spec format** (routes/sources/definitions); YAML kept as optional authoring
   sugar (+ a tiny converter) or JSONC to recover comments.
2. **Client-side expander** in `libs/mateu` (+ VB): load JSON specs → resolve route → expand
   `definition`→component tree → bind data (REST sources client-side) → render. Reuse the existing
   client-side route resolution + rest-source machinery + the bundle's client-side rendering.
3. **Scope**: declarative/definition-only routes; `viewModel` routes stay backend (documented).
4. **Target dev loop**: `vite dev` serving the JSON specs + the renderer → edit → refresh → see.
   **Zero backend, zero build** — this is the "10-second click".
5. **Authoring**: the visual builder as the primary authoring surface; YAML/JSONC for hand-authoring.

**Status:** captured; the expander is a significant-but-bounded new piece to design + build later.
**Open decision:** authoring-sugar policy — keep YAML as 1:1 sugar vs. move hand-authors to JSONC/JSON5.

---

## Idea #2 — A unified trigger model for behavior (on-event → do-behavior)

**Origin:** the front has view+state (the "DOM") and **behavior**. Behavior is wired to lifecycle
events (page loaded), operation events (an HTTP call finished), user events (typed, clicked, hovered,
shortcut…) and state changes (a field changed / is about to change). Concern: we may not have the
flexibility to hook ALL of these easily.

**Audit (grounded in the uidl source).** The hooks mostly exist but are **scattered across ~15
behavior annotations** with different shapes, and a few event kinds have no hook at all:

| Event class | Covered by today | Gap |
|---|---|---|
| Lifecycle (page loaded) | `@Trigger(OnLoad)` (+ background variant) | — |
| Operation (HTTP finished) | `OnSuccess`, `OnError` | — |
| User — click | `@Button`/`@Toolbar`/`@Fab`/`@ListToolbarButton`/`@ViewToolbarButton`/`@RowAction`/`@GroupAction` | (7 annotations) |
| User — type / change field | `@AutoSave` (debounce) / `OnValueChangeTrigger` | — |
| User — shortcut / Enter | `@Action(shortcut, runOnEnter)`, `@Tab(shortcut)`, `@OnRowSelected(shortcut)` | — |
| User — row click | `@OnRowSelected` | — |
| User — hover | — | **✗** |
| User — focus / blur | — | **✗** |
| State — value changed | `OnValueChangeTrigger` / `@AutoSave` | — |
| State — *about to* change (cancelable) | — | **✗** |
| Inter-component (named event) | `@SubscribeTo`/`@Emits` + `OnCustomEvent` + `UICommand.dispatchEvent` | — |

**The real coherence problem:** to wire behavior you must know which of ~15 annotations applies, and
each has a different shape. There is no single *"when X happens → do Y"* model — behavior is a grab
bag, not one concept. That is a big part of why the path isn't *seen*.

**Decision (maintainer): do BOTH** — (a) fill the gaps (hover / focus / blur / before-change) AND
(b) unify the scattered surface into one trigger model. **Plus a firm requirement:** any behavior
must be expressible **client-side** (so it works in the no-backend world of Idea #1).

**The model:** one consistent shape — **`on(<event>) → do(<behavior>)`** — where
- **`<event>`** ∈ lifecycle (load) · operation (success/error) · user (click/change/input/hover/
  focus/blur/shortcut/key/rowSelect) · state (valueChange / **beforeChange**, cancelable).
- **`<behavior>`** ∈ **server action** OR **client behavior** (rule / run-JS / emit event / navigate /
  UICommand) — the two are co-equal; in the no-backend path you use the client ones.

It **subsumes** `@Trigger` + `@AutoSave` + `@OnRowSelected` + the shortcut params + `@SubscribeTo`
into one model, and **fills the gaps** as new `<event>` values rather than new annotations. The
runtime plumbing already exists (the wire carries `triggers` per component; client behaviors already
exist via `RuleLink` RunAction/RunJS, `UICommand`, and `@Hidden`/`@Disabled` rules) — the incoherent
part is the **authoring surface** + the missing event kinds.

Frame slots: #3 (mental model: "behavior = triggers"), #4 (consolidate the 15 annotations), and it
ties directly to Idea #1 (client-side behaviors make the model run with or without a backend).

**Status:** captured; decision = unify + fill gaps + client-side-capable. Design of the unified
trigger authoring surface (and how the button-placement annotations relate to it) is pending.

---

## Idea #3 — Action = confirm? + a bounded declarative flow (that grows)

**Origin:** every event should hook to an **action**, and actions have things in common: (1) do they
need user **confirmation**? (2) they are a set of **steps**, which is what rules already express
(if / then / data / result). Follow-up: use it on the **native fronts** too → a *complete flow
language* vs a *JS executor in the natives*.

**Decision (maintainer + assistant, "what would you do"):** a **bounded declarative flow language
(data) that GROWS**, NOT a full flow language up front, and NOT a JS executor as a first-class native
option. Reasons: (1) JS-in-the-model is a **one-way door** — it forfeits portability (IntelliJ/JVM
would need an embedded JS engine), analyzability and safety, and can't be undone; a declarative flow
can always be extended and stays portable. (2) It's **not greenfield** — `Rule` already IS the step
(if/then/data/result), `Action` already has `confirm`, `UICommand`/`RestAction` are verbs; we
GENERALIZE `Rule`→`Step`, not invent a PL. (3) The real risk is **over-investing in language design
before validating demand**, so start minimal and let real apps pull the vocabulary wider. Escape
hatches, relegated + honest: `call-server-action` (needs backend) and `run-js` (web/RN only, not
portable; no JS engine embedded in non-JS natives). Parity of the N interpreters is governed by a
**flow conformance corpus** (same mechanism as the wire corpus: "flow X → effects Y").

This unifies with Idea #2: the whole behavior layer is **two concepts** — `trigger (on-event)` →
`action`. And with Idea #1: a flow is data, executed client-side by a per-platform interpreter → runs
with or without a backend.

### Step shape sketch (v0 — to iterate)

```
Action {
  id: string
  confirm?: { message, title?, confirmLabel?, destructive? }   # optional user gate
  steps: Step[]                                                # the flow, run in sequence
}

Step {                # rule-shaped: if / then / data / result
  when?: Expr         # "if"      — run only if truthy (default: always)
  do:   Verb          # "then"    — the verb + its data (below)
  as?:  string        # "result"  — bind the verb's output into flow scope under this name
  onError?: "continue" | "stop"   # default stop
}

Verb (bounded vocabulary — the 80–90%):
  { verb:"set",        target: <state.x | field attribute>, value: Expr }   # subsumes Rule SetDataValue (@Hidden/@Disabled/value)
  { verb:"validate",   field, rule: Expr, message }
  { verb:"navigate",   route: Expr, params?: {..Expr} }
  { verb:"emit",       event, payload?: Expr }                              # @Emits / dispatchEvent
  { verb:"message",    text: Expr, variant?, undo? }                        # toast
  { verb:"openOverlay"|"closeOverlay", ... }                               # Dialog/Drawer (UICommand)
  { verb:"callRest",   source: <ref | {url,method,body}>, params?: {..Expr} }   # client-side fetch — works no-backend
  { verb:"callAction", actionId, params?: {..Expr}, background? }           # server round-trip — needs backend
  { verb:"branch",     when: Expr, then: Step[], else?: Step[] }           # explicit then/else block
  { verb:"forEach",    in: Expr, as: string, do: Step[] }                  # OPTIONAL / phase-2 (the one loop we allow)
  { verb:"runJs",      code }                                              # ESCAPE HATCH — web/RN only, non-portable

Expr (bounded — NOT a programming language):
  literals (string|number|bool|null)
  refs:    state.x · data.y · event.payload.z · params.p · row.f · result.<as> · secret.KEY (server-only)
  template: "${state.x} ..." (the existing ${...} interpolation)
  ops:     == != < > <= >=  ·  and or not  ·  + - * /  ·  string concat
  tiny fns: isEmpty · contains · length      # keep minimal
  NO arbitrary functions, NO loops in expressions, NO recursion → analyzable, safe, N-interpreter-able
```

**Execution model:** an Action runs its `steps` in sequence against a **flow scope**
(`state`, `data`, `event`, `params`, `result.*`). Each step: eval `when` (skip if false) → run `do`
resolving Expr from scope → bind output to `as` → on error apply `onError`. Effects = state mutations
+ emitted commands. Runs client-side in the per-platform interpreter; `callAction` round-trips (with
backend), `callRest` fetches client-side (or proxied). The action's `result` = completed/stopped +
the applied effects.

**Maps onto today:** `Rule`(filter/action/fieldAttribute/value/expression/result) → a `set` Step;
`@Action` method → a `callAction` verb; `UICommand.*` → emit/navigate/closeOverlay/set verbs;
`RestAction` → `callRest`; `confirmationRequired` → the action-level `confirm`.

**Status:** decision made (bounded-that-grows, JS relegated). **Step shape v0 ACCEPTED** (incl.
per-step `onError` default `stop`, `forEach` as the only loop [phase 2], `runJs` web/RN-only, `branch`
as an explicit verb alongside per-step `when`). Pending: pin the v0 verb set + Expr grammar in detail,
and the first interpreter + flow conformance corpus. First concrete move is still the
**trigger→action unification** (needed regardless), with this minimal flow on top.

### Refinement R1 (to #2/#3) — the event bus (pub/sub) is abstract, not the DOM

**Origin:** a step can (a) dispatch an event on the DOM, and (b) subscribe to events at a chosen part
of the DOM used as a **global event bus**.

**Mapped to the model:** this is the pub/sub primitive — **emit = a verb** (`emit`), **subscribe = a
trigger** (`on <bus event>`, today's `@SubscribeTo`). Today it already runs on a DOM bus:
`UICommand.dispatchEvent` fires a bubbles+composed `CustomEvent`; `@SubscribeTo` listens on `document`
(scope DOCUMENT = global bus), filtered by `__source` (COMPONENT), or on the node itself (SELF).

**The coherence rule (so it's portable):** the bus must be an **abstract app event bus**, NOT literally
the DOM — the native fronts (RN, IntelliJ) have no DOM. The declaration only says `emit E [to scope S]`
/ `on E [from scope S]` (no DOM). The **web interpreter** implements it with a DOM node (document or a
subtree) + `CustomEvent` (free, elegant — the maintainer's idea); **RN/IntelliJ** implement it with
their own in-memory bus. "Dispatch a DOM event / pick a DOM node as the bus" becomes a **web
implementation detail**, not part of the model.

**Bus scope** (the "which part of the DOM" generalized), mapping to today's `SubscriptionSource`:
**global** (default), a **named channel** (avoid cross-talk), or **component/subtree** (local). Payload
is an `Expr`.

---

## Idea #4 — What a server ModelView method returns: one increment, four effect categories

**Origin:** what a server ModelView method returns should normally be one of: a **route**, a **UI
delta**, **data** (to state or data), or **commands**. Question: an object that is not a route or a
recognized class — return it as state, as data, or convert it to a UI component?

**Audit:** today the return dispatch is a grab-bag of ~13 recognized types (`Component`, `List`/
`Collection`, `Message`, `UICommand`, `PageBanner(s)`, `URI`, `RouteLink`, `State`, `Data`, `Drawer`,
`Dialog` — see `FragmentListMapper`). Same "powerful but scattered" pattern as the client behavior
surface.

**The four categories (the ~13 collapse into them):**
- **route** ← `URI`, `RouteLink` → a navigate command.
- **UI delta** ← `Component`, `this`, `Drawer`, `Dialog` (overlays) → "render this".
- **data** ← `State`, `Data`.
- **commands** ← `UICommand`; and **`Message`/`PageBanner` are commands** (imperative transient-UI
  effects), like navigate.
- **collections** ← `List`/`Collection` = "several of the above, apply each" (already supported).

**The unifying rule:** a ModelView method returns **"an increment"**, and the recognized types are
**ergonomic shortcuts** for parts of it (route→navigate command, Component→fragment, State/Data→the
fragment's state/data, UICommand/Message/Banner→commands). 13 special cases → one rule.

**Symmetry with #2/#3:** a `callAction` step's RESULT (server) is one of these SAME categories,
applied client-side. So **server-method-return == client-flow-effect — one effect vocabulary**
(route / ui-delta / data / commands). Server and client behaviors produce the same shapes.

**Decision (maintainer): an unrecognized object → RENDER AS UI** (a view), because object→UI is
Mateu's core mapping — returning an object from a UI-producing method means "show this" (the same
reflection that turns a `@UI` class into a screen). `this` is the special case ("re-render me with my
new state"); a different object is "render this new view". **`State`/`Data` must be explicit** for the
data path, precisely so the default can be the useful "show it". (Rejected alternatives: default to
state = fragile field collisions; strict/error = safe but less ergonomic. Known flows like AutoCrud
still handle their own return explicitly; the default applies only to a truly-unrecognized object.)

**Status:** decision made (default = render as UI; State/Data explicit for data). Pending: rationalize
`FragmentListMapper` around the 4 categories + the "return = increment" framing, reclassifying
Message/Banner as commands and Drawer/Dialog as ui-delta.

---

## Idea #5 — One clean vocabulary of 5 nouns (the mental model)

**Origin:** we define a UI bound to a base path, then routes over it, plus pages, modelviews, data
sources… Is it clear and easy to relate? **No** — powerful concepts, but naming inconsistencies +
overlaps make the relationships non-obvious, and vocabulary IS how people perceive the model.

**Problems today:**
- `modelView` vs `viewModel` — the SAME thing (the server class: state + actions) with two names
  (YAML key `modelView:` vs `RouteEntry.viewModel`).
- `UI` vs `App` vs "mount" vs `AppShell` — the "app" concept is fragmented: `@UI("/path")` declares the
  mount/root route, `@App` configures the chrome, `AppShell` is the model. A newcomer expects `@App`
  to *be* the app.
- `page` vs `view` vs `definition` vs `modelView` — overlap; unclear which is "the thing at a route".
- The route↔screen binding is powerful (a definition serves N routes; a route may have no viewModel)
  but that flexibility hides the default mental model.

**Accepted target vocabulary — 5 nouns:**
- **App** — a UI served at a *base path*. Unifies @UI/@App/mount/AppShell → "App": has a base path,
  chrome (menu/variant), and a set of routes.
- **Route** — a path (relative to the App) that **binds a Screen** + pinned params.
- **Screen** — what renders at a route = **Layout** (the *definition*) + optional **ViewModel** (logic:
  state + actions). Either may be absent: **layout-only** (no logic → static/no-backend, Idea #1) or
  **viewModel-only** (layout inferred from the model).
- **DataSource** — a named endpoint a Screen/Route consumes.
- (**Page** = the wire artifact only; NOT an authoring concept — retire "page" as a term or make it a
  synonym of Screen, not both.)

**The relationship, one line:**
> An **App** (base path) has **Routes**; each Route binds a **Screen** = **Layout** + **ViewModel**
> (one optional); a Screen reads **DataSources**.

Everything else hangs off this: behavior (triggers→actions, #2/#3) lives on the Screen/ViewModel;
effects (route/ui-delta/data/commands, #4); and it is all data/JSON (#1). So the mental model unifies
**structure + behavior + effects + format** into one story.

**Rename decisions to reach it (breaking — migration scope TBD):**
- unify `modelView`/`viewModel` → one name (proposed `viewModel`).
- reconcile `@UI`/`@App` → "App" as the single concept.
- `definition` → **Layout** (or keep "definition" defined crisply as "the layout").
- pick **Screen** for "what's at a route"; retire "page" as an authoring term.

**Status:** 5-noun vocabulary ACCEPTED as the target. Rename/migration extent still to be scoped
(breaking changes — do carefully, likely with deprecation aliases).

### Refinement R2 (to #5) — an App is a shell, NOT its home Screen

**Origin:** an App really is a component with a menu, title, subtitle, logo, widgets and a **home
page**. The home should NOT *be* the app — at some point that wasn't clear; it must be clearly
differentiated.

**The conflation (historical):** the `@UI` root class was BOTH "the app" and "its root/home view" —
a shell fused with a Screen. That produced the messy home-route defaulting (e.g. `_no_home_route`: a
POJO app didn't default home to the first menu item while a YAML app did).

**The clean split:**
- **App = a shell component** (menu / title / subtitle / logo / widgets) **+ a reference to a Home (a
  Route)**. The App is **not** a Screen.
- **Home = a Screen at a route**, like any other; the App just **points at it** as the default.
- The App's **content area mounts the current Route's Screen** (the Home when route = base path). The
  App renders the chrome + a content slot; the slot holds whatever Screen the route resolves to.

**What it resolves:** no more "the app *is* a view" special case → the home-route defaulting is uniform
across code and YAML (App references a home; home defaults to the first menu item; home is a normal
Screen).

**Model status:** mostly there — `AppShell` already carries title/subtitle/logo/menu/widgets/homeRoute
(App-as-component with a home reference already exists structurally). What's needed: (a) the conceptual
statement (App ≠ its Home), (b) implementation cleanup to remove the "@UI class is both app and home"
conflation so the home is just another Screen.

**Sharpened App definition (supersedes the App bullet above):** *An **App** is a shell component
(menu/title/subtitle/logo/widgets) + a reference to a **Home** (a Route). The App is not a Screen; its
content area mounts the current Route's Screen (the Home at the base path).*

---

## Idea #6 — Table columns: inferred by default, cell-as-component as an opt-in escape hatch

**Origin:** in Visual Builder a table column can contain a **list of elements**; in Mateu a column has
a **type and that's it**. Is VB's flexibility worth bringing? — "in part, I like the power of the VB
idea."

**The tension (why not just adopt VB):** VB's power is **imperative cell composition** (you hand-build
each cell). Mateu's power is the opposite — **declare the model, infer the UI** (a column = the field's
type). Adopting VB's model wholesale pushes Mateu toward "author every cell", against the inference
thesis (and the annotation-density gate) and against the coherence this whole plan is building. So the
question is *where on the spectrum*, not yes/no.

**The 80/20:** most business tables need typed/inferred columns + a few **rich** columns — a
**primary** column (title + secondary line + optional leading avatar), a **status** column (chip), an
**actions** column. Rarely "a cell with an arbitrary component tree".

**Accepted framework:**
1. **Default:** typed/inferred columns (keeps the thesis).
2. **Opinionated rich patterns** as declarative sugar for the 80%: `primary` (title + caption +
   leading), `status` (chip), `actions`.
3. **Escape hatch:** a column CAN render an **arbitrary component tree** — a **cell = a component** —
   when explicitly declared. *This is* VB's flexibility, but opt-in, not the default or the entry cost.

You keep what you like about VB (composition power) without paying the price (Mateu becoming
"compose every cell"). Fits the spine: **a cell is a component** (like a form field can be, like an App
is) — inferred by default, arbitrary when asked. Machinery is partly there already (Mateu renders
component trees in cells for grid form fields / editable cells).

**Status:** framework accepted (inferred default + rich patterns + cell-as-component opt-in escape
hatch). Pending: pin the 3 rich patterns' declarative shape + the opt-in cell-component API.

---

## Idea #7 — A Screen is a Template + Data + Slots (and archetypes become templates)

**Origin:** pages should be a **template + data + slots** where you place things (components).

**Sharpens #5's "Layout":** a Screen = **Template** (a reusable structure with **named slots**) +
**components placed in the slots** + **Data** (+ ViewModel for logic/behavior, from #5).
- **Template** — reusable structure with named slots (header, main, sidebar, aside…).
- **Slots** — holes where you place **components** (or even a child route's Screen).
- **Data** — what feeds the components (from DataSources / state).

**The big payoff — archetypes stop being code.** Today the ~13 archetypes (`Dashboard`, `Foldout`,
`CollectionDetail`, `GeneralOverview`, `HeroSearch`, `ItemOverview`, `SmartSearchPage`, `TodoList`,
`CalendarPage`, `GanttPage`, `DataManagement`, `Welcome`…) are **base classes** (`ComponentTreeSupplier`
inheritance, across 3 backends). In this model each archetype becomes **a Template** (data: a structure
with slots): pick a template, fill its slots, bind data. → Frame #4 (consolidate) at its largest: **13
base classes across 3 languages → one curated set of templates (data)**; and Idea #1: template + slots
+ data is **pure data** → rendered by the **client-side expander, no backend**, the same in every
language.

**Slots already exist (partly).** Nested sub-routes (`RouteEntry.parent/children`) already render "a
child in the parent's slot". This **generalises** that: a slot holds a child route's Screen OR a
component within the Screen — one composition concept.

**Preserve inference (don't let "pick a template" kill the thesis):**
- A **curated set of templates** (the current archetypes distilled) + you can define your own.
- **Inference stays the default:** "declare the model → infer the template + fill the slots" (what
  `@AutoPage`/`ArchetypeAdvisor` do today). Explicit template selection is the override, not the entry
  point. Same pattern as tables (#6) and fields: **inferred by default, explicit when you want it.**

Fits the spine: a Screen is **Template + slots(components) + Data**; components are components (like
cells #6, like the App R2); it is data (#1); behavior sits on top (#2/#3); inferred by default.

**Status:** captured; **archetypes migrate from base classes to templates**, inference stays default.
**Open sub-decision:** slots — fixed named slots per template vs. free/arbitrary slots (or both: fixed
skeleton + an overflow area).

---

## Idea #8 — A sizing-intent model: hug / fixed / fill (no manual viewport math)

**Origin:** some elements should grow the page, others occupy a concrete space, others fit the
viewport. Idea considered: a special element type that fills the viewport. Canonical case: the CRUD
listing table should expand to fill the space left by the header, menu and searchbox.

**Reframe 1 — a size PROPERTY, not a special element type:** `size: hug | fixed(x) | fill` on ANY
component (a table = `fill`, a card = `hug`, a sidebar = `fixed(15rem)`). One concept, any component —
fits "everything is a component".

**Reframe 2 — the key that removes the manual "subtract header+menu+searchbox":** don't compute
`calc(100vh - header - menu - searchbox)`. If the shell content area is a **viewport-height flex
column** and the table is `fill` (flex-grow) while header/menu/searchbox are `hug`/`fixed`, the layout
engine **subtracts the siblings automatically** — `fill` takes the remainder. The trick is a **flex
chain from the viewport root down**. Overflow: a `fill` element **scrolls internally** (the table's own
scroll), not the page.

**Rounding it out:** same model on **both axes** (horizontal already half-done via zones' flex-basis);
**portable** (web = flexbox; native = flex/constraints; the intent is data); **consolidates** the
ad-hoc hacks (listing-fills-window, crud-table insets, hand-tuned heights) into one declarative model;
**inferred by default** (listing table → `fill`, form → `hug`, shell → viewport; explicit override
when wanted — same pattern as #6/#7). Honest caveats: `100vh` lies on mobile (use `100dvh/svh`); nested
`fill` must be defined (flexbox handles it if the chain from the root is right).

**Status:** framework accepted (size property hug/fixed/fill + flex-chain-from-viewport-root +
inferred default). Converges with Idea #9 (grid track sizing).

---

## Idea #9 — One responsive grid as THE layout foundation (unifies #7 slots + #8 sizing)

**Origin:** it's common to build UI with a column system; Mateu seems to lack it.

**Honest read:** Mateu doesn't fully lack grid — `@FormLayout(columns)`, `@Section(columns)`,
`@Zones/@Zone` (width%), `@Colspan`, the auto-responsive form layout, and `DashboardLayout` (CSS grid
of panels with colSpan/rowSpan) all exist. The gap is **~5 scattered, specialized column mechanisms**
(forms, sections, zones, dashboard) and **no ONE general grid** for arbitrary composition. What's
missing is *a single grid*, not "grid".

**The coherence move:** one general **responsive grid as THE layout foundation** the others build on
(form columns, zones, dashboard, and the **template slots of #7**) — consolidate, not a 6th parallel
mechanism.

**The convergence — #9 + #8 + #7 are the same thing:**
- A layout **is a grid** (tracks/columns + rows), responsive by breakpoints.
- A track's size **IS the #8 intent**: `hug` = `auto`, `fixed` = `px`, `fill` = `fr` — literally CSS
  Grid. So #8 (sizing) and #9 (columns) are one model seen two ways.
- Template slots (#7) are placed on the grid; components **span** tracks.
- → **one layout system = a responsive grid; tracks sized hug/fixed/fill; slots and components span;
  inferred by default.** Three ideas collapse into one.

**Preserve the thesis:** inferred columns by default (as the responsive form layout already does);
explicit span/columns = the override (same pattern as #6/#7/#8). **Portable** (web = CSS Grid/flex;
native = their grid/constraints; the grid is data). It's a **foundation + escape hatch**, not the
default authoring mode.

**Status:** framework accepted (one responsive grid as the layout foundation, unifying #7 slots + #8
sizing, inferred by default).

---

## Idea #10 — Static site from the DSL (SEED — to develop together)

**Origin:** something to build a static site from the DSL.

**Quick read:** this is **Idea #1 made a deliverable** — the JSON specs (App/Routes/Screens/Templates/
DataSources) → a static site that runs client-side via the #1 **expander** (or pre-rendered). Half
there already (the bundle exporter `mvn -Pbundle` → `manifest.json`). Coherence question: *server-side
exporter (pre-expand)* vs *client-side expander (#1) shipped with the specs* — or both, as build
options. **Status:** seed; develop with #1.

## Idea #11 — Compile/build a UI without a renderer (SEED — to develop together)

**Origin:** compiling and building a UI without a renderer.

**Quick read:** the **interpreter-vs-compiler** axis of rendering. Today: wire + a runtime renderer
interprets it. Alternative: **AOT-compile the model → concrete UI** (HTML/JS, or real native like
SwiftUI/Compose) with **no Mateu runtime** — zero overhead, minimal bundles, runs where you can't ship
a renderer; cost: less backend-driven dynamism, and a compiler per target. Connects to #1 (the expander
is an interpreter) and #3 (interpreter vs compiler for the flow language). **Status:** seed.

## Idea #12 — Improve the visual builder plugin (SEED — to develop together)

**Origin:** improve the plugin to build the UI visually.

**Quick read:** Frame #5 ("where the path lives") — and it **resolves #1's YAML-vs-JSON readability
tension**: if you author **visually**, the hand-format debate mostly disappears (the builder emits
JSON, nobody hand-writes). The visual builder should be **the primary on-ramp**, producing exactly
App/Routes/Screens/Templates/grid/triggers→actions as data. **Status:** seed; ties to #5 (where the
path lives) + resolves #1.

---

## Where the spine stands (summary)

> An **App** (a shell: menu/title/subtitle/logo/widgets + a **Home** reference — R2) has **Routes**;
> each Route binds a **Screen** = **Template (slots) + ViewModel + Data** (#5, #7), laid out on **one
> responsive grid** whose tracks are sized **hug/fixed/fill** (#8, #9). Behavior is **triggers →
> actions** (#2/#3) producing **four effects** (route / ui-delta / data / commands — same on client and
> server, #4), over a **pub/sub bus that's abstract, not the DOM** (R1). Tables are **inferred columns
> by default + cell-as-component opt-in** (#6). It is all **data / JSON** (#1), **inferred by default,
> explicit when you want it**, and **runs with or without a backend** — exported static (#10),
> compiled without a renderer (#11), or authored **visually** (#12).

**Cross-cutting principles that repeat (the "feel" of the whole):**
1. **Everything is a component** (App, Screen, cell, slot content).
2. **Inferred by default, explicit as the override** (layout, columns, sizing, template, cell).
3. **One model, expressed as data (JSON)** — consumed, exported, compiled, or drawn.
4. **Client-side-capable** — behavior + rendering run with or without a backend.
5. **Escape hatches are explicit and relegated** (run-js, arbitrary cell, custom template) — never the
   default or the entry cost.

---

## Idea #13 — Business components: reusable BOUND compositions, first-class in DATA

**Origin:** business components — e.g. an "agency selector": a dropdown field fed from a specific
endpoint. Is it sufficiently resolved?

**What it is (key distinction, do NOT conflate with #14):** a business component is a **reusable, BOUND
composition of EXISTING components** (a shape + a data source + optional behavior), named. There is
**no new rendering** → it is **pure data, ports for free, runs with no backend** (#1). An agency
selector is a `dropdown + source(agencies)`, NOT a custom component.

**What exists today (the code path):**
- **Semantic (composed) annotations** — exactly this: `@Lookup(search=…) @RestOptions(source="agencies")
  @interface AgencyId {}`, then `@AgencyId String agencyId`. A reusable business field type.
- **REST source catalogue** (`@RestSource`/`sources.yaml`): the endpoint named once, referenced by the
  business component.

**The gap:** the **DATA/DSL equivalent**. Reuse currently lives in an annotation (code). In the
JSON/no-backend world (#1) and the **visual builder** (#12), you want a **named component definition in
a catalogue** — `AgencySelector = { dropdown, source: agencies }` — referenced by name.
**Resolution:** a business component must be first-class in BOTH **code** (semantic annotation) AND
**data** (a catalogue entry) — one concept. It is reuse + inference, portable for free.

**Status:** captured. Code path exists (semantic annotations + source catalogue); the gap is making it
first-class **in data** (a named, referenceable component definition), for #1 + #12.

## Idea #14 — Custom components: genuinely new rendering = the per-renderer escape hatch

**Origin:** custom components.

**What it is:** a **genuinely NEW component type** (new rendering Mateu doesn't ship). Unlike a business
component, this **does not port for free** — each renderer must know how to paint it.

**What exists today:**
- **`ComponentAdapter<T>`** — adapts a domain object into a tree of **existing** components (composition
  + state round-trip). Works when the "custom" thing is composed of known pieces.
- **`MicroFrontend`** — embeds an external UI island. Heavy but works.
- Renderers have `SUPPORTED_TYPES` + the `<mateu-unsupported>` placeholder (graceful degradation).

**The gap:** a **new component TYPE** (new visual) the developer **registers per renderer** (a web
component / a native view), which Mateu emits in the tree and which **degrades gracefully** where not
provided. Today the renderer is **closed** to new types short of a fork. **Resolution:** custom
component = **declare the type + its props/slots in the model; provide a per-renderer renderer for the
platforms you target; `<mateu-unsupported>`/fallback elsewhere.** The **explicit, relegated escape
hatch** — same principle as `run-js` (#3) and the arbitrary cell (#6).

**The distinction, one line:** *Business component = reusable BOUND composition of existing pieces →
data, ports for free, no backend. Custom component = a NEW piece with its own rendering → per-renderer
escape hatch, does NOT port for free.* (Avoid: treating the agency selector as "custom" and paying
per-renderer code when it's a business component.)

**Status:** captured. Composition path exists (`ComponentAdapter`); the real extensibility gap is the
**new-rendering path** (per-renderer registration + degradation), which carries the multi-renderer tax.

---

## Ideas backlog

_(next ideas land here as they come)_
