---
title: Choosing a page template
description: A decision guide — from your user's goal to the right Mateu archetype — modeled on the Oracle Redwood page-template taxonomy.
---

Mateu gives you a **library of full-page templates** (archetypes). This page is the decision guide
that picks the right one, the way an enterprise design system teaches you to: start from the
*user's goal*, narrow by *data density*, land on a *template*. The taxonomy follows the Oracle
Redwood page templates — the clearest public reference for this — expressed once in Mateu and
rendered by every design system.

For the catalog (template → Mateu piece → demo route) see [Page templates](./page-templates). This
page is the *how do I pick one*.

## Step 1 — Category, from the user's goal

Every page answers one of three goals. Ask what the user is fundamentally doing:

| Category | The user is… | Read | Create / Edit |
|---|---|---|---|
| **Overview** | getting a high-level, summarized picture to plan next steps | ✅ | ❌ |
| **Detail** | exploring one entity in depth, moving laterally across peers | ✅ | ❌ |
| **Transactional** | creating or updating one or more business objects | ❌ | ✅ |

If the user only **reads aggregated** information → Overview. If they **read one thing** in depth
→ Detail. If they **change** things → Transactional.

## Step 2 — Data density, from the content

Every template is sized with one of three widths — Mateu's `@PageWidth` / `PageWidthSupplier`
([page width](./page-templates)):

| Width | Use for | Mateu |
|---|---|---|
| **Fixed** | text-heavy pages that don't benefit from extra width (too-wide text is harder to read) | `@PageWidth(FIXED)` |
| **Full width** | high-density data — grids, tables, Gantt charts — that should fill the viewport | `@PageWidth(FULL_WIDTH)` |
| **Edge to edge** | canvases with multiple panels or drawers, no margins | `@PageWidth(EDGE_TO_EDGE)` |

When you don't set it, Mateu infers it from the content (full-bleed canvases → edge-to-edge, dense
datagrids → full width, everything else → fixed). Set it explicitly only when the inference is
wrong for your case.

## Step 3 — Template, from the shape of your data

### Overview pages

| You need… | Template | Mateu |
|---|---|---|
| A prioritized snapshot: KPIs + charts to start the day | **Dashboard Landing** | [`Dashboard`](./dashboard) |
| A visually engaging entry point into a workflow, with CTAs | **Welcome** | [`Welcome`](./welcome-page) + `@WelcomeBanner` |

### Detail pages (one entity)

| You need… | Template | Mateu |
|---|---|---|
| An overview across the top + several categories in lateral panels | **Foldout** | [`Foldout`](./foldout) |
| The simplest detail page: context strip over property cards, with a record switcher | **General Overview** | [`GeneralOverview<Row>`](./general-overview) |
| A sticky key-info panel + tabbed detail for one item | **Item Overview** | [`ItemOverview`](./item-overview) |
| Extra read-only info about an object *without leaving the page* (side panel) | **General Drawer** | `Drawer` (read-only) — *canonical archetype planned* |
| The same, docked at the bottom (expand/collapse) | **Bottom Drawer** | *planned* |

### Transactional pages (create / edit)

| You need… | Template | Mateu |
|---|---|---|
| Create/edit a record — validation, optimistic locking, dirty guard | **Create & Edit (simple)** | [`AutoCrud<T>`](./create-and-edit) |
| The same for a complex object: sections/tabs + a lateral section index | **Advanced Create & Edit** | `AutoCrud` + [`@Toc`](./sections-index) + `@Zones`/tabs |
| Create/edit in a panel that slides over the listing (which never unmounts) | **Create & Edit Drawer** | [`editInDrawer()`](./drawer#crud-editing-in-a-drawer-editindrawer) |
| A list with an in-place detail pane and actions on the selected item | **Collection Detail** | [`CollectionDetail<Row>`](./collection-detail) |
| A multi-step process, 2–25 steps, with a lateral progress rail | **Guided Process** | [`Wizard`](./wizard) + `@WizardProgress(RAIL)` |
| A short sub-flow or batch action inside a drawer (≤5 steps) | **Guided Process Drawer** | *planned* |
| A dense datagrid you edit in place, optionally switching to a Gantt | **Data Management** | [`@InlineEditing`](./inline-crud-editing) + `@Compact` (Gantt switch planned) |
| A scheduling canvas: Gantt + bottom drawer + side detail panel | **Gantt page** | [`Gantt`](./gantt) / [`PlanningBoard`](./planning-board) components (page template planned) |

Templates marked *planned* are on the [roadmap](#roadmap); the linked component or pattern is the
closest thing available today.

## Mateu also ships templates Redwood doesn't name

These fit the same categories and declare their `pageType` the same way:

- **Smart Search page** ([`SmartSearchPage`](./smart-search)) — search-first collection page.
- **To-do list** ([`TodoList`](./to-do-list)) — actionable buckets of pending work (collection).
- **Calendar** ([`CalendarPage`](./calendar)) — month grid with event actions (collection).
- **Hero Search** ([`HeroSearch`](./hero-search)) — a hero banner over a faceted search (landing).

## How the choice is encoded

- **Category** → the `pageType` on the wire (`landing`/`collection`/`detail`/`form`/`process`/
  `dashboard`). Archetypes declare theirs; set it explicitly with `@PageTemplate(PageType.X)`.
- **Density** → `@PageWidth(FIXED | FULL_WIDTH | EDGE_TO_EDGE)`, or leave it inferred.
- **Template** → extend the archetype (or set the flag) from Step 3. Everything below is
  composition of wire components that already render on every renderer.

You are never forced onto a template: a plain `@UI` class with declared fields still infers a valid
layout ([layout inference](./layout-inference)). The templates are opinionated rails on top, not a
requirement.

## Roadmap

Six Redwood templates are being brought to full parity — all in the Detail/Transactional
categories, centered on drawers and dense canvases: **General Drawer**, **Bottom Drawer**, **Guided
Process Drawer**, **Advanced Create & Edit** (canonical), **Data Management**, and the **Gantt page**
template. Until then, use the closest available piece noted above.
