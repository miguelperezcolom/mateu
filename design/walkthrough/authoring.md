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
| Route `access:` | ✅ 403 + "You are not allowed" (spec) | ✅ 403 + "You're not allowed to do this." (mvc-app1 on `mateu-redwood`) | ✅ staticOnly refuses it (no identity) | ✅ "access rules not applied in Play" | ✅ |
| App shell (`type: AppShell`) | ✅ yaml starter (menu, home, products) | ✅ | ✅ | ✅ shell editor + Play | ✅ |
| Page definition (bare tree / `layout:` envelope) | ✅ | ✅ | ✅ | ✅ canvas, Layers↔canvas selection, Properties, YAML dock, Play | 🔧 `layout:` envelope rejected (ad22b0660) |
| `layoutDelta:` (over a Java view model) | 🔧 label + hidden ✅, but `order:` never crossed the FormRows inference lays a two-column form out in, while the editor applies it to the flat run — the page silently ignored what the editor showed (8261e24f9 Java + Python, 4acf432a7 .NET) — ✅ spec on 5 adapters | ✅ relabelled, hidden, `note` moved first on the same row (mvc-app1 on `mateu-redwood`) | N/A (needs the view model) | ✅ editor model already flat | 🔧 rejected (ad22b0660) |
| Partials (`partials/*.yaml`, `type: Partial`) | ✅ spliced (spec) | ✅ | 🔧 "Unknown metadata type Partial" (de1c198cf, `DefinitionInliner`) | 🔧 Play (8ca9cf96e); 🔧 offline canvas inlines it too (batch 3, `canvasReferences.ts` — the inlined roots keep the reference's `ve-` id) | 🔧 multi-component partial rejected (ad22b0660) |
| Business components (`components.yaml`, `ComponentRef`) | ✅ (spec) | ✅ | 🔧 "Unknown business component" (de1c198cf) | 🔧 opened as an empty page + offered as a route layout (3123cb827); Play 🔧 (8ca9cf96e) | 🔧 no branch (ad22b0660, 1fcd29de5) |
| Sources (`sources.yaml`, `sample:`, mock mode) | ✅ yaml starter sample mode on; off → live endpoint; 🔧 a missing endpoint answered index.html 200 → silent "Search to see results" (4d25240d9, parity contract on 5 adapters) | ✅ (static Redwood bundle lists the samples) | ✅ | ✅ sources editor; samples preview | ✅ |
| Sources `proxy: true` + `${secret.X}` | 🔧 a YAML listing on a proxied entry never fetched (5680acea3) — ✅ against a keyed API, key from `MATEU_SECRET_API_KEY` server-side only; direct (non-proxy) ref ✅; 🔧 a select's `optionsSource` on a proxied entry was fetched by the browser with the `${secret.X}` placeholder (401), and an unseeded page had no component to answer `__restfetch__` (269d24324, `MountHomeSyncTest` proxied-options + `mateu-field.test.ts`) — ✅ against the keyed API | ✅ yaml starter on `mateu-redwood`: a listing's rows and a select's options from the keyed entry, key injected server-side | ✅ staticOnly refuses a proxied source | N/A (sample mode) | ✅ |
| Actions catalogue (`actions.yaml`) + page `actions:` flows | ✅ (spec, both buttons navigate) | ✅ | 🔧 staticOnly failed the build on a flow / catalogue entry (de1c198cf) — ✅ runs | ✅ actions editor | 🔧 page `actions:` matched the Actions branch too (ad22b0660) |
| Types (`types.yaml`, `fieldType:`) | ✅ label; 🔧 placeholder never rendered on Vaadin (1710d2fad) | ✅ | ✅ | ✅ types editor | ✅ |
| Translations + `${i18n.key}` | ✅ en + es-ES (spec) | ✅ | ✅ | ✅ Play; 🔧 offline canvas translates it too (batch 3) | ✅ |
| Environments (`MATEU_ENVIRONMENT`, `-Dmateu.bundle.environment`) | ✅ served app re-pointed to a staging endpoint | ✅ `MATEU_ENVIRONMENT=staging` re-pointed the proxied source (`?env=staging` reached the API), rows rendered | ✅ manifest re-pointed | ✅ "data" summary | ✅ |
| Project settings (`renderer:`) | ✅ (wizards write it) | ✅ | ✅ `-Dmateu.bundle.renderer=redwood`: clear error without `mateu-redwood`; with it the Redwood bundle serves shell, listing and the walkthrough page (partial, component, seed) from a static server | ✅ project editor | ✅ |
| Access keys (`eyesOnly`) | ✅ field absent for anonymous (spec) | ✅ hidden | ✅ staticOnly refuses it | ✅ shown, flagged | ✅ |
| Live reload (`mateu.dev`) | 🔧 after a backend RESTART the page never re-rendered: the dying process held the dev event stream through Spring's 30 s graceful shutdown, so the browser neither saw it leave nor reached the new one — streams now complete on JVM shutdown (core hook; MVC and Quarkus end the response) (`DevModeTest`); ✅ `live-reload-probe.mjs` 9/9 on the yaml starter (spec edit in place, value kept, indicator, HotSwap, restart); the probe's HotSwap check now asserts the value on screen, not in the request (a client-side page has no state to send) | ✅ 9/9 (`INPUT='oj-input-text input'`) | N/A | N/A | N/A |

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
| … dotnet (a .NET 8 SDK installed into the scratchpad; the local sources packed as 0.0.1-MATEU) | ✅ generated, built, run, rendered through the Vaadin dev server (home + products) |
| .NET port serving the walkthrough YAML | 🔧 only `routes.yaml` read, route seeds dropped, delta order within rows only (4acf432a7, 711 tests incl. `RouteFilesTests`, `DefinitionOnlySeedsTests`, a row-order case) — ✅ same result as Python; 🔧 YAML builder: the whole fluent catalogue generically + `type: Listing` over a REST source + `actionable: RouteLink` buttons (batch 3, `YamlListingTests`; `AppShell` definitions stay Java-only) |
| Python port serving the walkthrough YAML (MATEU_SPECS_DIR, Vaadin dev server) | 🔧 only `routes.yaml` read — mount-listed / `type: Routes` files answered "Route not found"; 🔧 a definition-only page dropped its route seeds (8596758f5, `test_route_files.py`, `test_definition_only_seeds.py`); ✅ translation es, partial, field type, 403; 🔧 `Notice` and every other fluent component build generically (pages #14), `type: Listing` + `RouteLink` buttons added in batch 3 (`test_yaml_listing.py`); parity row updated |
| … python | ✅ generated tests pass; 🔧 docs pointed at the removed Compose renderer and the starter said nothing about seeing it in a browser (de9d52296) — verified through the Vaadin dev server (`MATEU_BACKEND=…`) |
| Maven archetype (code / yaml / static, JDK 21) | ✅ generated, built, code booted + CRUD walk; yaml booted |
| IntelliJ renderer (`./gradlew renderProbe` over the walkthrough page wire, es) | ✅ translated title, partial fields, field type, business component, buttons, a11y names |
| IntelliJ: schema provider, New › Mateu skeletons, New Project generator (`MateuProjectGeneratorTest`, byte-compares the TS engine) | ✅ `./gradlew test` (schema, newfile, newproject: 53 tests). IntelliJ itself NOT driven (no GUI): completion/validation inside the IDE not exercised |
| VS Code: manifest, New File, Add Route, New Project, live run | ✅ vitest 167 + new `specsSchema.test.ts` |
| Schema in the editors' engines | ✅ IntelliJ (real `JsonSchemaService` test): top-level and NESTED `type:` values + a typed node's keys (2 new tests); 🔧 yaml-language-server (VS Code): 5 s to validate a 4 KB deep page — the 125-way `oneOf` Component union; a `type`-dispatch validates it in 50 ms but IntelliJ completes a nested `type:` from it with one value. DECIDED batch 3: a per-editor spelling of the ONE generated schema — the VS Code extension stages `Component`/`Actionable`/`Step`/`Trigger`/`UserTrigger` as `type` dispatches (`scripts/schema-dispatch.mjs`, `specsSchema.test.ts` runs the shipped files on both), IntelliJ keeps the generated `oneOf` |
| `specs-schema.json` vs every shipped file, every New File template, every doc example | 🔧 5 gaps (ad22b0660) — pinned by `specsSchema.test.ts` (ajv) |
| Docs component trees parse with the loader's mapper | ✅ new `DocumentedYamlExamplesTest` (core) |
| Visual editor dark mode | ✅ routes and listing screens legible |
| Routes editor: a route's `state:` / `appState:` seeds | 🔧 kept verbatim but neither shown nor editable → State (9408bb589) and App state (8cb26a898) columns, DOM tests |
| Editor pickers (label → `${i18n.*}` keys, actionId → page + catalogue ids, route → registry) | ✅ |
| Editor icon / image / source pickers, Board | ✅ (browser probe) icon picker: 240 Vaadin icons, filter, pick writes the property and the canvas paints it; image: free text writes `src` (standalone has no host images to list); source picker lists `sources.yaml` and writes `ref:`; Board: one card per route with its thumbnail, Edit/Play |
| Editor Redwood canvas (`renderer: redwood`) | ✅ the real Redwood app boots in the frame ("ready", Oracle CDN reachable), paints the yaml starter's listing from `sample:` data with humanized status badges, and a click inside the frame selects the node (Properties → Listing); ❌ the listing's `filters:` field also paints as a bare **Status select below the table** — the served Redwood app shows it only in the smart search bar. The expander's shape matches the server's (`metadata.filters`), so it is in the preview path of the Redwood renderer — Redwood area (repro: yaml starter `products.yaml`, editor on `renderer: redwood`, no backend) |
| Docs: Java samples of the code twins (`RouteEntrySupplier`, `AppSupplier`/`MenuSupplier`, `RestSourceCatalogSupplier`, `ActionCatalogSupplier`, `FieldTypeCatalogSupplier`, `TranslationsSupplier`, `PrincipalResolver`, `SecretsProvider`, `ListingExporter`) | ✅ every block declaring a type was extracted and compiled with `javac` against `mateu-uidl` (14 blocks across 12 pages): all compile, except two that call the reader's own client / a third-party library (a vault, POI/PDFBox) and one deliberate API outline (`ListingExporter` signatures — they match the real records) |
| Visual editor standalone: every file kind opens, canvas selection, Properties, YAML dock, Play, Export | ✅ / 🔧 as in the table above; vitest 429 |
| Editor Export → static host | 🔧 shipped raw `layout:` routes + basename keys + no shell → opened on nothing (8ca9cf96e); verified: exported manifest beside the renderer serves shell, listing, page |
| `mateu-bundle:openapi` → `:server` → compile → run | ✅ demo-static-bundle: contract (3 ops, provenance), generated module fails to start naming the missing adapter, starts with one, answers; regeneration keeps the hand-written adapter |
| Deep links / SPA fallback | 🔧 a data fetch of an unknown path got index.html 200 on all 5 adapters (4d25240d9); 🔧 Micronaut 404'd any deep link whose segment had a space, accent, `+`, `~`, `:` or `@` (4bc185173); both pinned by parity contracts on 5 adapters |
| Security: CORS off, MCP off, forged bearer reveals nothing | ✅ `AdapterParity*` on all five adapters (run) |
| Real security module on a generated project (yaml starter + Spring Security, httpBasic, in-memory users) | 🔧 the YAML starter's `@SpringBootApplication(scanBasePackages = "io.mateu")` scanned Mateu's package and NOT the app's: the developer's `SecurityFilterChain` was ignored (Boot's default login answered 401 to everything), and so would be any `PrincipalResolver`, `SecretsProvider`, `ListingExporter`… they add — fixed in the starter (so the archetype and both IDE wizards), pinned by `newProject.test.ts`; ✅ then `access: roles: [admin]`: anonymous 403, a `staff` user 403, an `admin` 200 with the page |
| Real security module on Quarkus (Code + YAML starter + `quarkus-elytron-security-properties-file`, basic auth) | 🔧 a YAML mount on Quarkus is served by Vert.x routes that ran at `MIN_VALUE+105`, BEFORE Quarkus' authentication (-200) and authorization (-100) filters: `access:` refused every caller, the admin included, the app's `quarkus.http.auth.permission` policies never applied to the mount, and a refusal answered **500** (no JAX-RS exception mapper on that path) — mount routes moved after security, the identity read off the RoutingContext, refusals → 403 (`YamlMountRoutesTest`); ✅ anonymous 403, staff 403, admin 200 with the page; index, deep link and the code-backed route still served. The shared e2e suite never saw it: its Quarkus SUT has `@UI` classes, so it is served by the generated JAX-RS controllers |
| A refused YAML route on the adapters' own routing (sync + sse) | 🔧 Helidon (SE routing) answered **500** for a refused YAML route and for a refused streamed action — the JAX-RS mapper does not cover that routing, and on SSE the stream was committed before the lazy guard ran; Quarkus' SSE leg the same → 403 on both legs, the stream's head now goes out with its first event (`YamlMountRoutesTest` in both adapters); ✅ Spring MVC already answered 403 on sync and sse |
| Real security module on Micronaut (Code + YAML starter + `micronaut-security`, basic auth via an `HttpRequestAuthenticationProvider`) | ✅ `access: roles: [admin]` on sync: anonymous 403, staff 403, admin 200; 🔧 a refused STREAMED request (`/v3/sse/`, what a LongTask or `Action.sse` uses) answered **500** on Micronaut — its exception handler is not applied to a `text/event-stream` route — and a **200 stream cut short** on Quarkus' generated JAX-RS controllers; both now await the first signal before committing and answer 403 (`MicronautSse`, `QuarkusSse`, generated templates). New cross-adapter contract `refusesARestrictedStreamedActionToAnAnonymousCaller`, green on all five |
| Code twins (RouteEntrySupplier/AppSupplier/MenuSupplier) | ✅ core suite (1752) + Python (786) + .NET (711, local SDK) |

## 3. Doc claims found wrong and fixed

- Python and C# manuals: "set the Compose app's `mateu.baseUrl`" — Compose was removed; now explain that
  the port serves the API only and how to run a renderer against it (de9d52296).
- New Project: "Code + YAML is not on Micronaut or Helidon: they do not resolve a view model bound only
  in routes.yaml" — the real causes were two adapter bugs, fixed; the flavour is offered there now.
  (CLAUDE.md still carries the old sentence — owner's file, not edited.)

## 4. ❌ open, owner decision or other area

Decided 2026-10-17 (batch 3, owner delegated — see `design/ga-plan/STATUS.md`): items 1, 2, 5, 6 and 9 implemented, 3 was fixed at integration; only 10 stays open (Redwood area).

1. 🔧 **Offline canvas** (editor, Client-side / remote-down fallback) rendered `Partial` / `ComponentRef` as
   placeholders and `${i18n.key}` as the key. DECIDED: the canvas resolves both from the mount's files; the
   inlined roots take the reference's `ve-<path>` id, so a partial is ONE selectable node (the reference is
   what is edited there) and click-to-select keeps working (`canvasReferences.ts`, `inlineReferences` `keepReferenceId`).
2. 🔧 **Python / .NET starters open nothing in a browser** (`:8080` was API-only). DECIDED: the ports serve
   the web renderer's page themselves — `add_mateu(ui=…)` / `MapMateu(ui:)` / `MATEU_UI` pointing at the
   `mateu-vaadin` (or `mateu-redwood`) jar or its `static/` folder, same rules as Java's index +
   SpaRedirectFilter (`test_ui_serving.py`, `UiServingTests`; verified in a browser on the Python starter).
   Left for the owner: packaging the renderer into PyPI/NuGet and publishing `mateu-vaadin` to npm.
3. ✅ **Redwood index**: unsubstituted Visual Builder tokens — fixed at integration (`copy.mjs` empties the
   catalogue/profile config; STATUS batch 1).
4. ~~**Live reload** of an unseeded definition-only page sends an empty componentState~~ — not a bug: such
   a page renders ClientSide with no action, so nothing could read the values, and they survive in the
   DOM (a page with seeds, actions or a proxied source is server-side and does carry its state).
5. 🔧 **Ports' YAML builder** (Python, .NET): the generic builder (pages #14) already covered every fluent
   component; DECIDED and done: `type: Listing` over a REST source and `actionable: RouteLink` buttons — the
   yaml starter's own pages now render on both ports (`YamlListingTests`, `test_yaml_listing.py`).
   `type: AppShell` definitions stay Java-only (the ports author shells in code).
6. 🔧 **VS Code schema performance**: DECIDED — a per-editor spelling of the one generated schema (see the
   editors' engines row).
7. ~~Canvas vs app: a `dataType: status` column shows `AVAILABLE` on the offline canvas~~ — re-checked: the canvas now paints "Available" / "Out of stock" like the served app (fixed by 24f26141b, pre-beta UX review).
8. ~~The routes editor has no `appState:` column~~ — added (App state column, DOM test).
9. 🔧 CLAUDE.md said Code + YAML is not offered on Micronaut/Helidon — corrected (batch 3).
10. **Redwood canvas** paints a listing's filter as a stray select under the table (see the editors' rows) — Redwood area.

## 5. Not walked yet ⏳

A real security module on Helidon MP (MP-JWT; its own routing serves YAML mounts and streamed actions
and, as its docs say, carries no JAX-RS principal there — a `PrincipalResolver` is the documented way); IntelliJ completion/validation inside a running IDE (covered by the
plugin's `JsonSchemaService` tests only) and VS Code inside VS Code (headless yaml-language-server
only); React Native for the YAML fixtures; compiling the docs' OTHER Java samples (annotation-driven pages; the code-twin samples were compiled, see section 2).

## 6. Permanent tests added

- Schema: `frontend/app/vscode-extension/src/specsSchema.test.ts` (ajv: shipped files, files against the
  schema they name, New File templates, docs examples); `MateuSchemaProviderTest` +2 (IntelliJ nested
  `type:` values and keys); core `DocumentedYamlExamplesTest` (doc trees parse with the loader's mapper).
- Served YAML: `e2e/tests/shared/yaml-authoring.spec.ts` + sample1 fixtures (8 tests × 5 Java adapters).
- Core: `DefinitionOnlyRouteSyncTest` (plain root), `SeededYamlPageRestSourcesTest` (proxied rows +
  options), `MountHomeSyncTest` (+ a page reading a proxied source is server-side),
  `YamlDeclaredActionsSyncTest` (+declared actions only), `StaticSafetyCheckTest` (flows/catalogue),
  `DefinitionInlinerTest`, `LayoutDeltaApplierTest` (+rows), `RootAppMenuContentCompiledResolversSyncTest`,
  `NothingToServeCheckTest` (+resolvers), `SpaFallbackTest` (+navigation only).
- Adapters: Quarkus `YamlMountRoutesTest` (+ a restricted YAML route: 403 on sync and sse, served to
  its role); Helidon `YamlMountRoutesTest` (+ 403 on sync and sse); parity contracts `doesNotAnswerADataFetchWithTheIndex`, `answersDeepLinksWithEncodedSegments`,
  YAML-mount data fetch, `refusesARestrictedStreamedActionToAnAnonymousCaller` (all five); Helidon `YamlMountRoutesTest` (root mount); Micronaut
  `MateuStaticFacadesStartupTest`, `MateuYamlMountControllerTest` (+data fetch).
- Ports: Python `test_route_files.py`, `test_definition_only_seeds.py`, `test_layout_delta.py` (rows);
  .NET `RouteFilesTests`, `DefinitionOnlySeedsTests`, `LayoutDeltaTests` (rows).
- Frontend: `bundleRoutes.test.ts` (state seeds), `mateu-field.test.ts` (placeholder, proxied options), editor
  `componentCatalogue.test.ts`, `playManifest.test.ts`, `exportBundle.test.ts`, DOM tests (State
  and App state columns, components.yaml); generator `cases.json` +2, `newProject.test.ts` (+ no starter narrows the Spring scan).

## 7. Counts

Markers in the tables above (a cell can carry several): ✅ 109 verified · 🔧 38 broken → fixed (+6 decided and
implemented 2026-10-17, batch 3) · ❌ 1 open (section 4, item 10 — Redwood area) · N/A 7 · ⏳ none left in the tables (section 5 lists what was not walked). Behind them:
23 `fix(...)` commits on this branch (44 commits in all), each with a test that fails without it.
