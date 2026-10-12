# Walkthrough — native renderers & the .NET / Python ports

Area: the cross-cutting axes — the React Native and IntelliJ renderers walked against a
representative screen of every area, and the .NET / Python ports served behind the web renderer,
plus the wire conformance corpus. Priority order (owner): ports behind Vaadin on their starters →
React Native → IntelliJ.

## How it was walked

- **Ports behind Vaadin.** The ports do not serve a renderer (see ❌ 1), so a small Node proxy (not
  committed) served the built Vaadin bundle (`backend/shared/frontend/vaadin-lit/.../static`,
  `_index.html`, `baseUrl=""`) and forwarded `/mateu/**` (with CORS) to: the **starters**
  (`starters/python`, `starters/dotnet`), the **demos** (`samples/demo`, `samples/Mateu.Demo`), a
  host serving the **ports' own test fixtures** (Python `add_mateu(app, *modules)`; .NET an
  ASP.NET app over the test assembly) and an **app-shell host** with every shell feature on one
  `@app` (card menu, app context, header action, notifications, global search, command center).
  Playwright scripts clicked, typed, saved, deleted, navigated, reloaded and went back/forward,
  reading the console. A generic **dead-button audit** walked each page: every element with
  `data-action-id` that no enclosing `mateu-component` advertises is a button the browser will
  never send — it found most of the bugs below.
- **React Native**: `frontend/app/react-native` on Expo web, direct mode
  (`EXPO_PUBLIC_MATEU_BACKEND_PORT`), against both starters and a Python app whose menu reaches
  one representative screen per area; the hub mode with `e2e/rn-hub-probe.mjs`; and against the
  **Java e2e SUT** (`mvc-app1`, the screens the shared Playwright specs use), replaying the specs'
  contracts on the native renderer (bulk-action confirmations, long task, crud navigation…).
  Caveat: the SUT jar at hand was built 2026-10-10 from the main checkout, so a few newer routes
  were missing and one server answer (`_route: /null` after a crud save) is stale — reproduced
  against current core with a scratch TestMateu test before being dismissed.
- **IntelliJ**: `./gradlew renderProbe -Pprobe.json=… -Pprobe.baseUrl=…` over wire captured from
  the Python port, plus the plugin's render tests.
- **Conformance**: Java `WireConformanceTest`, `test_wire_conformance.py`, `WireConformanceTests`.

## Matrix

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken / gap, not fixed (why) ·
N/A (why) · — not walked yet.

### Ports served behind the Vaadin renderer

| Feature | Python · Vaadin | .NET · Vaadin |
|---|---|---|
| Starter: shell, home CTA, menu tabs | ✅ starter-walk | ✅ starter-walk |
| Starter: CRUD search, row → detail, deep link + reload | ✅ | ✅ |
| Starter: unsaved-changes guard on create/edit (leave asks; Save/Cancel don't) | 🔧 no guard → c0adaa50b ✅ dirty2 | 🔧 → c0adaa50b (tests) |
| Starter: detail → Edit → Save | 🔧 Save/Edit dead → b44946598 ✅ | 🔧 dead → b44946598; 🔧 price never saved ("77" string) → cf0b6df08; 🔧 every Save refused on a decimal-comma server (`[Range(0, double.MaxValue)]`) → c091b8086 ✅ |
| Starter: New, required empty refused, filled created | 🔧 → b44946598 ✅ | 🔧 + no client validation → cf0b6df08 ✅ |
| Starter: select + Delete with confirm | ✅ (del.mjs) | ✅ |
| App without home at `/` | 🔧 loop guard banner → 265a4c2b3 ✅ | 🔧 → 265a4c2b3; 🔧 `[AppContext]` leaked as a field → 87eea4e6c ✅ |
| Shell behind a reverse proxy (homeBaseUrl, document links) | 🔧 absolute origin → 265a4c2b3 | 🔧 → 265a4c2b3 |
| Form + required validation + toast | ✅ | ✅ |
| Events button (`@emits`/`@subscribe_to`) | ✅ | ✅ |
| Wizard next/back keeps values, completion | 🔧 back dead → b44946598 ✅ | 🔧 next+back dead → b44946598 ✅ |
| Wizard draft / locked / rail / import wizard | ✅ (clickall + audit) | ✅ |
| Page FAB | 🔧 dead on every backend → b44946598 ✅ | 🔧 → b44946598 ✅ |
| Button keyboard shortcut | 🔧 not on the action → b44946598 (tests) | 🔧 → b44946598 (tests) |
| Dirty guard on leave | ✅ | ✅ |
| Capability listings (8 shapes) | 🔧 form toolbars dead + new/edit/cancel unanswered → b44946598; ✅ audit | 🔧 form toolbars dead → b44946598; ✅ audit |
| Drawer CRUD (`edit_in_drawer`) New → Save closes + lists | ✅ arch-walk | ✅ arch-walk |
| CalendarPage ‹ Today › Create | 🔧 dead → 6f8802270 ✅ | 🔧 → 6f8802270 ✅ |
| DataManagement grid ⇄ gantt | 🔧 dead → 6f8802270 ✅ | 🔧 → 6f8802270 ✅ |
| CollectionDetail list/detail + selection | 🔧 rendered as a sliver (renderer) → 6f8802270 ✅ | ✅ |
| CollectionDetail / GeneralOverview search & switch | 🔧 trigger action not advertised → cb4525280 (tests) | 🔧 → cb4525280 (tests) |
| TodoList, GanttPage bar → drawer | ✅ | ✅ |
| Dashboard, Foldout, Welcome (+CTA), project plan | ✅ | ✅ |
| Header extras (overline, placeholder, peer nav, timestamp), welcome banner | ✅ render | ✅ render |
| `@auto_page` / `[AutoPage]`, layout inference, labels aside | ✅ render | ✅ render (the AutoPage welcome fixture names actions it has no method for — fixture, not a bug) |
| Error boundary (user-facing / bug / ok) | ✅ (dev mode shows detail, as documented) | ✅ "An unexpected error occurred. Reference: …" |
| Exporters (CSV, Excel, PDF downloads) | ✅ 3 downloads | ✅ CSV |
| Section affordances, draft save | ✅ | ✅ |
| Card menu, app context picker, header action, notification bell, command-center palette + global search | ✅ shell-walk | ✅ shell-walk |
| Security principal (identity the host app established → `EyesOnly` / `ReadOnlyUnless` / `disabled_unless`) | ✅ sec.mjs: no role → salary hidden, notes read-only, Approve disabled; `hr` → salary shown; `hr,manager` → notes editable, Approve enabled | ✅ sec.mjs over an ASP.NET host setting `HttpContext.User` (none / hr / hr+manager / manager, same outcomes); a forced `approve` without the role answers 403 "Forbidden" |
| YAML pages served by the ports (the yaml starter's specs) | ❌ 8: only 8 YAML component types build — `home.yaml` (HeroSection) and `products.yaml` (Listing) show "Unsupported component"; `app.yaml` (AppShell) is documented as Java-only | ❌ 8: same 8 types in `YamlComponentBuilder` |
| Ports behind **Redwood** (bundle served by a scratch proxy reproducing `IndexPage.mountUi`) | 🔧 the port answered the documented `POST v3/components/_/action` 404 and `__load__` "Action not found" → 3c22ff69a: the Redwood shell now boots on a port (title, menu tabs). ❌ 9: the content area stayed empty; the scratch proxy is not faithful for routed URLs (it also sends route "" for a Java mount), so this needs a proper serving path (❌ 1) before it can be judged | 🔧 same → 3c22ff69a (test) |

### React Native (Expo web)

| Area / screen | Python port | .NET port | Java |
|---|---|---|---|
| Starter: home, CTA, tabs, search, detail, Edit → Save, New (validation + create) | ✅ `e2e/rn-starter-probe.mjs` 6/6 | ✅ 6/6 | — |
| Re-pressing the active tab after a pushed screen | 🔧 stuck → c091b8086 ✅ | ✅ | — |
| Boot error (fragment-less increment) | 🔧 blank white screen → ee68f8777 (unit) | — | — |
| Dashboard, Calendar (› month), Foldout, Wizard (next/back keeps value) | ✅ rn-interact | ✅ calendar (rn-net) | — |
| DataManagement grid ⇄ gantt, Featured page (tabs, KPI, Save) | — | ✅ rn-net | — |
| Page FAB above the bottom button bar | — | 🔧 the bar covered the FAB (a tap pressed Save) → see commit "a page FAB is drawn above" ✅ | — |
| CollectionDetail selection | ✅; 🔧 search → wrong type ("Action not found") → cb4525280 | — | — |
| EmptyState icon token printed as text | 🔧 → cb4525280 | — | — |
| Drawer CRUD New → sheet → Save → listed | ✅ | — | — |
| Editable listing (no navigable) row → editor sheet | ✅ | — | — |
| Page header overline / placeholder / timestamp / peer nav | 🔧 dropped → cb4525280 (unit) ✅ next link navigates | — | — |
| Capture: signature draw + Accept → data URI image | ✅ rn-more | — | — |
| Mobile hub: add by URL, confirm (domain + manifest), open, deep link, switch | ✅ rn-hub-probe 18/18 relevant steps against the Python port's `GET /mateu/v3/manifest` (the 19th step assumes the Java SUT's root form) | — | — |
| Shell: card menu entry navigates, notification bell lists, app-context picker sets the value, global search finds | ✅ rn-shell | ✅ rn-shell | — |
| Header actions, command center | N/A (documented: drawer shell without a top app bar) | N/A | N/A |
| A11y names: every control named, inputs named, tappables are buttons | ✅ `rn-a11y-probe.mjs` 7/7 (Products) | — | — |
| Photo capture (camera) | — (needs a device camera; the web fallback is a file picker) | — | — |
| Java SUT screens: all-types, validation, simple-listing, items, bulk-actions, overlays, status-demo, nullable-numbers, master-detail-list, profile, app (tabs), inline-host, live-element, confirm-dirty, full-crud/new | — | — | ✅ rn-java: render without unsupported/raw text; validation refuses, tabs switch, Greet/Submit/Save answer, drawer & dialog open and Confirm closes, island Edit → Save, master-detail + Add |
| `@Action(confirmationRequired)` (bulk-action-buttons spec: declared texts, generic "Are you sure?", deny runs nothing) | — | — | 🔧 ran WITHOUT asking → 31f172397 ✅ rn-bulk 4/4 |
| Crud Back to list / Cancel / delete on a listing | — | — | 🔧 stacked a second "list" screen (Back then returned to the record; a listing delete pushed a copy of itself) → 6bf2092a7 ✅ rn-items |
| LongTask progress dialog (long-task spec) | N/A (no LongTask in the ports) | N/A | 🔧 never streamed: `${state.title}`, "Iniciando..." forever, empty bar → 25c74104d ✅ Processing → Step 1..4 of 5 → finished, full bar |
| Legacy (Quill Delta) rich-text value | — | — | 🔧 printed as raw JSON → 4d18e007f ✅ |
| Validation-refused toast | 🔧 hard-coded Spanish ("Revisa los campos") → 31f172397 | | |
| Rich text editing | N/A by design: an editable `richText` is a plain multiline input of the HTML (no WYSIWYG on native) | | |

### IntelliJ (render probe + render tests)

| Screen (Python port wire) | Result |
|---|---|
| App shell, dashboard, calendar, wizard, capture, drawer CRUD, foldout | ✅ renders, no unsupported/exception |
| .NET shell: global search, notification bell (1), Hotel context combo (named, labelled), card-menu entries with descriptions | ✅ render probe (a11y names + labelFor) |
| .NET screens: DataManagement, GanttPage, Featured (tabs, KPI, FAB as header button, Save), TodoList (grouped, badges, caption), rail wizard, editable listing | ✅ render probe, no unsupported/exception |
| Page header overline / placeholder / timestamp / peer nav | 🔧 dropped → 97af34a04 (`PageSlotsRenderTest`) |
| EmptyState icon token | 🔧 printed as text → 2ae7068f2 (`DisplayComponentsRenderTest`) |
| CollectionDetail queue cards | 🔧 captions clipped → see commit "task-queue cards no longer clip" |
| App shell whose app has no home | ❌ 5: content area empty |
| `@Action(confirmationRequired)` | 🔧 ran without asking → fcc01398a (`ActionConfirmationTest`) |
| LongTask progress dialog | 🔧 never streamed, raw `${state.title}`, empty bar → 82f33d96b (`MateuApiClientStreamTest`, `OverlayStateTest`, `NativeUxReviewTest`) |
| Delete on a listing seeded with `""` | 🔧 opened a second "list" tab → d5bf61b3c (`MediatorRoutesTest`) |
| Validation-refused balloon | 🔧 hard-coded Spanish → fcc01398a |
| Interactions (clicks/typing) in a running IDE, mobile hub | — not walked (the render probe cannot click; covered by the unit tests above) / N/A (no hub on desktop) |

### Conformance corpus

| Item | State |
|---|---|
| Normaliser dropped ACTION ids with every generated id — the corpus could not see a missing action | 🔧 45e827575: ids inside `actions[]` compared in the three runners; 7 goldens regenerated, Java/.NET/Python all match |
| `fab` golden gains the advertised FAB action | 🔧 b44946598 |
| New case `peer-nav` | 🔧 d3abf2593 (3 servers match) |
| Cases that need a second request | 🔧 87799500e: `request.json` honoured by the three runners; `app-no-home-content` matches in all three. A `crud-new-form` trial showed the ports' create form diverging structurally from Java's (layout, actions) — the semantic gaps it surfaced (pageType, dirty guard) are fixed (c0adaa50b); the case itself is not added (❌ 7) |
| CollectionDetail / wizard cases | ❌ 7: known structural divergences |
| New cases `card-menu`, `app-extras` (command center / notifications / global search flags), `welcome-banner` | 🔧 03ce1c245 / b68499658 / 6437514d6 — the three servers match |

**Counts:** ✅ ≈ 85 cells verified · 🔧 37 fixes (each with a test or probe) + 3 doc claims ·
❌ open: 5 (items 1, 5, 7, 8, 9 below) · — not walked yet: photo capture on a device, IntelliJ
click-level interaction in a running IDE (its fixes are pinned by unit tests).

## Bugs fixed (one line each)

1. 265a4c2b3 Py/.NET — app without home reloaded its shell forever at `/`.
2. 265a4c2b3 Py/.NET — handler given an absolute origin (homeBaseUrl, documents) → broken behind a proxy.
3. b44946598 Py/.NET — CRUD/capability form toolbars not advertised (Save/Edit/Cancel dead).
4. b44946598 Py/.NET — new/edit/cancel-* answered "Action not found".
5. b44946598 Py/.NET — wizard back (and .NET next) not advertised.
6. b44946598 Py/.NET — `ActionDto.shortcut` missing → Ctrl+S dead.
7. b44946598 Java + Py/.NET + web — page FABs dead on every backend (not advertised; dispatched above the listener).
8. cf0b6df08 .NET — number field value ("77") never bound; edited price not saved.
9. cf0b6df08 Python — `bool("false")` is True.
10. cf0b6df08 .NET — entity forms carried no client validations.
11. 6f8802270 Py/.NET — archetype built-in actions (calendar, data management, collection, todo, gantt) not advertised.
12. 6f8802270 web — a stacking ResponsiveGrid collapsed to zero width in a start-aligned column.
13. 87eea4e6c .NET — `[AppContext]` property rendered as a form field.
14. c091b8086 .NET — `[Range]` bounds written with the server culture (decimal comma) + open bounds sent.
15. c091b8086 RN — re-pressing the active tab did not pop back to the tab's screen.
16. ee68f8777 RN — a fragment-less boot answer showed a blank screen.
17. cb4525280 Py/.NET — refresh-on-change trigger action (filterCollection/switchRecord) not advertised.
18. cb4525280 RN — header overline / placeholder / timestamp / peer nav dropped.
19. cb4525280 RN — EmptyState web icon token printed as text.
20. 97af34a04 IntelliJ — header overline / placeholder / timestamp / peer nav dropped.
21. 2ae7068f2 IntelliJ — EmptyState web icon token printed as text.
23. 8cf286ee1 IntelliJ — task-queue cards clipped their caption.
24. 3c22ff69a Py/.NET — the documented `POST v3/components/_/action` answered 404 and `__load__` "Action not found" (Redwood could not boot on a port).
25. c0adaa50b Py/.NET — CRUD create/edit forms answered pageType "collection" and did not guard unsaved changes (Java's do); server navigations now send MarkAsClean first and drawer close/cancel too (browser-verified: Save/Cancel never ask, leaving a dirty edit asks once).
26. 87799500e conformance — cases can pin a second request (`request.json`); first case `app-no-home-content`.
27. dcf8f08a5 .NET — the starter (and the solution) could not build on a .NET 8/9 SDK.
28. RN — a page FAB was covered by the page's bottom button bar.
22. 45e827575 conformance — action ids were not compared.
29. 4d18e007f RN — a legacy (Quill Delta) rich-text value showed as raw JSON (the documented "still opens" held only on the web).
30. 31f172397 RN — `@Action(confirmationRequired)` ignored: a confirmed bulk action ran without asking.
31. fcc01398a IntelliJ — same: confirmed actions ran without asking.
32. 31f172397 / fcc01398a RN + IntelliJ — the validation-refused message was hard-coded Spanish.
33. 6bf2092a7 RN — a crud's Back to list / Cancel stacked a second listing over the record; a delete on a listing seeded with "" pushed a copy of itself.
34. d5bf61b3c IntelliJ — a delete on a listing seeded with "" opened a second "list" tab.
35. 25c74104d RN — LongTask never streamed (sync endpoint): raw `${state.title}`, stuck first step, empty bar (also: overlay state updates by id, ProgressBar max 0).
36. 82f33d96b IntelliJ — same LongTask gap.
37. conformance — new cases `card-menu`, `app-extras`, `welcome-banner` (all three servers match).

## ❌ Open — owner decisions / not fixed

1. **The .NET and Python ports serve no web UI.** `uvicorn main:app` / `dotnet run` answer the sync
   API only; the starters' own docs say "sync API on :8080". A first-time user has nothing to open
   in a browser (Java starters serve the Vaadin page). The docs say "point any renderer at it —
   e.g. the Compose app", but the Compose renderer was removed (fixed: the docs now name the React
   Native app and say the server does not serve the web page).
   The documented CDN route (`<script src="https://cdn.jsdelivr.net/npm/mateu-vaadin/…">` +
   `<mateu-ui>`) loads **`mateu-vaadin@0.0.15` from 2026-04** — nothing publishes it to npm since,
   so it renders today's wire as "Unknown metadata type HeroSection / ResponsiveGrid". Question for
   the owner: should the ports serve the renderer page (e.g. `add_mateu(..., ui=True)` /
   `MapMateu(ui: true)` emitting the index with a pinned renderer), and/or should CI publish
   `mateu-vaadin` to npm per release? Same for Redwood: no way to put a port behind it.
2. (Doc claim, fixed — see "Doc claims fixed" below; the final wording depends on 1.)
3. (fixed — dcf8f08a5) **.NET starter on a .NET 8/9 SDK** failed with NETSDK1045: net10.0 is now
   built only on a .NET 10 SDK, and the NuGet job fails a release whose packages lack net10.0.
   Owner: confirm on the next release that the guard passes (MSBuild 18 = .NET 10 SDK).
4. (fixed) IntelliJ CollectionDetail cards clipped their caption line.
5. IntelliJ: an app whose shell has no home renders an empty content area (same as Java/Vaadin,
   where it is an empty page titled with the class name — the "home defaults to the first menu
   item" claim in CLAUDE.md holds only for RN, which opens the first tab).
6. (done — `request.json`, 87799500e.)
7. Known structural divergences not worth a case yet: the ports' CollectionDetail is a
   VerticalLayout + ResponsiveGrid, Java's a form with an island; the Java wizard advertises a `*`
   catch-all where the ports list `next/back/skip`; the CRUD create/edit form's layout and actions
   (Java's bubble to its mediator). Also: for a `""` consumed route Java answers component route
   `""`, the ports `"_empty"`.

8. **YAML pages in the ports** build only VerticalLayout, HorizontalLayout, FormLayout, FormField,
   Button, Text, Form and ComponentRef (Python `yaml_preview._build`, .NET `YamlComponentBuilder`) —
   the yaml starter's own pages render "Unsupported component: HeroSection / Listing". The port
   manuals did not state the subset — now documented in both manuals ("YAML pages: the components
   this server builds"). Owner: extend the builders (or map YAML through the fluent catalogue
   generically)?

9. **Ports behind Redwood, content area**: see the matrix row — blocked on 1.

Environment note: `frontend/app/react-native` `npm test` has one failing file locally
(`MateuViewController.test.ts`: `mock.module is not a function` — node 23 needs
`--experimental-test-module-mocks`); untouched by this branch.

## Permanent harnesses added

- `e2e/rn-starter-probe.mjs` — the starters' screens on React Native (any runtime).
- `e2e/dead-button-probe.mjs` — every `data-action-id` on the page must be advertised by an
  enclosing component; backend-agnostic. (Java SUT routes of `conformance-fixtures.json`: all pass.)

## For other areas

- Shell/menus: code-authored menus treat a child route as relative to its group, so a FULL path
  doubles (`/g` › `/g/x` → `/g/g/x`, pinned by the `app-in-code` golden), and a group nested in a
  group compounds it (`/b` › `/b/r` › `/b/r/search` → `/b/b/r/b/r/search` in Java; the ports put the
  nested group itself at `/b/b/r` where Java keeps `/b/r`). Consider normalising an absolute child
  route that already starts with its parent's path, in Java and the ports alike.

- The FAB fix touched Java `FieldActionCollector` (actions area). The e2e FAB tests in
  `features.spec.ts` call the action through the API and could not see a dead FAB — a click-level
  spec is worth adding there.
- The web renderer's dead-button audit (every `data-action-id` must be advertised by an enclosing
  component) is cheap and found ~10 bugs here; worth running on the Java demos too.
- `homeBaseUrl` / document links are now relative in the ports (like Java); native renderers
  already resolve relative document URLs.
- **Java core (actions/commands area)**: an action returning a MIXED collection (State + Message +
  UICommand — which is how every crud save/delete answers) gets
  `SetWindowTitle = "[State[state=…CapabilityCrud@4fc6011e…], Message[…], UICommand[…]]"`:
  `CommandMapper.isCommandResult` only exempts all-command collections, so `getTitle(list)` falls
  back to `toString()`. The web sets `document.title` to it and announces it to screen readers
  after every crud save/delete (RN already ignores titles starting with `[`). Reproduced on current
  core with a TestMateu crud save. Not fixed here (not my area).
- Crud flows on native: a Save from the create/edit form pushes the record screen ON TOP of the
  form, so Back returns to the (stale) form — the web's history does the same; a native "replace
  top" for form → record would be nicer. Not changed.
- The e2e shared specs are a good native checklist: replaying `bulk-action-buttons` and
  `long-task` on React Native found three real gaps in an hour.

## Doc claims found wrong and fixed

- `python-user-manual`, `csharp-user-manual`, `backend/python/README.md`, `backend/dotnet/README.md`:
  "Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl`" — the Compose
  renderer was removed (2026-07-10). Now names the React Native app (verified against both ports)
  and says plainly that the server answers the sync API only. `backend/dotnet/DESIGN.md` still
  mentions Compose in its historical milestone plan (left as history).
- `java-user-manual/build/navigation-and-menus.md` ("App shells and menus in code"): the example
  wrote full paths (`/back-office/reports/sales` inside `/back-office/reports`, under the
  `/back-office` mount); menu routes are relative to the mount and to their group (the conformance
  goldens pin it: `/g` › `/g/x` → `/g/g/x`), so the example's links led to doubled URLs. Now relative.
- CLAUDE.md "the home route defaults to the first menu item": true for React Native (first tab);
  Java/Vaadin, and now the ports, render the app class as an empty page (❌ 5).
