---
title: Hero search
description: A distraction-free landing page focused on searching one collection.
---

**Status:** ✅ Implemented

## Intent

Give users whose task starts with a search — find a hotel, a product, a candidate — a focused landing page: a big hero header, a prominent search box with filter facets, and results as cards.

## Problem

Dropping users on a dense listing when their task is "search for X" buries the search box in toolbar chrome. Building a custom search landing by hand means rewiring search, facets, pagination and result rendering that Mateu's listing machinery already provides.

## Solution

Extend `HeroSearch<Filters, Row>` and implement `search(...)` exactly like a declarative `Listing`. The archetype renders a centered hero (title + subtitle, optional background image) followed by the standard searchable listing, with results as card tiles by default.

```java
@UI("/hotel-search")
@Title("Hotel search")
public class HotelSearch extends HeroSearch<HotelFilters, Hotel> {

    public record HotelFilters(String zone, Integer minStars) {}
    public record Hotel(String name, String zone, int stars, String price) {}

    @Override protected String heroTitle() { return "Find your hotel"; }
    @Override protected String heroSubtitle() { return "Search by name or zone…"; }

    @Override
    public ListingData<Hotel> search(String searchText, HotelFilters filters,
                                     Pageable pageable, HttpRequest httpRequest) {
        // query your use case / repository with searchText + filters + pageable
        return ListingData.<Hotel>builder().page(/* … */).build();
    }
}
```

![Hotel search](/images/docs/hero-search/hotel-search.png)

- The `Filters` record fields become the **facets** of the search box (the standard [smart search bar](/ux-patterns/filters-and-listing/#the-smart-search-bar): they live in its *Filter by* panel and show as removable chips when applied).
- Results render as **cards** by default — override `gridLayout()` to return `GridLayout.table` or any other layout.
- The listing starts **empty** (distraction-free) and searches on enter. Add `@Trigger(type = TriggerType.OnLoad, actionId = "search")` on the class to preload results.
- Override `heroImage()` to set a background image for the hero (a dark overlay keeps the text readable).

### Fluent variant

`HeroSection` is a regular component: compose it with a fluent `Listing` (or anything else) from `ComponentTreeSupplier`:

```java
HeroSection.builder()
        .title("Find your hotel").subtitle("…")
        .image("/images/hero.jpg").centered(true)
        .build()
```

## When to use it

Use hero search when **searching is the task** and the page is an entry point (public catalogs, pickers, knowledge bases). Prefer a plain `AutoCrud`/`Listing` when the user works the collection (bulk edits, exports, dense scanning).
