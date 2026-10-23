---
title: Collection detail
description: A searchable list on the left, the selected item's detail on the right — the Redwood "Collection Detail" template as a Mateu archetype.
---

The Redwood **Collection Detail** template shows a list of objects and, beside it, the details of the
one the user picked — so the user can go through a collection, read or act on one item, and move to
the next without ever leaving the page. In Mateu it is the `CollectionDetail<Row>` archetype: a
**searchable list of items on the left** (clickable cards with title, caption and badges) and the
**selected item's detail on the right**, re-rendered in place on every selection — no navigation, no
page reload.

![A collection detail page on Redwood: a list of hotels with one selected, its record card on the right](/images/docs/redwood-templates/collection-detail-1.png)

## When to use it

- The user works **through a set of items one at a time** — reviewing, triaging, comparing — and wants
  the list in view while reading each one.
- The detail is **rich enough to deserve a pane** (a record card, tabs, a chart), but not a page of
  its own the user has to go to and come back from.
- Typical variations: **read only** (the detail is a summary, tabs, an accordion, visualizations),
  **inline editing** (the detail is edited where it stands), and **create** (a new item is added
  through a create-and-edit drawer).

Pick something else when the list is the point and the detail is short — a
[listing](/ux-patterns/filters-and-listing/) with row navigation or an
[edit drawer](/ux-patterns/drawer/#crud-editing-in-a-drawer-editindrawer); when the user acts on each
item and moves on without reading a detail — a [to-do list](/ux-patterns/to-do-list/); when there is
one record with several facets — a [general overview](/ux-patterns/general-overview/).

## Anatomy

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | **Header** | page title and the page's actions | `@Title` / `@Subtitle`, `@Toolbar` methods on the class |
| 2 | **Search** | narrows the list as the user types | built in: the archetype's search box, passed to `rows(searchText, rq)` |
| 3 | **List** | one card per item: title, secondary text, badges; the selected one highlighted | `rows(...)`, `idOf`, `titleOf`, `captionOf`, `badgesOf`; `listLabel(count)` labels it |
| 4 | **Detail** | the selected item, any content | `detail(Row, HttpRequest)` |
| 5 | **No selection** | what the detail pane shows before a pick | `emptyDetail()` |

The list column's width comes from `listWidth()` (default `24rem`); the detail takes the rest.

![Before any selection: the list and the empty detail pane](/images/docs/redwood-templates/collection-detail-2.png)

## Responsive behaviour

- **Wide screens** — list and detail side by side; the list keeps its column, the detail fills the
  rest.
- **Narrow screens** — the two stack: the list on top, the detail of the picked item under it. (On
  phones Redwood's own template tucks the list behind a menu instead; Mateu stacks.)
- Picking an item and typing in the search box re-render the page in place, so the scroll position
  and the rest of the page stay put.

![At phone width the list stacks over the detail](/images/docs/redwood-templates/collection-detail-3.png)

## What you can configure

**Legend:** ✅ the Redwood renderer paints it · 🟡 partly / differently · ❌ not available.

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Title, subtitle | `@Title`, `@Subtitle` | ✅ | |
| Page actions (e.g. *Create*) | `@Toolbar` methods on the class | ✅ | in the page header, not over the list |
| Search | built in, debounced 400 ms | 🟡 | a plain text box, not Redwood's smart filter bar; no filter chips |
| Item title / secondary text / badges | `titleOf`, `captionOf`, `badgesOf` (`Chip`) | ✅ | painted as action cards |
| List label | `listLabel(count)` — default "1 item" / "N items", through your `Translator` | ✅ | |
| List width | `listWidth()` | 🟡 | Redwood rounds it to a column fraction |
| Detail | `detail(Row, rq)` — any component | ✅ | |
| Empty detail | `emptyDetail()` | ✅ | |
| Selection | single, kept in page state | 🟡 | not in the URL: a reload clears it |
| Multi-selection, list toolbar, avatar per item | — | ❌ | |
| Inline editing of the detail | return an editable embedded view from `detail()` | 🟡 | composition, not built in |
| Create through a drawer | a `@Toolbar` action returning a `Drawer` | 🟡 | composition; the button sits in the header |
| Page width | `@PageWidth` (default fixed) | ✅ | all three widths are allowed |
| Density | `@Compact` | ✅ | |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
@UI("/hotel-directory")
@Title("Hotel directory")
public class HotelDirectory extends CollectionDetail<HotelDirectory.Hotel> {

  public record Hotel(String id, String name, String city, int rooms, double occupancy) {}

  static final List<Hotel> HOTELS = List.of(
      new Hotel("h1", "Palace Palmeras", "Palma", 350, 0.93),
      new Hotel("h2", "Plaza España", "Madrid", 585, 0.97));

  @Override
  protected List<Hotel> rows(String searchText, HttpRequest rq) {   // filtered, in display order
    var needle = searchText == null ? "" : searchText.toLowerCase();
    return HOTELS.stream()
        .filter(h -> (h.name() + " " + h.city()).toLowerCase().contains(needle))
        .toList();
  }

  @Override
  protected String idOf(Hotel h) { return h.id(); }

  @Override
  protected String titleOf(Hotel h) { return h.name(); }

  @Override
  protected String captionOf(Hotel h) { return h.city() + " · " + h.rooms() + " rooms"; }

  @Override
  protected List<Chip> badgesOf(Hotel h) {
    return List.of(new Chip(Math.round(h.occupancy() * 100) + "%",
        h.occupancy() > 0.95 ? "success" : "contrast"));
  }

  @Override
  protected Component detail(Hotel h, HttpRequest rq) {
    return Card.builder()
        .title(new Text(h.name()))
        .content(new Text(h.city() + " — " + h.rooms() + " rooms"))
        .build();                                           // any component
  }
}
```

Optional hooks: `captionOf`/`badgesOf` enrich the list cards, `listLabel(count)` labels the list
(default `"1 item"` / `"N items"`, the built-in texts `item` and `items` through your `Translator`),
`emptyDetail()` customizes the right pane before any selection, `listWidth()` sizes the list column
(default `24rem`).

The search box filters as the user types (debounced 400 ms — the archetype declares the auto-save
trigger itself, no annotation needed). The detail pane can be any component tree; when the detail
needs its own actions or lifecycle (the *inline editing* variation), return an embedded routed view
— an island with its own server-side component — instead of a plain card.

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

On Redwood the page is **composed**, not the `oj-sp-collection-detail-page` component: the list items
are Redwood action cards, the detail is painted as the second column, and the search is a plain text
box. The look follows Redwood; the template's own mobile menu and list toolbar are not there.

## Demo

`demo/demo-redwood-showcase` (Redwood renderer, port 8597) and `demo-admin-panel` (Vaadin) —
`HotelDirectory`, route `/collection-detail-demo`. Tests: `CollectionDetailSyncTest`.

## Known gaps

On the Redwood renderer (details and code references in [collection-detail review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/collection-detail.md)
in the repository):

- the selection is page state, not part of the URL — a reload or a shared link loses it;
- composed from cards and a plain search box rather than the template, its list view and its smart
  filter bar;
- narrow screens stack the list over the detail instead of Redwood's mobile menu;
- no list toolbar, no multi-selection, no avatar per item;
- the *inline editing* and *create with a drawer* variations are composition, with no demo yet.
