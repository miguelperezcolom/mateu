---
title: Drag rows to a destination
description: Select listing rows, drag them onto a card, a column or a list of destinations, and an action runs with the origin and the destination — moving folio charges between windows, adding items to a cart.
---

**Status:** ✅ Implemented

![Folio charges grouped by window; the window cards on top are the drop zones](/images/docs/drag-to-a-destination/folio-windows.png)

## Intent

Some operations are about *moving* things: folio charges from one billing window to another,
reservations into a group, items into a cart. A form ("pick the charges, pick the window, press
Move") works, but the natural gesture is to drag the rows where they belong — as OPERA Cloud does
with folio windows and the Trip Composer.

## Solution

Two pieces, independent of each other:

- **`@DragRows("type")`** on a listing (a `Listing`, an `AutoCrud`) makes its rows draggable — the
  selected rows, or the one under the pointer.
- **`DropZone`** is a titled area wrapping any content that **accepts** a drag type. Dropping rows of
  that type on it runs its **`actionId`** with its **`parameters`** plus **`_draggedIds`** (the
  dragged rows' ids) and **`_dragType`**: the action knows both ends.

```java
@UI("/folio-windows")
@DragRows("charge")
public class FolioWindows implements Listing<ChargeRow>, HeaderSupplier {

    @Override public boolean selectionEnabled() { return true; }

    @Override
    public List<Component> header(HttpRequest rq) {
        return List.of(DropZone.builder()
                .accept("charge").actionId("moveCharges").parameters(Map.of("window", 2))
                .title("Window 2").subtitle("Guest (cash)")
                .content(List.of(new Text("w2", "13.20 € · 1 charge")))
                .build());
    }

    // moveCharges reads _draggedIds and window, moves the charges, and returns the page again
}
```

Returning the page from the action re-renders it — the zones' totals and the listing's rows, which
reload like on opening.

## Where it works

- **Vaadin** — `vaadin-grid` row dragging (`rowsDraggable`) and the shared `mateu-drop-zone`.
- **Redwood** — JET's own `oj-table` drag and drop (`dnd.drag.rows`); the zone is an atom whose
  content shows as text lines. The header components of a listing page (`HeaderSupplier`) are drawn
  above the table.
- **IntelliJ plugin** — `JTable` drag with a transfer handler, and a titled panel as the zone.
- **React Native** — no drag on touch: with rows selected and a matching zone on screen, a
  **Move to…** button opens a picker of the zones.
- .NET: `[DragRows("charge")]` + `DropZone`; Python: `@drag_rows("charge")` + `DropZone`.

The drag type travels as a MIME type (`application/x-mateu-<type>`), so a zone can tell while the
drag is still over it — before it may read the data — whether what comes is its kind.

Demo: `demo-vb-pms` → Financials → Windows.
