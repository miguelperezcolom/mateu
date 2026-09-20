# Phase 8 (coherence-execution #15) — Seeds: compile-without-renderer (#11) + visual builder (#12)

**Status:** design. These are the two ideas the coherence plan marks **"SEED — to develop together"**
/ *"explored with the maintainer"* — the one phase reserved for collaboration. This doc scopes both,
surfaces the forks with a **recommended reversible default** for each (so work can proceed additively
without a breaking decision), and names a bounded, verifiable **first increment**.

The two seeds are at very different maturities, which changes what Phase 8 means for each:

- **#12 (visual builder) is NOT a fresh seed.** It already has a full live plan
  (`design/visual-editor-plan.md`) with its own phased Status, a ~3k-LOC shared web editor
  (`apps/visual-editor`), IntelliJ + VSCode hosts, and Phase 0 guards DONE. Coherence-Phase-8 for #12
  = **advance that plan**, not design from zero. This doc defers to it and only records the coherence
  linkage + the next actionable increment.
- **#11 (compile-without-renderer) is a genuine untouched seed.** It gets a real design below.

---

## Idea #11 — Compile/build a UI without a renderer (AOT)

**The axis.** Today the wire is *interpreted*: a runtime renderer (vaadin, VB, RN, …) reads the wire
model and paints it. The alternative is to **AOT-compile the model → concrete UI** with **no Mateu
runtime**: zero runtime overhead, minimal bundle, runs where a renderer can't ship. The cost is less
backend-driven dynamism (a compiled screen is frozen at build time) and **one compiler per target**.

**Where it already half-exists.** The Phase-6 client-side expander (`libs/mateu/.../expander/`) is an
*interpreter* of the declarative path: authored spec → wire, in the browser. Its mapping knowledge
(container lifting, Card content-in-metadata, listing→Crud, ComponentRef/CustomComponent handling) is
exactly what a compiler needs — but the expander emits the WIRE for a runtime renderer, whereas a
compiler emits the FINAL artifact (HTML/JS or native) directly. So #11 reuses the expander's *model
understanding* and swaps its *output stage*.

### Forks (recommended reversible default in bold)

1. **Target.** HTML/CSS(+minimal JS) · React/Vue source · real native (SwiftUI/Compose).
   → **Default: static HTML/CSS + minimal JS.** Broadest reach (any CDN/email/embed), lowest bundle,
   no per-native-target compiler burden, and it is the natural sibling of the static-bundle exporter
   (`MateuBundleExporter`) which today ships wire+runtime. A native target is a large separate effort;
   defer until demand. Reversible: the compiler is a new tool; adding a second target is additive.

2. **Where the compiler lives.** A **build-time Maven goal** (sibling of `mateu-bundle:openapi`/`:server`)
   · a Node/TS tool in the monorepo · both.
   → **Default: a Node/TS tool in `libs/mateu` reusing the expander**, invoked by a thin `mateu-bundle`
   goal later. Rationale: the expander (the model understanding) is already TS; re-implementing it in
   Java would be a second copy of the exact thing the coherence plan is trying to *stop* copying. The
   Java goal can shell out / port later if a pure-JVM path is needed.

3. **Scope of the first compiler.** Full catalog · the **declarative/no-backend subset** the expander
   already covers.
   → **Default: the declarative subset** (routes with a `definition`, no viewModel — the €0 path).
   That is the subset with no server behaviour to freeze, so a compiled artifact is *correct*, not
   just static. Interactive/backend-driven screens stay interpreted. This also makes the first
   increment verifiable against the expander's existing goldens.

4. **Dynamism boundary.** A compiled screen is frozen; what about triggers/actions/REST sources?
   → **Default: compile the STATIC render; leave behaviour to a tiny opt-in runtime shim** (or omit).
   A read-only declarative page (text, layout, a listing bound to a public REST source) compiles to
   pure HTML+fetch with no Mateu runtime. A page needing RunAction/secret/proxy is out of scope for
   the compiler (it needs a backend — say so, don't half-compile it). This keeps the "no runtime"
   promise honest.

### First increment (bounded, verifiable)

**A static-HTML compiler for a bare declarative definition**, in `libs/mateu`:
`compileDefinition(spec) → { html, css }` that reuses `expandDefinition`/`expandComponent` for the
model understanding and walks the resulting wire tree emitting semantic HTML (no Lit, no design
system — plain elements + inline critical CSS), for the subset the expander covers today
(VerticalLayout/HorizontalLayout/Div, Card, Text, and a listing→table). Verified by a vitest golden
per fixture (reuse the expander's `__fixtures__`) asserting the emitted HTML renders the same content,
and one end-to-end check: compile `demo-static-bundle`'s about page → open the HTML file headless →
assert the text is present with **zero network calls to a Mateu backend**. Additive, no wire change,
no breaking change. Follow-ups: listing-with-REST-source (fetch on load), a `mateu-bundle:compile`
Maven goal wrapping it, then the dynamism-shim decision.

**Why this is safe to start autonomously:** it is a new, isolated tool; every fork above has an
additive/reversible default; nothing it does changes the wire, the renderers, or existing bundles.

---

## Idea #12 — Visual builder as the primary on-ramp

**Not designed here.** The authoritative plan is `design/visual-editor-plan.md` (its bottom **Status**
section is the live state). Baseline already built: the shared web editor (`apps/visual-editor`),
IntelliJ + VSCode hosts, project awareness, Phase 0 guards (palette completeness + authoring↔wire
parity) DONE.

**Coherence linkage.** #12 resolves #1's YAML-vs-JSON authoring tension (author visually → the builder
emits JSON, nobody hand-writes) and is Frame #5 ("where the path lives"). Everything Phases 1–7
consolidated (App/Route/Screen/Template/grid/triggers→actions, business + custom components in data)
is now expressible as data, which is exactly what the builder produces — so the builder's catalog
should now include the Phase-7 additions (rich columns, `ComponentRef` business components, and
`CustomComponent` as a relegated palette entry that emits `{type, name, props}`).

**Next actionable increment (from `visual-editor-plan.md` Status):** advance the in-progress phase of
that plan (live end-to-end host verification + the un-wired VB-feel surfaces). Each sub-step lands as
its own PR referencing that plan — this doc does not duplicate its sequence.

**One coherence-specific follow-up worth naming:** ensure the palette-completeness guard covers the
Phase-7 wire additions so the builder can author them — `CustomComponent` should appear as an explicit
"custom component (advanced)" palette entry, and `ComponentRef` as "business component (by name)".
That is a small, verifiable increment against the existing guard.

---

## Sequencing within Phase 8

1. **#11 first increment** (static-HTML compiler for the declarative subset) — bounded, isolated,
   verifiable; no dependency on the builder.
2. **#12 palette coverage of Phase-7 additions** — small, guarded increment against the existing
   editor.
3. Then advance `visual-editor-plan.md`'s in-progress phase as its own stream (it is a long,
   pausable/resumable plan in its own right — coherence-Phase-8 does not require *finishing* the
   visual builder, only advancing it and keeping it coherent with the consolidated model).

Phase 8 is "seeds explored together": the deliverable is a **credible, verifiable first step on each
axis** plus this design, not a finished compiler or a finished builder — both are open-ended by nature
and the plan says so.
