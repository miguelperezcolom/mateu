# Redwood «Create and edit drawer» — review against the guide (2026-10-23)

Source: the Redwood guide page of `oj-sp-create-edit-drawer-template` (category *Layouts*, since 22A
— the page only carries "organize content and complete tasks related to the content"), the real
`oj-sp` API in `design/vb-page-template-apis.md` §2.8, and the general drawer guide (same header
grammar).

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

## 1. When it is used

Create or edit an object **without leaving the collection** it belongs to: the form slides over the
listing, which stays mounted. The transactional sibling of the general drawer. In Mateu:
`editInDrawer()` on any `Crud`/`AutoCrud` (`Crud.java:162`), built by `CrudDrawerBuilder`
(`CrudDrawerBuilder.java:45-77`).

## 2. Regions (anatomy)

| # | Region | Guide / API | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Header | title (+ placeholder in create), subtitle, close, prev/next | `headerTitle` set by the crud; no subtitle/peer nav from the crud | `oj-drawer-popup` panel, `h2` title (`main-start-page.html:19082-19093`) | 🟡 |
| 2 | Default slot (the form) | the create/edit form | the same form page the `/new` · `/{id}/edit` routes render, as its own `ServerSideComponent` (`CrudDrawerBuilder.java:88-115`) | fields in `oj-form-layout`, sections kept (`tree.mjs:459-461`) | ✅ |
| 3 | Error banner | `displayErrorMessageBanner` + `errorMessage` | `Notice` danger on top of the form when the save throws (`CrudDrawerBuilder.java:59-68`), switched by `CrudDisplay.errorBanner` | `Notice` atom (`coverage.mjs:69`); refresh in place tested (`test-patterns.mjs:262`) | ✅ |
| 4 | Footer actions | primary (Create/Save), Save and next, Cancel | the form's actions | parameterless buttons → anchored footer bar (`main-start-page.html:21140-21152`) | ✅ |
| — | The template itself | `oj-sp-create-edit-drawer-template` | — | not used: `oj-drawer-popup` + hand-made header/footer | 🟡 imitation, undeclared |

## 3. Responsive behaviour

No responsive section in the guide (it follows the general drawer: full window on small screens).
Width = `editDrawerWidth()` (default `36rem`, `Crud.java:167`) on both renderers, capped at
92vw (Vaadin) / 90vw (Redwood). No full-window switch on small screens — ❌.

## 4. Configuration

| Element | Guide / API | Mateu | Vaadin | Redwood | Status |
|---|---|---|---|---|---|
| Open the form in a drawer over the listing | — | `editInDrawer()` | ✅ | ✅ | ✅ |
| Drawer width | `drawerSize` | `editDrawerWidth()` (a CSS length, not a `DrawerSize`) | ✅ | ✅ | 🟡 no S/M/L/XL vocabulary here |
| Primary action type `auto \| create` | API | Create vs Save from whether the row exists | ✅ | ✅ | ✅ |
| `spPrimaryActionAndClose` | API | Save persists, closes (`closeModal(SAVED_IN_DRAWER_EVENT)`, `Crud.java:175`), listing re-searches | ✅ | ✅ | ✅ |
| `spPrimaryActionAndNext` (Save and next) | API | `CrudDisplay.saveAndNext` (default off) + `nextIdAfter(id, rq)` (`Crud.java:219`) + `saveAndNextLabel()` (`Crud.java:298`) | ✅ | ✅ (same-id refresh, `test-patterns.mjs:262`) | ✅ |
| Error banner | API | `CrudDisplay.errorBanner` (default on) | ✅ | ✅ | ✅ |
| Unsaved changes dialog (discard / cancel) | `unsavedChanges` + `spUnsavedChangesDiscard/Cancel` | — the drawer's form is built **without** `confirmOnNavigationIfDirty` (`CrudDrawerBuilder.java:101-114`); the routed edit/new views set it (`MultiView.java:227`) | ❌ ✕/Esc/backdrop close without asking | ❌ `mateuDrawerDismissed.js` discards | ❌ |
| Close icon | required (header grammar) | ✕ / Esc / backdrop | ✅ | 🟡 no icon (Esc / outside click) | 🟡 |
| Title placeholder in create mode | `pageTitlePlaceholder` (header grammar) | — the crud passes a fixed title | ❌ | ❌ | ❌ |
| Next / previous record arrows | `nextItem/previousItem` | — not set by the crud (a hand-built `Drawer` has `peerNav`) | ❌ | ❌ | ❌ |
| Create / Delete buttons on/off/disabled | collection display options | `CrudDisplay.create` / `delete` (`CrudDisplay.java:23`) | ✅ | ✅ | ✅ |

## 5. Findings

1. **Unsaved changes are lost silently** in drawer mode: ✕/Esc (and Cancel) never ask, on any web
   renderer. The routed pages ask (`MultiView.java:227`); the drawer's `ServerSideComponent` is built
   without the flag. The page doc claimed ✅ — corrected.
2. Redwood draws its own header/footer around `oj-drawer-popup` instead of
   `oj-sp-create-edit-drawer-template`, whose API (`primaryActionType`, `unsavedChanges`,
   `displayErrorMessageBanner`, `spPrimaryActionAndNext/Close`) matches what Mateu already models.
3. No close icon in the Redwood panel.
4. No title placeholder / record arrows on the crud's drawer.

## 6. Proposed plan

1. Set `confirmOnNavigationIfDirty(true)` on the drawer's form component and make both renderers ask
   before a dirty drawer closes (✕/Esc/backdrop/Cancel).
2. Redwood: `oj-sp-create-edit-drawer-template` inside the popup, bound to the crud's actions
   (`primary-action-type`, `display-error-message-banner`, `unsaved-changes`, the and-next/and-close
   events).
3. Crud drawer header: `@TitlePlaceholder` of the editor in create mode; optional `peerNav` across
   the listing rows (the same walk as `nextIdAfter`).

## 7. Status — Spectra adopted (2026-10-24)

The crud's drawer (`Drawer.id = crud-edit-drawer`) and any drawer with editable fields and an action
are painted with **`oj-sp-create-edit-drawer-template`** (`tree.mjs spectraDrawerOf`):
- primary = the form's `save`/`create` (else the call-to-action); the template's Cancel runs the
  form's `cancel-*` action (or just closes); a single extra action is its `secondaryAction`.
- **Save and next**: when the form offers `save-and-next`, `nextItem` is set, which turns the primary
  into Spectra's «Save and Next» split button (`spPrimaryActionAndNext` → `save-and-next`;
  «Save and Close» → `save`; just «Save and Close» on the last row). The header arrows walk the
  listing rows on screen (`withListingPeers`; the row's `view` is sent from the HOST — sent from the
  drawer its state's `id` wins on the server).
- **Error banner**: the crud's `crud-drawer-error` Notice becomes `display-error-message-banner` +
  `error-message` (and leaves the content).
- **Unsaved changes (finding 1, Redwood half)**: the app owns `unsavedChanges` in Spectra's contract.
  Cancel, the arrows, Esc and a click outside with a draft that differs from the opened values set
  `mateuDrawerLeaving`, which shows the template's banner (with navigation) or the same
  `oj-sp-message-banner-unsaved-changes` in the slot (without); Discard runs the held leave. Esc /
  outside close only through a synchronous capture guard (`drawers.mjs installDrawerGuard`): the
  popup's `ojBeforeClose` cannot be vetoed from a VB chain (it runs too late).
Vaadin's half of finding 1 is closed (2026-10-24): the drawer's form now carries
`confirmOnNavigationIfDirty` (CrudDrawerBuilder — Java; .NET capability forms; Python already did),
and libs/mateu's `dirtyGuard` asks before a dirty dialog/drawer closes by hand (scoped per overlay).
Redwood reads that same flag since 2026-10-24 (`shellFlows.mjs` `tracksUnsavedChanges` walks an
overlay's `metadata.content`/surface): a drawer edit marks the DRAWER's registry context `dirty`
(`withOverlayDirty`, its own scope — the page's `mateuDirty` is untouched, and the overlay's Cancel
asks about it alone, `confirmLeaveAction`), any navigation (Back/Forward, menu, link, NavigateTo)
asks once when the page or an open overlay is dirty (`confirmNavigationAway`; stay pushes the URL
back after a popstate) and then closes every overlay (`overlaysClosedVarsOf` +
`application:mateuOverlaysClosed` → `mateuOverlaysClosed.js`) — before, the drawer stayed
orphaned over the next page. The template's banner stays the authority for closing the drawer
itself (its Discard/leave clear the drawer's flag). An overlay refreshed in place (error banner,
Save and next) keeps its flag; Save and next's MarkAsClean still finds it. Still open: title placeholder, arrows
beyond the listing page on screen, `primaryActionType: create` (its «Create and new» has no Mateu
counterpart).
