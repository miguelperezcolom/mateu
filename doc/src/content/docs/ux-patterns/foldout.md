---
title: Foldout
description: Show a record overview beside fold-out panels with categories of associated information.
---

**Status:** ✅ Implemented

## Intent

Show everything about one business object on a single screen: a fixed overview panel with the record's key information, plus two or more lateral panels — payments, history, notes… — that the user folds in and out as needed.

## Problem

Object pages with many categories of associated information usually hide them behind tabs, so the user can only see one category at a time and loses the record context while switching. Long vertical pages bury the categories below the fold instead.

## Solution

Extend `Foldout`. The first component field is the **overview** (always visible, left); each component field annotated with `@Panel` becomes a **fold-out panel**. Closed panels render as a narrow strip with the rotated title; clicking a strip folds the panel out, and several panels can be open side by side (the row scrolls horizontally when it overflows).

```java
@UI("/booking/:id")
@Title("Booking 2026-08117")
public class BookingFoldout extends Foldout {

    Markdown overview = new Markdown("""
        ### Booking 2026-08117
        **Guest:** Jane Smith
        **Dates:** 12–19 Aug 2026
        """, null, null);

    @Panel(title = "Payments", subtitle = "Charges and refunds")
    Markdown payments = new Markdown("...", null, null);

    @Panel(title = "Occupancy")
    Chart occupancy = Chart.builder().chartType(ChartType.line) /* … */ .build();

    @Panel(title = "Notes", open = false)   // starts folded
    Markdown notes = new Markdown("...", null, null);
}
```

![Booking foldout](/images/docs/foldout/booking-foldout.png)

`@Panel` attributes on foldout pages: `title` (defaults to the field label), `subtitle`, `icon`, and `open` (initial state, default `true`).

### Fluent variant

Build a `FoldoutLayout` directly from `ComponentTreeSupplier` when panels are data-dependent:

```java
@Override
public Component component(HttpRequest request) {
    return FoldoutLayout.builder()
            .overview(overviewCard())
            .panels(List.of(
                    FoldoutPanel.builder().title("Payments").content(paymentsGrid()).build(),
                    FoldoutPanel.builder().title("Notes").open(false).content(notes()).build()))
            .build();
}
```

## When to use it

Use a foldout for **record workspaces** where the user works one object at a time and hops between its associated categories — reservations, contracts, patient records. Prefer `@Tabs` when categories are mutually exclusive and context loss is acceptable, or `MasterDetailView` when the "categories" are really alternative detail parts of a master form.
