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

Extend `SmartSearchPage<Filters, Row>` and implement `search(SearchRequest, HttpRequest)` exactly like any [listing](/java-user-manual/build/capability-listings/) (the archetype already declares `Searchable` and `Filterable<Filters>` for you). It composes the optional `pageSubtitle()` intro line over the standard smart-search listing. It is read-only and starts **empty** (the user searches).

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
    public ListingData<AssetRow> search(SearchRequest request, HttpRequest httpRequest) {
        // query your use case / repository with
        // request.searchText() + filters(request) + request.pageable()
        return ListingData.from(/* … */ rows);
    }
}
```

![Smart search](/images/docs/smart-search/smart-search-demo.png)

- The `Filters` fields become the **facets** of the [smart search bar](/ux-patterns/filters-and-listing/#the-smart-search-bar); typed fields get typed widgets — `DateRange`/`NumberRange` render from–to ranges, a `Set<SomeEnum>` renders a multi-select with the enum constants as options.
- The page starts **empty** (search-first) and searches on enter. Add `@Trigger(type = TriggerType.OnLoad, actionId = "search")` on the class to preload results.
- Results render with the default grid layout (`GridLayout.auto`); override `gridLayout()` to force `table`, `list` or `cards`.
- Works on every renderer and on the .NET (`SmartSearchPage<TFilters, TRow>`) and Python (`SmartSearchPage[F, R]`) backends — see the [parity matrix](/reference/parity/).

## Redwood parameter and slot reference

What the Redwood `smart-search-page` template and its `smart-filter-search` pattern expose, and what
Mateu gives you for them. The canonical page-header elements shared by every template are documented
once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| `smartFilters.filtersMetadata` | the `Filters` class fields, typed: `DateRange`/`NumberRange` → from–to widgets, `Set<Enum>` → multi-select | ✅ |
| `smartFilters.appliedFilters` / `value` | applied conditions render as removable chips; state round-trips through the component state and the URL | ✅ |
| `smartFilters.resultsData` / `totalCount` | `search(SearchRequest, HttpRequest)` → `ListingData` (`Page` carries `totalElements`) | ✅ |
| `smartFilters.askHint` | `pageSubtitle()` sets an intro line; the bar itself has no hint prop | 🟡 |
| `smartFilters.autofocus` | `autoFocusOnSearchText` on the listing | ✅ |
| `smartFilters.expanded` | — the *Filter by* panel opens on click or typing, never on load (opening it on focus would pop it on page load) | — |
| `smartFilters.suggestions` / `suggestionFilters` / `autocompleteSource` | — no suggestion layer; `@Lookup`/`@RestOptions` cover per-field remote options | — |
| `showAllTotalCount` / `allTotalCountMessage` | — | — |
| `collectionScroller: off \| page` | pagination is the listing's own | 🟡 |
| `selectContext` | — the record switcher is only available inside `GeneralOverview` | — |
| **Slot** default (results) | the listing; `gridLayout()` picks `table`, `list` or `cards` | ✅ |
| **Slot** `main` + **`dashboard`** (pre-search content) | — the page starts empty; there is no way to declare what shows before the first search | — |
| **Slot** `search` | the smart search bar is the page's own | ✅ |
| **Slot** `announcement` (aria-live) | live regions are installed client-side for a11y, but the backend cannot declare announcement content | 🟡 |
| `smartFiltersChangedAction` | chip add/remove and facet toggles re-run `search` automatically | ✅ |

## When to use it

Use smart search when **searching is the task** but you want a workbench page, not a landing page: record finders, asset/article lookup, cross-team search tools. Prefer [hero search](/ux-patterns/hero-search/) for a distraction-free entry point (public catalogs, home pages), and a plain `AutoCrud`/`Listing` when the user works the collection (edits, exports, dense scanning).
