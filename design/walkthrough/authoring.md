# Walkthrough — authoring pipeline, data and developer tooling

Branch `walkthrough/authoring` (from `origin/master`, 2026-10-12). Walked as a developer would: generate
a project, author `specs/ui` files, run it on every runtime, open it in the visual editor, bundle it,
derive its API. Every fix is at the root and carries a test that fails without it.

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken, not fixed (why) · N/A (why) ·
⏳ not walked yet.

## 1. `specs/ui` file kinds × where they run

Columns: **Served** = a Java backend, browser on Vaadin (MVC, WebFlux, Quarkus, Micronaut, Helidon MP —
all five via the shared Playwright suite); **Redwood** = mvc-app1 built with `mateu-redwood`;
**Bundle** = `mateu-bundle:bundle` with `specsOnly` + `staticOnly`, served by a plain static server;
**Editor** = the visual editor (canvas / Play / Export); **Schema** = `specs-schema.json` accepts it.

| Kind | Served (5 adapters) | Redwood | Bundle (specsOnly) | Editor | Schema |
|---|---|---|---|---|---|
| UI mount (`type: UI`, `home:`) | ✅ starters yaml/both on 5 runtimes (generated + booted) | ✅ yaml-mvc-redwood | ✅ static starter | ✅ mount editor opens | ✅ |
| Routes (`layout:`, fixed/default params, one definition → N routes) | 🔧 definition-only route under a plain `@UI("")` root rendered the root (fe2c684e6) — now ✅ `yaml-authoring.spec.ts` | ✅ (pinned flavours) | ✅ pinned params, deep link | ✅ routes editor | 🔧 `data: <source>` rejected (ad22b0660) |
| Route `state:` / `appState:` seeds | ✅ spec | ✅ | 🔧 ignored in the browser (de1c198cf) | 🔧 Play dropped them (8ca9cf96e) | ✅ |
| Route `viewModel:` (Code + YAML) | 🔧 Micronaut CRUD search threw / Helidon root deep link 404 (763daa246) — ✅ 5 runtimes, CRUD list/edit/create | ✅ Increment round trip | N/A (needs a backend) | ✅ "needs a backend" notice | ✅ |
| Route `access:` | ✅ 403 + "You are not allowed" (spec) | ⏳ | ✅ staticOnly refuses it (no identity) | ✅ "access rules not applied in Play" | ✅ |
| App shell (`type: AppShell`) | ✅ yaml starter (menu, home, products) | ✅ | ✅ | ✅ shell editor + Play | ✅ |
| Page definition (bare tree / `layout:` envelope) | ✅ | ✅ | ✅ | ✅ canvas, Layers↔canvas selection, Properties, YAML dock, Play | 🔧 `layout:` envelope rejected (ad22b0660) |
| `layoutDelta:` (over a Java view model) | 🔧 label + hidden ✅, but `order:` never crossed the FormRows inference lays a two-column form out in, while the editor applies it to the flat run — the page silently ignored what the editor showed (8261e24f9, Java + Python; ❌ .NET not ported: no SDK) — ✅ spec on 5 adapters | ⏳ | N/A (needs the view model) | ✅ editor model already flat | 🔧 rejected (ad22b0660) |
| Partials (`partials/*.yaml`, `type: Partial`) | ✅ spliced (spec) | ✅ | 🔧 "Unknown metadata type Partial" (de1c198cf, `DefinitionInliner`) | 🔧 Play (8ca9cf96e); ❌ offline canvas shows the placeholder (see below) | 🔧 multi-component partial rejected (ad22b0660) |
| Business components (`components.yaml`, `ComponentRef`) | ✅ (spec) | ✅ | 🔧 "Unknown business component" (de1c198cf) | 🔧 opened as an empty page + offered as a route layout (3123cb827); Play 🔧 (8ca9cf96e) | 🔧 no branch (ad22b0660, 1fcd29de5) |
| Sources (`sources.yaml`, `sample:`, mock mode) | ✅ yaml starter sample mode on; off → live endpoint; 🔧 a missing endpoint answered index.html 200 → silent "Search to see results" (4d25240d9, parity contract on 5 adapters) | ✅ (static Redwood bundle lists the samples) | ✅ | ✅ sources editor; samples preview | ✅ |
| Sources `proxy: true` + `${secret.X}` | 🔧 a YAML listing on a proxied entry never fetched (5680acea3) — ✅ against a keyed API, key from `MATEU_SECRET_API_KEY` server-side only; direct (non-proxy) ref ✅ | ⏳ | ✅ staticOnly refuses a proxied source | N/A (sample mode) | ✅ |
| Actions catalogue (`actions.yaml`) + page `actions:` flows | ✅ (spec, both buttons navigate) | ✅ | 🔧 staticOnly failed the build on a flow / catalogue entry (de1c198cf) — ✅ runs | ✅ actions editor | 🔧 page `actions:` matched the Actions branch too (ad22b0660) |
| Types (`types.yaml`, `fieldType:`) | ✅ label; 🔧 placeholder never rendered on Vaadin (1710d2fad) | ✅ | ✅ | ✅ types editor | ✅ |
| Translations + `${i18n.key}` | ✅ en + es-ES (spec) | ✅ | ✅ | ✅ Play; ❌ offline canvas shows the key | ✅ |
| Environments (`MATEU_ENVIRONMENT`, `-Dmateu.bundle.environment`) | ✅ served app re-pointed to a staging endpoint | ⏳ | ✅ manifest re-pointed | ✅ "data" summary | ✅ |
| Project settings (`renderer:`) | ✅ (wizards write it) | ✅ | ✅ `-Dmateu.bundle.renderer=redwood`: clear error without `mateu-redwood`; with it the Redwood bundle serves shell, listing and the walkthrough page (partial, component, seed) from a static server | ✅ project editor | ✅ |
| Access keys (`eyesOnly`) | ✅ field absent for anonymous (spec) | ✅ hidden | ✅ staticOnly refuses it | ✅ shown, flagged | ✅ |
| Live reload (`mateu.dev`) | ✅ yaml starter: spec edit re-renders in place, value kept, indicator (5/6 of `live-reload-probe.mjs`); ❌ the HotSwap reload posts an empty componentState for an unseeded definition-only page (it renders ClientSide, no `mateu-component` holds the typed values) — the value survives in the DOM, the probe's request check fails | ⏳ | N/A | N/A | N/A |

## 2. Tooling × runtimes

| Feature | Result |
|---|---|
| New Project (VS Code CLI front door, `scripts/new-project.mjs`) × code on spring-mvc/webflux/quarkus/micronaut/helidon-mp | ✅ generated, packaged, booted on :18610, home + products rendered |
| … code + Redwood on WebFlux | 🔧 every menu page "Page not found" (root app only looked up through RoutedClassProviders) + a false "Mateu found no UI to serve … every URL will answer 404" at every WebFlux start, Vaadin too (fed4b5cfd) — ✅ home + products |
| … Redwood on Quarkus/Micronaut/Helidon | N/A: the wizard offers Redwood on Spring only (`new-project.json`) |
| … code + `empty` sample, code + Redwood (MVC) | ✅ (Redwood: ❌ console errors `#{env.catalogJson}#` / `%{env.userProfileUrl}%` 400 — unsubstituted VB tokens, Redwood area) |
| … yaml (+pages), yaml + Redwood | ✅ |
| … static | ✅ `mvn package` + `npx serve -s`, CTA navigates |
| … both on spring-mvc/webflux/quarkus | ✅ CRUD list → open → edit+save → New (validation) → create → deep link `/products/new` → back |
| … both on micronaut/helidon-mp | 🔧 refused by the wizard; really broken (Micronaut facade, Helidon root deep links) → fixed and now offered (763daa246, bd4f80c78, +2 `cases.json`) |
| … dotnet | ❌ not exercised: no .NET SDK on this machine |
| Python port serving the walkthrough YAML (MATEU_SPECS_DIR, Vaadin dev server) | 🔧 only `routes.yaml` read — mount-listed / `type: Routes` files answered "Route not found"; 🔧 a definition-only page dropped its route seeds (8596758f5, `test_route_files.py`, `test_definition_only_seeds.py`); ✅ translation es, partial, field type, 403; ❌ `Notice` (any type outside 8) renders "Unsupported component" — the ports' YAML builder covers 8 types (parity doc corrected to 🟡) |
| … python | ✅ generated tests pass; 🔧 docs pointed at the removed Compose renderer and the starter said nothing about seeing it in a browser (de9d52296) — verified through the Vaadin dev server (`MATEU_BACKEND=…`) |
| Maven archetype (code / yaml / static, JDK 21) | ✅ generated, built, code booted + CRUD walk; yaml booted |
| IntelliJ renderer (`./gradlew renderProbe` over the walkthrough page wire, es) | ✅ translated title, partial fields, field type, business component, buttons, a11y names |
| IntelliJ: schema provider, New › Mateu skeletons, New Project generator (`MateuProjectGeneratorTest`, byte-compares the TS engine) | ✅ `./gradlew test` (schema, newfile, newproject: 53 tests). IntelliJ itself NOT driven (no GUI): completion/validation inside the IDE not exercised |
| VS Code: manifest, New File, Add Route, New Project, live run | ✅ vitest 167 + new `specsSchema.test.ts` |
| Schema in the editors' engines | ✅ IntelliJ (real `JsonSchemaService` test): top-level and NESTED `type:` values + a typed node's keys (2 new tests); ❌ yaml-language-server (VS Code): 5 s to validate a 4 KB deep page (demo-vb `components-2.yaml`), re-run on every keystroke — the 125-way `oneOf` Component union. A `type`-dispatch (`if`/`then`) union validates it in 50 ms with the same completions, but IntelliJ then offers only `Workflow` for a nested `type:`; a guarded `oneOf` (`if`/`then`/`else: false`) times IntelliJ completion out. Owner: ship a per-editor variant (VS Code staging could transform it) or accept the cost |
| `specs-schema.json` vs every shipped file, every New File template, every doc example | 🔧 5 gaps (ad22b0660) — pinned by `specsSchema.test.ts` (ajv) |
| Docs component trees parse with the loader's mapper | ✅ new `DocumentedYamlExamplesTest` (core) |
| Visual editor dark mode | ✅ routes and listing screens legible |
| Routes editor: a route's `state:` seed | 🔧 kept verbatim but neither shown nor editable → a State column (9408bb589, DOM test); `appState:` still only via YAML |
| Editor pickers (label → `${i18n.*}` keys, actionId → page + catalogue ids, route → registry) | ✅ |
| Visual editor standalone: every file kind opens, canvas selection, Properties, YAML dock, Play, Export | ✅ / 🔧 as in the table above; vitest 429 |
| Editor Export → static host | 🔧 shipped raw `layout:` routes + basename keys + no shell → opened on nothing (8ca9cf96e); verified: exported manifest beside the renderer serves shell, listing, page |
| `mateu-bundle:openapi` → `:server` → compile → run | ✅ demo-static-bundle: contract (3 ops, provenance), generated module fails to start naming the missing adapter, starts with one, answers; regeneration keeps the hand-written adapter |
| Deep links / SPA fallback | 🔧 a data fetch of an unknown path got index.html 200 on all 5 adapters (4d25240d9); 🔧 Micronaut 404'd any deep link whose segment had a space, accent, `+`, `~`, `:` or `@` (4bc185173); both pinned by parity contracts on 5 adapters |
| Security: CORS off, MCP off, forged bearer reveals nothing | ✅ `AdapterParity*` on all five adapters (run) |
| Code twins (RouteEntrySupplier/AppSupplier/MenuSupplier) | ✅ core suite (1742) + Python suite (783); .NET ❌ no SDK |

## 3. Doc claims found wrong and fixed

- Python and C# manuals: "set the Compose app's `mateu.baseUrl`" — Compose was removed; now explain that
  the port serves the API only and how to run a renderer against it (de9d52296).
- New Project: "Code + YAML is not on Micronaut or Helidon: they do not resolve a view model bound only
  in routes.yaml" — the real causes were two adapter bugs, fixed; the flavour is offered there now.
  (CLAUDE.md still carries the old sentence — owner's file, not edited.)

## 4. ❌ open, owner decision or other area

1. **Offline canvas** (editor, Client-side / remote-down fallback) renders `Partial` / `ComponentRef` as
   placeholders and `${i18n.key}` as the key. Play and Export resolve them now; inlining into the canvas
   would break the `ve-<path>` node ids the click-to-select relies on — needs a design choice.
2. **Python / .NET starters open nothing in a browser** (`:8080` is API-only). Docs now say how to run a
   renderer against them; should the ports serve the web renderer themselves?
3. **Redwood index**: unsubstituted Visual Builder tokens (`#{env.catalogJson}#`, `%{env.userProfileUrl}%`)
   log a 400 and a VB error on every page — Redwood area.
4. **.NET layoutDelta** still reorders within a FormRow only (Java and Python now treat a form's rows as one run) — port when an SDK is at hand.
5. **Live reload** of an unseeded definition-only page sends an empty componentState (it is ClientSide).
7. **Ports' YAML builder** (Python, .NET) covers 8 component types; a YAML page with a `Listing`, `Notice`, `Card`… served by a port shows "Unsupported component". .NET also still reads only `routes.yaml` (Python fixed). Owner: grow the builders or keep YAML pages Java-first?
8. **VS Code schema performance** (see the editors' engines row): needs a per-editor schema shape or acceptance.
9. Canvas vs app: a `dataType: status` column shows `AVAILABLE` on the offline canvas and `Available`
   served.

## 5. Not walked yet ⏳

a proxied `optionsSource` on a select; the bogus `declaredActions_*` / `nested-form-action-catalog-sources_*` ids a SeededYamlPage advertises (wire noise from its record fields); `PrincipalResolver`
with a real security module per adapter; .NET everything (no SDK); Python served YAML in a browser;
IntelliJ completion/validation inside the IDE and `renderProbe`; VS Code extension inside VS Code;
editor Board, image/icon/source pickers, image/icon/source/route pickers, Redwood canvas; RN/IntelliJ renderers for
the YAML fixtures; docs' Java code samples compiled.

## 6. Permanent tests added

- `frontend/app/vscode-extension/src/specsSchema.test.ts` — schema vs shipped files, New File templates, docs.
- `backend/shared/core/.../DocumentedYamlExamplesTest` — doc trees parse.
- `e2e/tests/shared/yaml-authoring.spec.ts` + sample1 fixtures — all five Java adapters.
- `SeededYamlPageRestSourcesTest` (proxied listing rows), `DefinitionOnlyRouteSyncTest` (plain root), `StaticSafetyCheckTest` (flows), `DefinitionInlinerTest`,
  `SpaFallbackTest` + `AdapterParityITFoundation.doesNotAnswerADataFetchWithTheIndex` (5 adapters),
  Helidon `YamlMountRoutesTest` (root mount), `MateuStaticFacadesStartupTest` (Micronaut),
  `bundleRoutes.test.ts` (state seeds), `mateu-field.test.ts` (placeholder), editor
  `componentCatalogue.test.ts`, `playManifest.test.ts`, `exportBundle.test.ts`, 2 `cases.json` cases.
