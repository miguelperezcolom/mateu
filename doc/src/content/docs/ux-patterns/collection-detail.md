---
title: Collection detail
description: A searchable list on the left, the selected item's detail on the right — the Redwood "Collection Detail" template as a Mateu archetype.
---

The `CollectionDetail<Row>` archetype renders a **searchable list of items on the left** (clickable cards with title, caption and badges) and the **selected item's detail on the right**, re-rendered in place on every selection — no navigation, no page reload.

```java
@UI("/hotel-directory")
@Title("Hotel directory")
public class HotelDirectory extends CollectionDetail<Hotel> {

  @Override
  protected List<Hotel> rows(String searchText, HttpRequest rq) { ... }

  @Override
  protected String idOf(Hotel h) { return h.id(); }

  @Override
  protected String titleOf(Hotel h) { return h.name(); }

  @Override
  protected Component detail(Hotel h, HttpRequest rq) {
    return Card.builder()...build();   // any component
  }
}
```

Optional hooks: `captionOf`/`badgesOf` enrich the list cards, `listLabel(count)` labels the list (default `"N items"`), `emptyDetail()` customizes the right pane before any selection, `listWidth()` sizes the list column (default `24rem`).

The search box filters as the user types (debounced 400 ms — the archetype declares the auto-save trigger itself, no annotation needed). The detail pane can be any component tree; when the detail needs its own actions or lifecycle, return an embedded routed island (the `DetailIsland` pattern) instead of a plain card.

## Redwood parameter and slot reference

What the Redwood `collection-detail-page` template (and its `collection-detail-stacker`) exposes,
and what Mateu gives you for it. The canonical page-header elements shared by every template are
documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** default (the list) | `rows(searchText, HttpRequest)` + `idOf`/`titleOf`, enriched by `captionOf`/`badgesOf` | ✅ |
| **Slot** `detailTemplate` (receives the item's `data`) | `detail(Row, HttpRequest)` — server-side, so it receives the row itself rather than a client-side template binding | ✅ |
| **Slot** `noSelection` | `emptyDetail()` | ✅ |
| **Slot** `search` | the list's own search box (debounced 400 ms, declared by the archetype) | ✅ |
| **Slot** `announcement` (aria-live) | live regions are installed client-side for a11y, but the backend cannot declare announcement content | 🟡 |
| `selectedItems` (**plural** — multi-selection) | selection is single: `selectCollectionItem` sets one row | — |
| `selectContext` switcher | — the record switcher is only available inside `GeneralOverview` | — |
| List column sizing | `listWidth()` (default `24rem`), `listLabel(count)` — Mateu additions | ✅ |
| `displayOptions.mobileMenu` | the renderer stacks list and detail on narrow viewports; not configurable | 🟡 |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `displayOptions.goToParent` + `spGoToParent` | breadcrumbs approximate it | 🟡 |
| `displayOptions.inFlowBack` + `spInFlowBack` | — | — |
| `spSecondaryAction` | — page-level secondary actions come from the toolbar, not from the template | 🟡 |

## Demo

`demo-admin-panel/.../collectiondetail/HotelDirectory.java` (`/collection-detail-demo`). Tests: `CollectionDetailSyncTest`.
