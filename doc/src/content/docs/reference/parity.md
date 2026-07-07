---
title: Feature parity matrix
description: What each server (Java, .NET, Python) and each renderer supports today.
---

Mateu's contract is the wire: any server can serve any renderer. Coverage differs by
implementation — this page is the honest snapshot, and the single place to update when something
is ported. ✅ full · 🟡 partial (see note) · — not yet.

## Servers

The Java server is the reference implementation; the .NET and Python servers emit the same wire
for the surface below (verified by golden-JSON tests in `backend/dotnet/test` and
`backend/python/tests`).

| Feature | Java | .NET | Python |
|---|---|---|---|
| Forms, sections, field types, validation | ✅ | ✅ | ✅ |
| CRUD (list / detail / edit / new / save / delete) | ✅ | ✅ | ✅ |
| App shell + menus + navigation | ✅ | ✅ | ✅ |
| Wizards (incl. branching) | ✅ | ✅ | ✅ |
| Page decorations (subtitle, banners, badges, KPIs, FABs) | ✅ | ✅ | ✅ |
| Tabs, stereotypes, shortcuts, compact, dirty guard | ✅ | ✅ | ✅ |
| Adaptive layout inference (radios, folding, tabs) | ✅ | ✅ | ✅ |
| Nav links (`@LinkTo` / link supplier) | ✅ | ✅ | ✅ |
| Dashboard / Foldout / Welcome / ItemOverview archetypes | ✅ | ✅ | ✅ |
| UX components (MetricCard, Gantt, EmptyState, Skeleton…) | ✅ | ✅ | ✅ |
| i18n, events (emit/subscribe), security scaffolding | ✅ | ✅ | ✅ |
| Application context selector (`@AppContext`) | ✅ | ✅ | ✅ |
| Capture fields (`@Signature`, `@PhotoCapture`) | ✅ | ✅ | ✅ |
| Tree selects (`@TreeSelect` + hierarchical options) | ✅ | ✅ | ✅ |
| Smart-search listing filters (enums, ranges, multi-select, criteria) | ✅ | — | — |
| Tree lookup selectors (`GridLayout.tree` + `Selector`) | ✅ | — | — |
| Lookup fields (`@Searchable` selector dialogs) | ✅ | — | — |
| Editable grids / inline CRUD editing | ✅ | — | — |
| Component adapters, federation/microfrontends, SSE/AI chat | ✅ | — | — |
| Hero search archetype | ✅ | 🟡 | 🟡 |

🟡 Hero search: the HeroSection component is emitted, but the full archetype (facet bar wired to a
listing) is Java-only.

## Renderers

Every renderer speaks the same wire; the depth of widget support varies.

| Feature | Vaadin (web) | Redwood (web) | SAP UI5 / PatternFly (web) | JavaFX | Compose | React Native |
|---|---|---|---|---|---|---|
| Forms, CRUD, navigation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Smart-search filter bar (chips, ranges, multi-select) | ✅ | ✅ | ✅ (shared bar) | — | — | — |
| App context selector | ✅ | ✅ | ✅ (shared) | ✅ | ✅ | ✅ |
| — searchable picker w/ remote search | ✅ | ✅ | ✅ | 🟡 loaded options only | 🟡 loaded options only | 🟡 loaded options only |
| Signature capture | ✅ canvas | ✅ canvas | ✅ (shared) | ✅ canvas | ✅ canvas | ✅ svg + view-shot |
| Photo capture | ✅ getUserMedia | ✅ | ✅ (shared) | 🟡 file picker (no desktop camera API) | ✅ Android/iOS camera · 🟡 desktop file dialog | ✅ expo-camera |
| Tree select dropdown | ✅ | ✅ | ✅ (shared) | ✅ | ✅ | ✅ |
| Tree lookup selector (dialog) | ✅ | ✅ | ✅ (shared) | — | — | — |
| Dashboards, Gantt, foldouts, skeletons | ✅ | ✅ | ✅ | 🟡 subset | 🟡 subset | 🟡 subset |
| Dockable multi-tab workspace | — | — | — | ✅ | — | — |

"Shared" = SAP UI5 and PatternFly reuse the shared web components (Lumo-variable theming), so they
inherit those features automatically.

Update this page whenever parity moves — it is referenced from the language manuals and the
[Rosetta](/reference/language-rosetta/).
