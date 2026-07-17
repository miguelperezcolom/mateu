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

## Demo

`demo-admin-panel/.../collectiondetail/HotelDirectory.java` (`/collection-detail-demo`). Tests: `CollectionDetailSyncTest`.
