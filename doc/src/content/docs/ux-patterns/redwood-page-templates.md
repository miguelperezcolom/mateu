---
title: Redwood page templates
description: Oracle Redwood groups its page templates into three families — overview, detail and transactional. What each family is for, which templates it holds, and the Mateu piece that builds each one.
---

Oracle's Redwood design system organises its full-page templates into **three families**, by what
the user is doing: getting the big picture (*overview*), exploring one record (*detail*), or
changing something (*transactional*). This page follows that grouping, in Mateu terms: for every
template it names the archetype, annotation or component that builds it and links to its guide,
where you will find its anatomy, its responsive behaviour, what you can configure and screenshots of
Mateu painting it with the Redwood renderer.

The texts are our own summary of Redwood's guidance, and the screenshots are Mateu's — none of
Oracle's material is copied. Where Mateu does not yet match a template, the template's guide says
so under *Known gaps*.

See also [Page templates](/ux-patterns/page-templates/) (the full map, design-system neutral) and
[Choosing a page template](/ux-patterns/choosing-a-page-template/) (the decision guide).

## Overview pages

An **overview page** sums up a business flow so that the user sees, at a glance, what needs their
attention before they dive into any one record. Redwood has two of them, and Mateu has an archetype
for each:

| Template | What it is for | Mateu | Doc |
|---|---|---|---|
| **Dashboard landing page** | A prioritised "one-stop" status of the business: a strip of KPIs on top and a grid of panels that explain them | `Dashboard` (or a plain class with `MetricCard` fields under `@AutoPage`) | [Dashboard](/ux-patterns/dashboard/) |
| **Welcome page** | A visually engaging first page of a workflow: a banner with an image and the next actions, and a few tiles with what matters before starting | `Welcome` (and `@WelcomeBanner` on any page) | [Welcome page](/ux-patterns/welcome-page/) |

The pages that show **one** object — Foldout, General overview, Item overview — look like
overviews but Redwood files them under *Details*; see
[Choosing a page template](/ux-patterns/choosing-a-page-template/#detail-pages-one-entity).

### Dashboard landing page — two arrangements

- **Hero**: one visualization carries the story, so it takes the full width at the top, with
  secondary panels below it. In Mateu: declare that `@Panel` first and give it `colSpan` equal to
  `columns()`.
- **Above the fold**: two to five panels must be read together. In Mateu: keep the spans so the
  panels fill one or two rows of `columns()`.

Both start with the page header (title required; subtitle, primary action, context or object
switcher optional), then the **scoreboard** (consecutive `MetricCard` fields), an optional
**performance title**, and the **grid** of **panels** (`@Panel(title, subtitle)`).

| Aspect | Redwood | Mateu |
|---|---|---|
| Page width | fixed, full width or edge to edge | `@PageWidth`; fixed by default |
| Context | a standalone page | a routed `@UI` class |
| Panel content | charts, treemaps, sunbursts, thematic maps, lists, embedded analytics | `Chart`/`TrendChart`, `Map`, `Grid`, `StatusList`, `Markdown`…; no treemap/sunburst |
| Empty panel | an empty-state message | `EmptyState` |
| Required | title | `@Title` |
| Options | subtitle, switchers, primary action, back arrow (PWA), grid layouts | primary action (`@Toolbar`), grid layout (`columns()`, `colSpan`); subtitle and switchers are not available on the archetype yet |
| Drawers that pair with it | general drawer, create/edit drawer | an action returning a `Drawer` |

### Welcome page — what goes under the banner

The banner is always the same (title, optional greeting and description, image, actions or a search
box); what changes is the main slot underneath:

- a **read-only form** — a `@Panel` holding a read-only component tree;
- a **list** or an **expandable list** — a `@Panel` holding a `StatusList`, a `Grid` or collapsible
  content;
- **cards** — one `@Panel` per card.

| Aspect | Redwood | Mateu |
|---|---|---|
| Page width | fixed (default) or full width | `@PageWidth`; fixed by default |
| Context | a standalone page | a routed `@UI` class |
| Messages | banner and toast messages, empty state | toasts from actions (`Message`), `EmptyState` |
| Required | title | `heroTitle()` (no `@Title` fallback on the archetype yet) |
| Options | background illustration or uploaded image, image on/off on phones, a primary and a secondary action — or a search box | `heroImage()` (Redwood shows its own illustration instead), `heroTone()`, `Button` fields (Redwood paints two); no phone-image switch, no search |

Note: Redwood's own pages disagree on the number of banner actions — the category page says a
primary and one secondary, the template guide allows one call to action plus up to six in an
overflow menu. Mateu sends every `Button` field; the Redwood renderer currently paints the first two.

### Renderer status (Redwood)

| | Built with Spectra's component? | Biggest gap |
|---|---|---|
| Dashboard landing page | ❌ composed: Spectra page header + JET panels; no `oj-sp-dashboard-landing-page` / `oj-sp-scoreboard` / `oj-sp-dashboard-panel` | a KPI drill-in is a «View» button, not a clickable tile; `rowSpan` is ignored |
| Welcome page | 🟡 Spectra's banner (`oj-sp-header-welcome-banner`) + JET tiles; not `oj-sp-welcome-page` | only two actions, custom image ignored, no overline |

## Detail pages

### What the family is for

Detail pages explore **one entity** — a person, an order, a work order — and let the user move
sideways to its **peers** (previous / next record) without going back to the list. Redwood offers
four full pages and two drawers for it; the choice depends on how much there is to show and whether
the user must keep the page underneath in view.

| Redwood template | Pick it when… | Mateu piece | Redwood renderer |
|---|---|---|---|
| Foldout layout (horizontal) | an overview across the top plus 2–8 categories of related information, each in its own vertical panel the user unfolds | `Foldout` archetype (`@Panel` fields; `panelSummary` for the strip) | ✅ `oj-sp-foldout-layout` + `oj-sp-foldout-panel` |
| Foldout layout (vertical) | a small amount of varied content: the overview is the first vertical panel, the rest fold out beside it | `Foldout` (the overview field is the first panel) | ✅ same component; the horizontal/vertical overview variants are not distinguished |
| General overview | the simplest detail page: the attributes of one object, read-only, with related collections and an optional info column | `GeneralOverview<Row>` (record switcher, `overview`, `info` slot) | ✅ `oj-sp-general-overview-page` + `oj-sp-header-general-overview` |
| Item overview | the item itself fills the page: a key-info panel next to tabbed related information | `ItemOverview` archetype | 🟡 composed (key panel + `oj-tab-bar`); the `oj-sp-item-overview-page` attempt was reverted (see the Redwood DESIGN-NOTES) |
| General drawer | more about one or several objects of the current page, read-only, without leaving it | `Drawer` returned from an action (`subtitle`, `size`, `maximizable`, `peerNav`, `position`) | 🟡 `oj-drawer-popup` at the end edge with title + subtitle; size, maximize, peer arrows, position, close icon not drawn |
| Bottom drawer | the same, docked full width along the bottom; closable, or fixed with an expand/collapse handle | `Drawer` with `DrawerPosition.bottom` + `collapsible` | ❌ opens at the end edge like any drawer |

### Elements shared by the family

- **Required**: a title (and, for foldouts, at least two titled panels).
- **Header extras**: subtitle, avatar, badges, contextual information, timestamp, previous/next
  object, PWA back arrow, edit/share/favourite icon buttons (item overview). In Mateu these are the
  canonical page-header pieces (`@Subtitle`, `@Avatar`, `@BadgeInHeader`, `@KPI`, `@Timestamp`,
  `PeerNavigationSupplier`) — see [Page templates](/ux-patterns/page-templates/).
- **Messages**: banner, toast and empty-state messages — `@Banner`/`PageBanner`, `Message`,
  `EmptyState`.
- **Compatible drawers**: every detail page accepts the general drawer as a popup; the general
  overview also accepts the create-and-edit and bottom drawers. In Mateu any page can return any
  `Drawer` from an action — there is no compatibility check.
- **Page width**: foldouts are edge to edge (`Foldout` declares `EDGE_TO_EDGE`); general overview
  allows all three widths; item overview fixed or full width (`@PageWidth` / `PageWidthSupplier`).

### The two drawers in detail

- General drawer: sizes S/M/L (XL with maximize), start or end position, popup (modal or not) or
  layout (overlay or push); required title and close. Mateu models all of it on `Drawer`
  (`DrawerSize`, `DrawerPosition`, `modeless`, `layout`); Vaadin draws it all, Redwood does not yet
  (see [Drawer](/ux-patterns/drawer/)).
- Bottom drawer: default or maximized height, closable (close icon) or fixed (handle,
  expand/collapse), tabs or title. Mateu: `DrawerPosition.bottom` + `collapsible`; no "fixed" flag
  and maximize does not change the height.

### Known gaps

1. Redwood drawers: size, maximize, peer arrows, start/bottom position, modeless/layout and the close
   icon are sent to the renderer but not drawn yet.
2. Spectra's drawer templates (`oj-sp-general-drawer-template`, `oj-sp-bottom-drawer-template`) are not
   used yet: the drawers are a plain JET drawer.
3. Small screens: no drawer goes full window (guide rule) in any web renderer.
4. Item overview is composed, not `oj-sp-item-overview-page`.

## Transactional pages

A **transactional page** is where the user *changes* something: creates or updates a business
object, records a transaction, or moves a process forward. What sets these pages apart from overview
and landing pages is that they end in a commitment — *Save*, *Submit*, *Create*, *Finish* — and that
the object behind them can carry a lot of data, sometimes whole collections of records.

Redwood standardises six of them. In Mateu each one is an archetype or a composition you declare on
the backend; the page comes out with the template's anatomy.

| Template | Use it to… | Mateu piece | Redwood renderer |
|---|---|---|---|
| **Advanced create and edit** | create or edit one complex object with many grouped attributes, on one page | a sectioned form: `@Section` + the create-edit header (`@Toolbar` cancel + primary, `@KPI`, `@Timestamp`, `@BadgeInHeader`) + `@Toc` **or** `@Aside` — [Advanced create & edit](/ux-patterns/advanced-create-and-edit/) | ✅ composed from `oj-sp-header-create-edit` + `oj-sp-section`; the section index imitates the anchor navigator |
| **Data management** | work inside a large data collection as part of a transaction, with drawers for the details of a piece | `DataManagement` archetype (grid ⇄ Gantt, docked panels) — [Data management](/ux-patterns/data-management/) | see that page |
| **Gantt page** | adjust and follow a schedule, with a bottom panel and a side detail | `GanttPage` archetype — [Gantt](/ux-patterns/gantt/#gantt-page-template-ganttpage-archetype) | see that page |
| **Guided process** | split a complex, infrequent process (2–25 steps) into steps the user can leave and resume | `Wizard` + `@WizardProgress(RAIL)`, `Draftable`, `stepSkippable`, `stepApplies` — [Wizard](/ux-patterns/wizard/#the-redwood-guided-process) | ✅ `oj-sp-guided-process`; drafts/skip are Mateu buttons in the body |
| **Collection detail** | go through a list and read or act on the selected item beside it | `CollectionDetail<Row>` archetype — [Collection detail](/ux-patterns/collection-detail/) | 🟡 composed (cards + detail column), not the template component |
| **Create and edit drawer** | create or edit one or several related items without leaving the main task | `editInDrawer()` on a CRUD, or an action returning a `Drawer` — [Drawer](/ux-patterns/drawer/) | see that page |

### How to choose

Ask three questions, in this order:

1. **Is it one step or many?** A sequence of decisions, possibly over several sessions → **guided
   process**. (Two or three short steps → a guided process in a drawer.)
2. **Does the user stay on the main task?** If the edit is a side job on the page they are working on
   → **create and edit drawer**. If it deserves a page of its own →
3. **What is the page's main content?**
   - one object with many attributes → **advanced create and edit** (with `@Toc` for a long form,
     `@Aside` when supporting context helps);
   - a list the user works through, item by item → **collection detail**;
   - a large data set edited in place, with drawers for detail → **data management**;
   - a schedule → **Gantt page**.

### What they share

- **A transactional header**: the title, *Cancel* and one primary action are mandatory; optional are
  the subtitle, avatar, badge, up to four contextual facts, a timestamp, up to ten secondary actions,
  a parent link and next-object navigation. In Mateu the header comes from the page's `@Title`,
  `@Toolbar` methods and header annotations — see [Page templates](/ux-patterns/page-templates/).
  (Collection detail uses the overview header instead.)
- **The same supporting pieces**: banner and toast messages, dialogs, attachments and the
  unsaved-changes guard — in Mateu `@Banner`, `Message`, `Dialog`, file fields and
  `@ConfirmOnNavigationIfDirty` (automatic on CRUD editors).
- **Drawers that fit them**: a create-and-edit drawer and a general drawer can open from any of them;
  data management and the Gantt page also dock bottom drawers.
- **Fixed texts**: *Cancel*, *Save*, *Continue*, *Skip* are the design system's, not the developer's —
  on Redwood they come from Redwood itself, in the UI's language.
- **Page width per template**: advanced create and edit is fixed-width; data management full width or
  edge to edge; the Gantt page and the guided process edge to edge; collection detail any of the three.
  Mateu infers the width from the page type unless `@PageWidth` says otherwise — for the guided
  process declare `@PageWidth(EDGE_TO_EDGE)` (the default is still fixed; see
  [guided-process review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/guided-process.md)).
