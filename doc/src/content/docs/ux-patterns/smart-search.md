---
title: Smart search
description: A standalone, search-first page — the Oracle Redwood "Smart Search" page template.
---

**Status:** ✅ Implemented

## Intent

Give users a dedicated search page for a collection: an optional intro line under the page title, the smart search bar with typed filter facets and chips, and the results collection — without the hero chrome of a landing page and without the New/Edit chrome of an entity crud.

## Problem

A routed `Listing` preloads its rows and reads as "a grid page"; a crud adds create/edit affordances. When the task is "search across X" — assets, knowledge articles, any record finder — you want the search field to be the page's focus and the page to start empty, waiting for the user.

## Solution

Extend `SmartSearchPage<Filters, Row>` and implement `search(...)` exactly like a declarative `Listing`. The archetype composes the optional `pageSubtitle()` intro line over the standard smart-search listing. It is read-only and starts **empty** (the user searches).

```java
@UI("/smart-search-demo")
@Title("Smart Search")
public class AssetSearch extends SmartSearchPage<AssetFilters, AssetRow> {

    public enum Zone { Warehouse, Office, Fleet }

    public record AssetRow(String id, String name, Zone zone, LocalDate acquired, int units) {}

    public static class AssetFilters {
        String name;
        Set<Zone> zones;      // multi-select facet
        DateRange acquired;   // from–to date facet
    }

    @Override protected String pageSubtitle() {
        return "Find assets by name, zone or acquisition date";
    }

    @Override
    public ListingData<AssetRow> search(String searchText, AssetFilters filters,
                                        Pageable pageable, HttpRequest httpRequest) {
        // query your use case / repository with searchText + filters + pageable
        return ListingData.from(/* … */ rows);
    }
}
```

![Smart search](/images/docs/smart-search/smart-search-demo.png)

- The `Filters` fields become the **facets** of the [smart search bar](/ux-patterns/filters-and-listing/#the-smart-search-bar); typed fields get typed widgets — `DateRange`/`NumberRange` render from–to ranges, a `Set<SomeEnum>` renders a multi-select with the enum constants as options.
- The page starts **empty** (search-first) and searches on enter. Add `@Trigger(type = TriggerType.OnLoad, actionId = "search")` on the class to preload results.
- Results render with the default grid layout (`GridLayout.auto`); override `gridLayout()` to force `table`, `list` or `cards`.
- Works on every renderer and on the .NET (`SmartSearchPage<TFilters, TRow>`) and Python (`SmartSearchPage[F, R]`) backends — see the [parity matrix](/reference/parity/).

## When to use it

Use smart search when **searching is the task** but you want a workbench page, not a landing page: record finders, asset/article lookup, cross-team search tools. Prefer [hero search](./hero-search) for a distraction-free entry point (public catalogs, home pages), and a plain `AutoCrud`/`Listing` when the user works the collection (edits, exports, dense scanning).
