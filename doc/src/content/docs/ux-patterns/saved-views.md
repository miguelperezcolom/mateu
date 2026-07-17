---
title: Saved views
description: Name and reuse a whole set of listing conditions — keyword, filters, ranges — and open the listing with your default view.
---

**Status:** ✅ Implemented

## Intent

Power users return to the same slices of data every day: "my pending invoices", "arrivals this
week", "high-value bookings". Rebuilding the filter set every time is a tax; bookmarking URLs is
invisible and personal-toolbar-dependent. **Saved views** make the condition set a first-class,
named thing on the listing itself.

## Solution

Every crud/listing's smart search bar has a **bookmark button** on the right. It opens the views
panel:

- **Save current view as…** — snapshots the whole condition set (keyword chip, filter values,
  range bounds, multi-selects) under a name. Saving an existing name replaces it.
- **Click a view** — clears the current conditions, applies the view's and re-runs the search.
- **★** — marks the view as the listing's **default**: the listing opens with it applied whenever
  the URL carries no explicit filter params (an explicitly shared/bookmarked URL always wins).
  Starring again clears the default.
- **✕** — deletes the view.

No annotations or server code needed — it works on every listing that shows the smart search bar,
in every design system.

## Storage & scope

Views are stored client-side (localStorage, key `mateu-saved-views`), **per listing route** and
per browser origin — the same granularity as the URL filter sync. They are personal to the
browser profile; for team-shared slices, share the listing URL (filters sync to it) or model the
slice server-side.

## Related

- [Filters & Listing](/ux-patterns/filters-and-listing/) — the smart search bar being snapshotted
- [Bulk actions](/ux-patterns/bulk-actions/) — act on the rows the view surfaces
