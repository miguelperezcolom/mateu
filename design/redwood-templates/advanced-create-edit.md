# Redwood «Advanced Create and Edit» — review against the guide (2026-10-23)

Moved here from `design/redwood-advanced-create-edit-review.md` (same content, translated to English
and updated to the state of branch `feat/redwood-section-actions`).

Source: Oracle's usage guideline for the template (`oj-sp-advanced-create-edit`, category
*Transactional*, since 21C) and the real API of the `oj-sp` pack 2604.1.0 (CDN loaders; see
`design/vb-page-template-apis.md` §2.13). User doc: `doc/src/content/docs/ux-patterns/advanced-create-and-edit.md`.

Working rule: on Redwood **Spectra/VB rule** — their template, their component and their contract
before an imitation of ours; we imitate only when their contract cannot be met with Mateu's content,
and we say so. The goal is Redwood **at template/UX level**, not loose pieces.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Paths: `RW` = `frontend/web/monorepo/apps/redwood`, `PAGE` = `RW/webApps/vbredwoodapp/flows/main/pages/main-start-page.html`.

## 1. When it is used

Creating or editing an object with **many attributes grouped** at one or more levels, on one page.
In Mateu that is the editor / creation page of a CRUD (`AutoCrud`, `Crud`) and any long sectioned
form that saves or cancels.

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | State |
|---|---|---|---|---|---|
| 1 | Page information and actions | required: title, Cancel, primary action | title, toolbar (cancel/save) | `oj-sp-header-create-edit` when the page toolbar has a **cancel** (`cancel`, `cancel-edit`, `cancel-new`, `cancel-create`) next to a primary (`RW/poc/pageProjection.mjs:226`, `PAGE:85-109`) | ✅ — needs both as `@Toolbar` methods: a `@Button` save stays in the body and the header falls back to general-overview |
| 2 | Main slot | transactional content | `@Section`s, `FormLayout` | `oj-sp-section` in BOTH paths: rich content (`PAGE:36126`) and the generic form (`PAGE:25036`) | ✅ (was 🟡: the generic form drew `.mateu-form-section` by hand — fixed on this branch) |
| 3 | Vertical anchor navigator | part of the main slot; links to section titles | `@Toc` (tri-state; auto when ≥ 5 titled sections and no `@Zones`, `RW/poc/toc.mjs:17,62`) | replica of Spectra's navigator markup + classes (`PAGE:153-200`); the component cannot host sections VB already painted | ✅ (imitation, declared) |
| 4 | Detail slot | contextual data; **exclusive** with the navigator | `@Aside` (→ `ContentLayout` aside) | painted as a content column; its sections keep their `oj-sp-section` header (merged-column atom, 2026-10-23) | ✅ on Redwood the index is never shown beside a detail slot (`toc.mjs` `hasAside`, 2026-10-23); Vaadin does not enforce it yet |
| — | The template itself | `oj-sp-advanced-create-edit` (slots `main`/`detail`) | — | **composed** (header + sections + index), not the component | 🟡 see §7 |

## 3. Responsive behaviour

| Breakpoint | Guide | State |
|---|---|---|
| LG–XL | navigator on the right, everything else on the left | ✅ (column `clamp(12rem, 25%, 20rem)`, pinned under the header) |
| SM–MD | content full width; the navigator becomes a **menu button** | ✅ («Sections» button + `oj-popup`, like the component, `PAGE:176-200`) |

## 4. Page properties

| Property | Guide | Mateu | State |
|---|---|---|---|
| Page layout | **Fixed width only** (Full width / Edge to edge: no) | `pageType=form` → `fixed` by default (`RW/poc/pageProjection.mjs:288`); `@PageWidth` can force another | 🟡 a `@PageWidth(FULL_WIDTH)` on an editor is neither corrected nor warned |
| Display mode | light (default) / mixed / themeable — colour of the **header**, the background always light | does not exist | ❌ (minor: the default is Redwood's) |

## 5. Header elements (region 1)

| # | Element | Req. | Mateu | Redwood | State |
|---|---|---|---|---|---|
| 1 | Page title | yes | `@Title`/`TitleSupplier`, `@TitlePlaceholder` | `page-title` + `page-title-placeholder` (`PAGE:86-87`) | ✅ |
| 2 | Page subtitle | no | `@Subtitle`/`SubtitleSupplier` | `page-subtitle` | ✅ |
| 3 | Avatar / initials / photo | no | `@Avatar` / `AvatarSupplier` → `PageDto.avatar` | **not projected** (`pageHeaderOf`, `RW/poc/pageProjection.mjs:163-240`, never reads it) | ❌ |
| 4 | Contextual info (≤ 4; visible on scroll when the header is sticky) | no | `@KPI`, `EntityHeader` facts | `contextual-info` + `contextual-info-sticky="true"` | ✅ (Spectra cuts to 4) |
| 5 | Parent link | no | parent breadcrumb (`parentCrumb`) | `display-options.go-to-parent="false"` fixed (`PAGE:100`) | 🟡 the link to the parent is lost when there is one |
| 6 | Next action (lateral) | no | `PeerNavigationSupplier` (prev/next) | not passed to the create-edit header (`display-options.next="off"`, `PAGE:103`; only general-overview gets `previous-item`/`next-item`) | ❌ |
| 7 | Save (saves and stays) | no | no "save without leaving" distinct from the primary in the CRUD | `display-options.save="off"` (`PAGE:101`) | ➖ (no model; see §8) |
| 8 | Cancel | **yes** | `cancel` / `cancel-edit` / `cancel-new` / `cancel-create` | the component's Cancel → the cancel action (`spCancel`) | ✅ (the text is Spectra's, in the UI language) |
| 9 | Primary action (default «Submit») | **yes** | the toolbar's primary (save/create…) | `primary-action` → `spPrimaryAction` | ✅ |
| 10 | Secondary actions (≤ 10; menu from 2) | no | rest of the toolbar | `secondary-actions` | ✅ |
| 11 | Badge | no | `@BadgeInHeader`/`HeaderBadgesSupplier` (the first) | `badge` | ✅ (the rest follow the subtitle) |
| 12 | Timestamp (required with Save) | no | `@Timestamp` | `timestamp` (dates only; a text timestamp ends the subtitle line) | ✅ |

## 6. Slots: allowed components

| Slot | Guide | Mateu | State |
|---|---|---|---|
| Main | Form Layout, Vertical Anchor Navigator, Messages Banner | fields in `FormLayout` ✅, index ✅, `@Banner` (shell message band) ✅ — **plus** tables (`List<Row>` inside sections) | 🟡 Redwood puts collections in the **detail slot**; we leave them in their section (a model decision, not the renderer's) |
| Detail | List View, Dynamic Table, Table, Attachments, Collections Container(s), Information Organizer | `@Aside` with any component | 🟡 content not validated (exclusive with the index on Redwood, §2) |

### Section affordances (`oj-sp-section`)

| Element | Mateu | Redwood | State |
|---|---|---|---|
| Section title | `@Section("…")` | `section-title` | ✅ |
| Primary action (edit or add) | `@Section(editAction)`, else `@Section(addAction)` | `primary-action {type: edit\|add}` → `spPrimaryAction` (`RW/poc/core/tree.mjs:556-590`) | ✅ |
| View more | `@Section(viewMoreAction)` | `display-options.view-more` → `spViewMoreAction` | ✅ |
| Both edit AND add on one section | both declared | the component has ONE primary: edit wins, add stays a plain title button (`tree.mjs:558-560`) | 🟡 imitation for the second action |
| Subsection level | nested `@Section` | always `level="section"` | 🟡 |

Finding of the first review (verified in the browser with `demo-vb /section-actions`): a **plain**
form (fields with `@Section` only) went through the **generic form** path, which painted its own
title + buttons — neither `oj-sp-section` nor its actions. **Closed on this branch**: both paths now
use `oj-sp-section` with the same affordances.

## 7. Template component vs composition

Today the editing page is **composed** with Spectra pieces (`oj-sp-header-create-edit`,
`oj-sp-section`) and a replica of the navigator. The `oj-sp-advanced-create-edit` template is a
container with slots (`main`, `detail`, `search`, `innerEnd`) and the same header API, so it **can
host VB-painted content** — unlike the navigator. Using it would bring its padding, its sticky
header, its responsive behaviour and its navigator/detail exclusion for free.

Cost: the page paints everything inside one content container; wrapping it in the template needs a
branch of its own for editing pages (rich content + generic form inside `slot="main"`, `@Aside` in
`slot="detail"`), with its generated atom surface (`make-html.mjs`).

## 8. Plan

1. ~~**Generic form → `oj-sp-section`** with its actions~~ — done on `feat/redwood-section-actions`.
2. **Editing page = `oj-sp-advanced-create-edit`** (§7): header through its props, content in
   `main`, `@Aside` in `detail`, index (replica) inside `main`; drop the index when there is a detail.
3. **Header**: avatar (`PageDto.avatar`), next (peer nav), parent link when there is a parent.
4. **Page layout**: force `fixed` on editing pages (or warn), and `display-mode` if it gets modelled.
5. **Demo**: no Redwood demo route shows the full template (create-edit header + `@Toc` + ≥ 5
   sections + `@KPI`/`@Timestamp`/`@BadgeInHeader`). Add one to `demo/demo-vb` (or the showcase) so the
   screenshots in the user doc can be generated.
6. Repeat this review per template — done for the transactional group in this folder
   (`collection-detail.md`, `guided-process.md`, `_category-transactional.md`).
