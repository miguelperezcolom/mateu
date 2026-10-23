# Redwood «Guided Process» — review against the guide (2026-10-23)

Source: Oracle's usage guideline for the template (`oj-sp-guided-process`, VB pattern
`oj-sp-guided-process-pattern`, category *Transactional*, since 21D) and the real API
(`design/vb-page-template-apis.md` §2.7). User doc: `doc/src/content/docs/ux-patterns/wizard.md`
(section «The Redwood guided process»).

Working rule: on Redwood **Spectra/VB rule** — their template, component and contract first; an
imitation only when Mateu's content cannot meet their contract, and said.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Paths: `WZ` = `backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/wizard`,
`RW` = `frontend/web/monorepo/apps/redwood`, `PAGE` = `RW/webApps/vbredwoodapp/flows/main/pages/main-start-page.html`,
`CHAINS` = `RW/webApps/vbredwoodapp/flows/main/pages/main-start-page-chains`.

## 1. When it is used

A complex task split into 2–25 steps, done in one or several sessions, by one or several users,
sequentially or not, with branching. In Mateu: `Wizard` + `@WizardProgress(WizardProgressStyle.RAIL)`.
Only RAIL is the guided process on Redwood — STEPS paints an `oj-train` on top, BAR the generic
wizard (`RW/poc/core/archetypes.mjs:166-174`; a page is a wizard only when it advertises `next`,
`archetypes.mjs:184-190`). Page type `process`.

**The component is used**: `oj-sp-guided-process` (`PAGE:21173-21184`) with `process-title`,
`process-subtitle`, `resume-step-id`, `steps`, `current-step`, `primary-action`, and the events
`spPrimaryAction`, `spBeforeNext`, `spBeforeStepNavigate`, `spCancel`. The step's content goes into
its default slot.

## 2. The three page kinds

| Page | Guide | Mateu | Redwood | State |
|---|---|---|---|---|
| Overview (optional; interactive / non-interactive / disabled) | animated preview of the steps; Start / Resume | none on the server — the component's own overview | the template's overview (process title + subtitle over the step columns, done steps marked) | 🟡 not configurable: no way to choose interactive/non-interactive/off (`overviewAnimation` not bound) |
| Step page | process title, step title, body, table of contents, footer | the current step's form + Mateu's buttons | the component's step page; the step form in its slot | ✅ |
| Completion panel (optional) | title, actions (start new / back to parent), subtitle, illustration | the result step (last step field), titled by its `@Label` (`WZ/Wizard.java:300-303`) | a VIRTUAL last step `_completed`, current and done, footer hidden (`archetypes.mjs:205-219`) — not the `completionStep` slot | 🟡 imitation; no actions on it (Mateu's result step has no navigation buttons by design) |

## 3. Overview page elements

| # | Element | Req. | Mateu | Redwood | State |
|---|---|---|---|---|---|
| 1 | Process title | yes | `@Title` / `TitleSupplier` (the wizard's h2) | `process-title` (`archetypes.mjs:220-226`) | ✅ |
| 2 | Step title | yes | the step field's `@Label` (humanised name) | `steps[].label/title` | ✅ |
| 3 | Primary action Start / Resume | yes | — (template) | the template's own | ✅ |
| 4 | Process subtitle | no | `@Subtitle` / `SubtitleSupplier` (`WZ/Wizard.java:153-164`, `246-254`) | `process-subtitle` | ✅ |
| 5 | Step subtitle | no | `Step.description` exists on the wire record but the wizard never fills it (`WZ/Wizard.java:276-292`) and the projection does not map it | — | ❌ |
| 6 | Step status (completed / in progress / error / warning) | no | done / current / upcoming only (`WZ/Wizard.java:284`) | `success` or `none` (`archetypes.mjs:197-204`) | 🟡 no error/warning status |

## 4. Step page elements

| # | Element | Req. | Mateu | Redwood | State |
|---|---|---|---|---|---|
| 1 | Process title | yes | as above | ✅ | ✅ |
| 2 | Step title | yes | as above | ✅ | ✅ |
| 3 | Body (default slot) | yes | the step's fields, `@Section`s, grids, a step's own `@Toolbar` | the slot (`PAGE:21185-…`) | ✅ |
| 4 | Table of contents | yes | the applicable steps (`stepApplies`) | the template's rail | ✅ |
| 5 | Footer | yes | Back / Next / completion / drafts / Skip as Mateu buttons | template footer for Continue + primary + Cancel; Mateu's side buttons as a row in the body | 🟡 see §5 |
| 6 | Avatar | no | `@Avatar` / `AvatarSupplier` exist for pages | not bound | ❌ |
| 7 | Step subtitle | no | — | — | ❌ |

## 5. Table of contents and footer

| Element | Guide | Mateu | Redwood | State |
|---|---|---|---|---|
| Page number `n \| total` | yes | RAIL counter (`WZ/Wizard.java:219-243`) | the template's own; Mateu's counter is dropped from the content (`RW/poc/core/content.mjs:1958-1960`) | ✅ |
| Step titles, position indicator | yes | `ProgressSteps` | the template's rail | ✅ |
| Clicking an enabled step | navigates to it | `back` / done steps | only BACK to a done step (runs `back` N times, `CHAINS/wizardStepNavigate.js`); forward clicks are undone | 🟡 no non-sequential navigation forward |
| Checklist (≤ 5 per step) | no | — | — | ❌ |
| Step status on the rail | no | done only | `success` | 🟡 |
| Primary action (completes the process; label specific) | yes | `@WizardCompletionAction` + its `@Label` | `primary-action.label` = the forward button's label (`RW/poc/pageProjection.mjs:60-73`) | ✅ |
| Continue (fixed label) | yes | `next` | `spBeforeNext` → the forward action (`CHAINS/wizardNext.js`) | ✅ |
| Cancel (fixed label) | yes | — no wizard cancel hook | `spCancel` → navigates to the app's home route (`CHAINS/wizardCancel.js`) | 🟡 no server hook, no confirmation of unsaved input |
| Skip (optional steps only) | no | `stepSkippable(step)` + `WizardDisplay.skip` (`WZ/Wizard.java:115`, `WZ/WizardButtonBuilder.java:41-48`) | a Mateu button in a row inside the body (`content.mjs:1927-1938`), not `spSkip` | 🟡 imitation |
| Save (draft) | no | `Draftable.saveDraft` + `WizardDisplay.saveDraft` (`WizardButtonBuilder.java:51-58`) | same row, not `displayOptions.save`/`spSave` | 🟡 imitation |
| Save and close | no | `Draftable.closeDraft` + `WizardDisplay.saveAndClose` (`WizardButtonBuilder.java:61-67`) | same row, not the template's split button / `spSaveAndClose` | 🟡 imitation |
| Timestamp (last updated) | no | — (`@Timestamp` is a page-header element; the wizard has no header) | not bound | ❌ |
| Submit enabled mid-process | config | `@WizardCompletionAction(availableFromStep = …)` (`WizardButtonBuilder.java:72-90`) | NOT passed as `primaryAction.availableFromStep`; by code reading the early completion button is **dropped** when the row also carries draft/skip buttons (`content.mjs:1931-1938` keeps back + side actions only), and the whole row (Next included) **stays** in the body when it does not (`content.mjs:1961-1962` only drops rows of exactly next/back) → Next twice | ❌ suspected bug — verify in the browser |
| Back | — | `back` | rail click on a done step | ✅ |

## 6. Behaviour

| Topic | Guide | Mateu | State |
|---|---|---|---|
| Branching / conditional steps | business rules decide which steps show | `stepApplies(step)`, re-evaluated on every render | ✅ |
| Cancelable before-navigation | `spBeforeNext` / `spBeforeStepNavigate` | `beforeStepNavigate(from, to, rq)` (`WZ/Wizard.java:128`) | ✅ |
| Required fields block Continue; errors highlighted | unsaved-changes banner + field errors | client marks/focuses the empty required fields, the server re-checks | ✅ (an error toast, not a banner) |
| Resume where the user left | `resumeStepId`; overview shows only pending steps | `Draftable.resumeStep(rq)` → `resume-step-id` (`archetypes.mjs:228-229`) | ✅ (the overview shows all steps, done ones marked) |
| Browser back button returns to a step | yes | the step is server state, not the route | ❌ (not verified in the browser) |
| Optional drawers inside a step | modal drawers for sub-tasks | a step `@Toolbar` method returning a `Drawer` | ✅ (composition) |
| ≤ 25 steps | rule | not enforced | ➖ |

## 7. Responsive and page properties

| Topic | Guide | State |
|---|---|---|
| Overview: panels horizontal (large) / stacked (small) | the template's own | ✅ |
| Steps page: TOC expanded (large) / behind the page number (small); Save and close in the overflow | the template's own for the TOC; Mateu's side-button row just wraps | 🟡 |
| Page layout: **edge to edge only** | `pageType=process` → the renderer defaults to `fixed` (`RW/poc/pageProjection.mjs:288`) and the component sits inside the page's content box (`PAGE:142` container, `PAGE:21173`) | ❌ wrong width unless `@PageWidth(EDGE_TO_EDGE)` |
| Display mode: light (themeable: future) | — | ➖ |
| Density | `@Compact` | 🟡 not checked against the component |

## 8. Other findings

- `Draftable.closeDraft` Javadoc says null = «back in browser history»
  (`backend/shared/uidl/src/main/java/io/mateu/uidl/interfaces/Draftable.java:15,25`), but the
  dispatcher navigates to `/` (`WZ/WizardActionDispatcher.java:117-119`). The user doc (wizard.md)
  states `/`, which is what the code does — fix the Javadoc.
- No Redwood demo exercises drafts / skip / early completion (`demo-redwood-showcase /booking` and
  `demo-vb-pms /end-of-day` are plain RAIL wizards; `DraftWizard` lives in the Vaadin e2e SUT).

## 9. Gaps, prioritised

1. **Early completion on RAIL** (§5) — suspected duplicate Next / lost button; and pass
   `primaryAction.availableFromStep` to the template instead.
2. **Page width**: default a guided process to edge-to-edge (server `PageWidthSupplier` on `Wizard`
   when RAIL, or the renderer), as the guide allows only that.
3. **Footer affordances through the template**: bind `displayOptions.save/saveAndClose` and
   `spSave`/`spSaveAndClose`/`spSkip` to Mateu's `saveDraft`/`saveAndClose`/`skip` instead of a button
   row in the body.
4. **Cancel**: route it to a wizard hook (and the dirty guard) instead of jumping to the home route.
5. **Step subtitle and step status** (error/warning) through `Step.description` / status.
6. **Completion panel**: use the `completionStep` slot, with "start again" / "back" actions.
7. Checklist, timestamp, avatar, overview mode, browser-back per step.
8. A Redwood demo with `Draftable` + `stepSkippable` + `availableFromStep`.
