# Walkthrough — native renderers & the .NET / Python ports (partial, first session)

Area: the cross-cutting axes — React Native + IntelliJ renderers walked against every area, and the
.NET / Python ports served behind the web renderers, plus the wire conformance corpus.

**Status: stopped early on the owner's budget cap.** This session covered the two ports behind the
Vaadin renderer (their demo apps + their own test fixtures served by a throw-away host). Everything
marked "not walked yet" resumes from this branch.

## How the ports were walked

The ports do not serve a renderer, so a ~40-line Node proxy (not committed) served the built Vaadin
bundle (`backend/shared/frontend/vaadin-lit/.../static`, `_index.html` with `baseUrl=""`) and
forwarded `/mateu/**` to the port: `uvicorn samples.demo.main:app`, `dotnet run` of
`samples/Mateu.Demo` (`MATEU_DEMO_URL`), and a host that registers the views of the Python test
modules (`add_mateu(app, *modules)`). Playwright scripts then clicked, typed, saved, navigated,
reloaded and went back/forward, reading the console. A generic **dead-button audit** walked each
page: every element with `data-action-id` whose id no enclosing `mateu-component` advertises is a
button the browser will never send — this found most of the bugs below.

## Matrix — ports served behind Vaadin (Python = Py, .NET = Net)

| Feature | Py · Vaadin | Net · Vaadin | Redwood | RN | IntelliJ |
|---|---|---|---|---|---|
| App shell, menu tabs, deep link + reload, back/forward | 🔧 root looped (`_no_home_route`) → fixed 265a4c2b3; ✅ deep link/reload/back/forward (demo-walk) | 🔧 same → fixed 265a4c2b3; ✅ | not walked yet | not walked yet | not walked yet |
| Shell behind a reverse proxy (homeBaseUrl, document links) | 🔧 absolute origin of the request → relative mount, 265a4c2b3 | 🔧 same, 265a4c2b3 | — | not walked yet | not walked yet |
| CRUD: listing, search | ✅ demo-walk | ✅ demo-walk | not walked yet | not walked yet | not walked yet |
| CRUD: view → Edit → Save, New → Save, Cancel, Back to list | 🔧 dead buttons + "Action not found" → b44946598; ✅ re-walked | 🔧 same → b44946598; ✅ re-walked | not walked yet | not walked yet | not walked yet |
| CRUD: select + Delete | ❌ not verified (walk script's locator, not confirmed either way) | ❌ same | not walked yet | not walked yet | not walked yet |
| Capability listings (plain/searchable/filterable/navigable/editable/creatable/deletable/bulk) | 🔧 form toolbar not advertised + new/edit/cancel unanswered → b44946598; ✅ audit clean | 🔧 form toolbar not advertised → b44946598 (handler already answered) | not walked yet | not walked yet | not walked yet |
| Drawer CRUD (`edit_in_drawer`) | ✅ audit clean (`drawer-contacts`) | not walked yet | not walked yet | not walked yet | not walked yet |
| Form + required validation + save toast | ✅ (person.mjs) | ✅ | not walked yet | not walked yet | not walked yet |
| Events (`@emits`/`@subscribe_to`) button | ✅ greet | ✅ greet | not walked yet | not walked yet | not walked yet |
| Wizard next/back, values kept, completion | 🔧 back not advertised → b44946598; ✅ | 🔧 next AND back not advertised → b44946598; ✅ | not walked yet | not walked yet | not walked yet |
| Wizard rail / guided-process drawer / import wizard | ✅ audit clean | not walked yet | not walked yet | not walked yet | not walked yet |
| Page FAB | 🔧 dead on EVERY backend (not advertised + dispatched above the listener) → b44946598; ✅ | 🔧 same; ✅ | not walked yet | not walked yet | not walked yet |
| Button keyboard shortcut (`@shortcut`) | 🔧 shortcut only on the button, client scans actions → b44946598 (`ActionDto.shortcut`) — test-verified, browser re-walk pending | 🔧 same | not walked yet | not walked yet | not walked yet |
| Dirty guard on leave | ✅ | ✅ | not walked yet | not walked yet | not walked yet |
| Archetypes: Dashboard, Foldout, Welcome (+CTA), Gantt page, CollectionDetail, GeneralOverview, TodoList | ✅ render, no unsupported, audit clean | ✅ Dashboard/Foldout/Welcome | not walked yet | not walked yet | not walked yet |
| CalendarPage toolbar (‹ Today › Create) | ❌ dead buttons: `previousCalendarMonth`, `goCalendarToday`, `nextCalendarMonth`, `createCalendarEvent` not advertised — found at stop, not fixed | not walked yet | — | — | — |
| DataManagement view switcher | ❌ dead buttons: `switchToGrid`, `switchToGantt` not advertised — found at stop, not fixed | not walked yet | — | — | — |
| Page header extras (overline, title placeholder, peer nav, timestamp), welcome banner | ✅ render (audit) | not walked yet | not walked yet | not walked yet | not walked yet |
| `@auto_page` (dashboard/welcome), layout inference, labels aside | ✅ render (audit) | not walked yet | not walked yet | not walked yet | not walked yet |
| Error boundary page, exporters page | ✅ render (audit); interaction not walked | not walked yet | — | — | — |
| Card menus, app context, header actions, notifications, global search, command center, security principal, YAML pages | not walked yet | not walked yet | not walked yet | not walked yet | not walked yet |
| Mobile hub (manifest, add UI by URL/QR, per-UI session), capture fields, a11y names | — | — | — | not walked yet | not walked yet |

Counts (this session): ✅ 24 · 🔧 11 (fixed, each with a test) · ❌ 3 · not walked yet: the rest.

## Bugs fixed

1. 265a4c2b3 — Py/.NET: an app with only menu items reloaded its shell forever at `/` (content slot
   got the shell again for `_no_home_route`); now a plain page, as Java. Tests:
   `test_app_shell_serving.py`, `AppShellServingTests.cs`.
2. 265a4c2b3 — Py/.NET: the handler got an absolute origin built from the request → shell and
   document links pointed past a reverse proxy; now the relative mount, as Java. Same tests +
   documents tests updated.
3. b44946598 — Py/.NET: CRUD + capability forms advertised no actions (Save/Edit/Cancel/Back dead);
   both ports now also answer new/edit/cancel-* by navigating. Tests `test_advertised_actions.py`,
   `AdvertisedActionsTests.cs`.
4. b44946598 — Py/.NET: wizard back (and .NET next) not advertised.
5. b44946598 — Py/.NET: `ActionDto.shortcut` missing → Ctrl+S did nothing.
6. b44946598 — Java + Py/.NET + web: page FABs dead everywhere (never advertised; renderer
   dispatched on the host above the listener). Tests `PageFabSyncTest`, `pageFabs.test.ts`, port
   tests; `fab` conformance golden updated.

## ❌ open / for the next session

- CalendarPage toolbar and DataManagement switcher buttons are not advertised in the Python port
  (check .NET and Java too) — same class of bug as #3.
- **Conformance normaliser blind spot:** `id` is volatile everywhere, so ACTION ids are dropped —
  the corpus cannot see a missing/renamed action (why #3–#6 were never caught). Proposal: keep `id`
  inside `actions[]` in the three normalisers and regenerate; then add cases for wizard, card menus,
  app-shell extras, peer nav, archetypes, and a request-spec mechanism (`request.json`) to pin
  second-step loads (content load of `_no_home_route`, CRUD `/new`, wizard next).
- Py/.NET: the content page for `_no_home_route` is titled with the class name ("Demo app"), not the
  `@app` title.
- Python CRUD edit form shows the `id` as editable (.NET marks it `[ReadOnly]` in its fixtures only).
- For other areas: FAB fix touched Java `FieldActionCollector` (actions area); API-level e2e FAB
  tests (`features.spec.ts`) could not catch a dead FAB — a click-level spec is worth adding.
- Not walked: Redwood behind the ports, React Native, IntelliJ, mobile hub, all app-shell extras.
