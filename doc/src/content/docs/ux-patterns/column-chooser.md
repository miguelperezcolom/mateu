---
title: Column chooser
description: Each user shows, hides and reorders listing columns — persisted per listing, no code needed.
---

**Status:** ✅ Implemented

## Intent

The developer picks sensible default columns; the accountant wants the tax column, the operator
wants it gone and the phone first. **Column personalization is per user, per listing** — a staple
of SAP/Salesforce-class tables that shouldn't require code.

## Solution

Every crud/listing header has a **columns button** next to the smart search bar. Its panel lists
the columns with:

- a **checkbox** to show/hide,
- **↑/↓** to reorder,
- **Reset** to return to the developer's defaults.

Preferences persist client-side (localStorage `mateu-column-prefs`), **per listing route** and per
browser profile — the same scoping as [saved views](/ux-patterns/saved-views/). No annotations, no
server code; works on every design system.

Safety rails: identifier and action columns (the view/select/menu columns the listing needs to
function) are never offered for hiding and keep their absolute positions while reordering; totals
footers and group subtotal rows follow the visible columns automatically.

## Related

- [Saved views](/ux-patterns/saved-views/) — the same per-route personalization for conditions
- [Totals & row grouping](/ux-patterns/aggregates/) — footers that follow the chosen columns
