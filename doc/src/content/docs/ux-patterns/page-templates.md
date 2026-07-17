---
title: Page templates
description: The full-page templates enterprise design systems standardize — and the Mateu archetype or pattern that builds each one from the backend.
---

Enterprise design systems (Oracle Redwood's RDS toolkit is the canonical example) don't stop at
components — they standardize **full-page templates**: the record overview, the collection with a
detail pane, the guided process, the create-and-edit drawer. Mateu covers these templates from the
backend: you extend an archetype or set a flag, and the page comes out with the template's anatomy
on every renderer.

This page is the map. Each row names the template (RDS naming), the Mateu piece that builds it,
and where to see it running.

| Template | Mateu piece | Demo route | Guide |
|---|---|---|---|
| **Smart Filter and Search** | Every CRUD/`Listing` — the smart search bar with typed filters, chips and saved views is the default listing UX | `/products` | [Filters & listing](./filters-and-listing) |
| **Create and Edit — Simple / Advanced** | `AutoCrud<T>` — routed `/new` and `/{id}/edit` forms with validation, optimistic locking and dirty guard | `/products` | [Inline CRUD editing](./inline-crud-editing) |
| **Create and Edit — Drawer** | `editInDrawer()` on the crud — the form slides over the listing, which never unmounts | `/drawer-crud-demo` | [Drawer](./drawer#crud-editing-in-a-drawer-editindrawer) |
| **Collection Detail** | `CollectionDetail<Row>` archetype — searchable card list + in-place detail pane | `/collection-detail-demo` | [Collection detail](./collection-detail) |
| **General Overview** | `GeneralOverview<Row>` archetype — record context switcher + `EntityHeader` metadata strip over property cards | `/general-overview-demo` | [General overview](./general-overview) |
| **Guided Process** | `Wizard` + `@WizardProgress(RAIL)` — step form with the sticky lateral rail (`current \| total` counter over the vertical step list) | `/branching-wizard` | [Wizard](./wizard) |
| **Item Overview** | `ItemOverview` archetype — sticky key-info panel + tabbed detail | `/product-overview` | [Item overview](./item-overview) |
| **Foldout Layout** | `Foldout` archetype — fixed overview + lateral fold-out panels | `/foldout-demo` | [Foldout](./foldout) |
| **Dashboard** | `Dashboard` archetype — KPI scoreboard band + responsive tile grid | `/dashboard-demo` | [Dashboard](./dashboard) |
| **Welcome Page** | `Welcome` archetype — hero with CTAs + highlight tiles | `/welcome-demo` | [Welcome page](./welcome-page) |
| **Empty States** | `EmptyState` component — used by every listing and archetype automatically | `/empty-skeleton-demo` | [Empty states & skeletons](./empty-states-and-skeletons) |
| **Data Management** (dense datagrid) | `@InlineEditing` + `@Compact` on a table crud — in-place cell editing at high density | `/inline-crud-demo` | [Inline CRUD editing](./inline-crud-editing), [High density](./high-density) |
| **Calendar** | `Calendar` component (month view with events) — a full calendar *page* template is not built in yet | — | [Calendar](./calendar) |

Three notes on how to read the table:

- **Templates are backend-side.** An archetype composes existing wire components, so it renders on
  every web renderer (Vaadin, SAP UI5, Redwood, PatternFly, SLDS) and on the native ones (React
  Native, IntelliJ) without renderer work. Styling follows each design system's tokens.
- **Backend parity.** Everything on this page also works on the .NET and Python backends — see
  the [parity matrix](/reference/parity/) for the per-feature detail.
- **Composition beats templates.** When no template fits, the same pieces compose freely:
  `HeroSection`, `EntityHeader`, `TaskQueue`, `Card`, property-list sections, zones and the
  fluent `FormField` are the vocabulary the archetypes themselves are written in.
