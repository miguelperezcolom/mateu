# Walkthrough — actions, events, commands and overlays

Branch `walkthrough/actions` (2026-10-12). Walked from a real browser, by priority (owner's budget
cap): first a normal **Java + Vaadin** and **YAML + Vaadin** app served by a backend, then
**Redwood/VB**, then the rest. Cells not reached are marked ⏳ (not walked yet), not ✅.

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken, not fixed (why) ·
N/A (why) · ⏳ not walked yet.

Fixtures: `e2e/sut/modules/sample1/src/main/java/io/mateu/sample1/actions/*` (ActionsLab,
TriggersLab, AutoSaveLab, EventsLab + islands, OverlayLab + ContactEditor, FluentActionsLab,
ActionMenuApp) and `.../resources/specs/ui/{yaml-actions,walk-actions}.yaml`.
Specs: `e2e/tests/shared/{actions-lab,events-overlays-lab,yaml-actions}.spec.ts` (all five Java
adapters in CI) and `e2e/tests/renderer/{actions,yaml-actions}.spec.ts` (Vaadin and VB/Redwood).

Columns: **Vaadin** = Java on Vaadin, walked on MVC, WebFlux, Quarkus and Helidon MP (Micronaut:
CI only — it could not be built offline here); **YAML** = definition-only pages on Vaadin;
**VB** = the Redwood/VB renderer (mvc-app1 built with `-Dmateu.renderer=mateu-redwood`, plus
`demo-vb` for the probes); **.NET / Python** = the ports (unit level: `dotnet test`, `pytest`);
**RN / IJ** = React Native (expo web) / IntelliJ renderer; **Static** = `mateu:bundle`.

## Triggering an action

| Feature | Vaadin | YAML | VB | .NET | Python | RN | IJ | Static |
|---|---|---|---|---|---|---|---|---|
| `@Button` method → toast | ✅ actions-lab | ✅ buttons in yaml-actions | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A (server logic) |
| `@Toolbar` method returning `this` → new state on screen | ✅ actions-lab | N/A | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@Action(shortcut)` from the keyboard | ✅ actions-lab | ⏳ | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@Action(confirmationRequired)` with its texts; Keep it = not sent | ✅ actions-lab | ⏳ | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@Action(validationRequired)` | ✅ existing accessibility/validation specs (not re-walked) | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@Action(timeoutMillis)` → plain-language "too long" | ✅ actions-lab | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Fluent `Button` with an action id in a Card / a Tab; `MetricCard`, `EmptyState`, `Notice` action ids (tree-referenced id rule) | ✅ fluent-actions-lab | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Fluent `Button` with a lambda (layout, Card, drawer, dialog over a drawer) | ✅ fluent-counter + overlay-lab | N/A (code only) | ✅ drawer save in renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Menu leaf that runs an action (`@Menu Rule` RunAction) | 🔧 4e69d42b8 — dispatched to the on-screen component, lost | ⏳ | ✅ walked on the VB SUT | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

## What an action returns

| Feature | Vaadin | YAML | VB | .NET | Python | RN | IJ | Static |
|---|---|---|---|---|---|---|---|---|
| `URI` / `UICommand.navigateTo` → navigation | ✅ actions-lab | ✅ flow `Navigate` | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | ✅ flow (yaml-actions, no round trip) |
| Another object → the next view | ✅ actions-lab | N/A | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `Message.undoable` → Undo runs the undo action with its parameters | 🔧 bee171948 (Undo dispatched on the component HOST, past its listener) + 8b304a096 (label hard-coded "Deshacer" in Java/.NET/Python) | N/A | ✅ renderer/actions | 🔧 8b304a096 | 🔧 8b304a096 | ⏳ | ⏳ | N/A |
| `PageBanner` / `PageBanners.append` | 🔧 bee171948 (a list with `this` dropped banners + append flag; the re-render wiped banners of the same answer) | ⏳ | 🔧 10cc12091 (action banners never drawn) | ✅ `PageBanners.Replace/Append` (`PageBannersTests`) | ✅ `PageBanners.replace/append` | ⏳ | ⏳ | N/A |
| A `Collection` mixing the new state with a toast / an event | ✅ actions-lab (state+event), 🔧 state+toast/banners (bee171948) | N/A | ✅ | ✅ (`this` in a list re-renders + the rest merges — `PageBannersTests`) | ⏳ | ⏳ | ⏳ | N/A |
| Commands: `announce`/`announceAssertive`, `pushStateToHistory`, `runAction`, `markAsDirty`/`markAsClean`, `downloadFile` | ✅ actions-lab | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| `UserFacingException` as written; anything else "Something went wrong … Reference: id", internals never shown | ✅ actions-lab | ⏳ | ✅ renderer/actions | ✅ same texts (code compared) | ✅ same texts (code compared; its error toast has duration 0 = sticky, Java's 3000 — see ❌ list) | ⏳ | ⏳ | N/A |
| `LongTask` / SSE streaming | ✅ existing long-task spec (MVC, WebFlux, Quarkus, Helidon) | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `Dialog` / `Drawer` returned | ✅ overlay-lab | ⏳ | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `ConfirmDialog` returned → picked button's action runs | 🔧 bee171948 (replaced the page with a closed dialog = blank page; crashed with no content; ids not advertised) | ⏳ | 🔧 10cc12091 (an empty drawer with no buttons) | N/A (no ConfirmDialog in the ports) | N/A (same) | ⏳ | ⏳ | N/A |

## Triggers and the event bus

| Feature | Vaadin | YAML | VB | .NET | Python | RN | IJ | Static |
|---|---|---|---|---|---|---|---|---|
| Trigger naming a plain public method is advertised (OnLoad/OnValueChange/OnSuccess/OnError/OnCustomEvent/`@SubscribeTo`) | 🔧 bee171948 (none of them fired: the browser dropped the unadvertised id) | ⏳ | ✅ (the shell does not gate on the list) | 🔧 766ce88d8 | 🔧 766ce88d8 (+ subscriptions named the snake_case id, which the guard never runs) | ⏳ | ⏳ | N/A |
| OnLoad runs once although its action returns `this` (`times`) | 🔧 bee171948 (re-fired until the loop guard stopped it) | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| OnValueChange | 🔧 (advertisement) | ⏳ | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| OnSuccess — and not after a failure | 🔧 10cc12091 (a failed action ran its OnSuccess after its OnError) | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| OnError | 🔧 (advertisement) | ⏳ | 🔧 10cc12091 (not implemented at all) | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| OnCustomEvent | 🔧 (advertisement) | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@AutoSave` | ✅ autosave-lab | ⏳ | 🔧 37d1a612b (only display-block inputs honored it; a generic form never saved) | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@SubscribeTo` scopes DOCUMENT / COMPONENT (`from`) / SELF across islands | 🔧 bee171948 + a3213cdeb (an island's `State` answer was undone by its host's re-render — order-dependent, reproduced on WebFlux) | N/A | ❌ VB does not paint islands held by a form's component fields (renderer/actions marks it fixme) | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `closeModal(event, payload)` → host `@SubscribeTo` receives the result | 🔧 (advertisement) | ⏳ | ✅ renderer/actions | ⏳ | ⏳ | ⏳ | ⏳ | N/A |

## Overlays

| Feature | Vaadin | YAML | VB | .NET | Python | RN | IJ | Static |
|---|---|---|---|---|---|---|---|---|
| Drawer header: subtitle, size, maximize, peer navigation | ✅ overlay-lab | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Bottom collapsible drawer; modeless drawer | ✅ overlay-lab | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Dialog over a drawer closes alone; Esc closes only the top one | 🔧 a3213cdeb (with the focus outside the dialog, Esc closed the DRAWER under it) | ⏳ | ❌ closing the dialog leaves the drawer hidden (fixme in renderer/actions) | ⏳ | ⏳ | ⏳ | ⏳ | N/A |

## Actions as data (YAML) and the action catalogue

| Feature | Vaadin | VB | .NET | Python | Static |
|---|---|---|---|---|---|
| A definition-only route under a plain `@UI("")` root opens on a deep link | 🔧 ef7d9457e (the root PAGE answered it) | ✅ | ⏳ | ⏳ | ⏳ |
| `restAction` direct: fetched by the browser, merged, no server round trip | ✅ yaml-actions (MVC, Quarkus, Helidon) | ✅ | ⏳ | ⏳ | ⏳ (static-vcn specs cover it, not re-walked) |
| `restAction` proxy: only `__restfetch__` leaves the browser — no url, no `${secret.X}`; a failure is told | ✅ yaml-actions | ✅ | ⏳ | ⏳ | N/A (needs a server) |
| Flow of steps (MarkDirty + Navigate) runs client-side | ✅ yaml-actions | ✅ | ⏳ | ⏳ | ⏳ |
| Action catalogue id; owner first (page's own wins) | ✅ yaml-actions | ✅ | ⏳ | ⏳ | ⏳ |
| Visual editor authoring / Play of actions | ⏳ | ⏳ | — | — | — |

## Resilience and client safety

| Feature | Vaadin | VB | RN | IJ |
|---|---|---|---|---|
| Busy control, no double submit, offline banner, plain-language failure, Retry, read retried on 503, write sent once | ✅ `slow-network-probe.mjs` 10/10 on the SUT | ✅ `vb-slow-network-probe.mjs` 8/8 + `vb-a11y-probe.mjs` 10/10 on demo-vb | ⏳ | ⏳ |
| Session expiry: 401 → `mateu-session-expired` → retry completes the action | ✅ actions-lab | ⏳ (VB has its own re-auth path) | ⏳ | ⏳ |
| Expression sandbox (no `new Function`), RunJS off by default | ✅ existing strict-csp spec + unit tests (not re-walked) | ⏳ | ⏳ | ⏳ |

## Counts

Cells: ✅ 54 · 🔧 22 · ❌ 3 · N/A 38 · ⏳ 170 (React Native and IntelliJ were not reached; most
.NET/Python cells are ⏳ because the ports were walked at unit level only, on the bugs found above).

## Bugs fixed (one line each)

1. Triggers / subscriptions naming plain public methods were never advertised → never fired (Java bee171948, .NET/Python 766ce88d8).
2. An OnLoad action returning `this` looped until the request-loop guard (bee171948).
3. Undo of an undoable toast dispatched on the component host → lost (bee171948).
4. Undo label hard-coded "Deshacer" in all three backends (8b304a096).
5. A returned ConfirmDialog blanked the page, crashed without content, its ids were dropped (bee171948); on VB it was an empty drawer (10cc12091).
6. `List.of(this, PageBanners…)` dropped banners and the append flag; the re-render wiped same-answer banners (bee171948).
7. An island's own `State` answer was undone by its host's re-render (a3213cdeb).
8. Esc with the focus outside a dialog over a drawer closed the drawer instead (a3213cdeb).
9. A failed action ran its OnSuccess triggers too (Vaadin, 10cc12091).
10. VB: action-returned banners never drawn; OnError not implemented (10cc12091).
11. VB: `@AutoSave` ignored on generic forms (37d1a612b).
12. A definition-only route under a plain `@UI("")` root rendered the root page on a deep link (ef7d9457e).
13. A menu Rule leaf's RunAction never reached the app (4e69d42b8).
14. Python `@subscribe_to` put the snake_case name on the wire; the guard only runs camelCase ids (766ce88d8).

## ❌ — owner decision needed

- **VB: islands held by a form's component fields are not painted** (EventsLab): the shell paints a
  form page through its generic form and drops `CustomField`s holding a `ServerSide`. Needs the
  island machinery (`runMateuIslandAction`) generalised to arbitrary islands — a larger change.
- **VB: closing a dialog opened over a drawer leaves the drawer hidden** (the drawer is hidden
  while the modal is open and is not shown again after the modal's `CloseModal`).
- **Error toast duration differs**: Python's error-boundary message has `duration: 0` (sticky),
  Java's 3000 ms. Which one is the contract?

## Doc claims found wrong (and fixed in 8b304a096)

- `@Action` reference listed neither `shortcut` nor `timeoutMillis` nor `idempotent`.
- Trigger docs (`annotations/triggers.md`) and `component-communication.md` examples used
  package-private, unmarked methods — the server refuses them ("not an action"): made public, rule stated.
- Return-value table omitted commands, mixed collections and overlays (incl. a returned ConfirmDialog).
- "Action banners are cleared when the user navigates" — they are cleared by any re-render; stated precisely.
- `ConfirmDialog.openedCondition` documented as having no default (it defaults to `"true"`).
- `undo.md`: default label "Deshacer" — now the renderer's own word in the app's language.
- **Not fixed (CLAUDE.md, owner's file):** it says `@Action(runOnEnter=true)` exists — the Java
  annotation has no `runOnEnter` (only the frontend DTO does); `shortcut = "enter"` is the way.

## For other areas

- `ComponentElement` now defends keys a component's own `State` answer set against a parent
  re-bind (`_serverSaid`), like typed values; a parent handing a NEW component resets it.
- `ActionMapper` advertises ids a view's own triggers name (`triggeredActions`); ports likewise.
- `ActionInstanceCreator`: a definition-only routes.yaml entry is resolved before the class
  resolver's prefix match (an app on a prefix still answers first) — route-registry area.
- `e2e/tests/renderer/layout-sizing.spec.ts` skips its geometry checks only when the project is
  named `renderer-vb`; run under any other project name against VB it fails (not a product bug).
