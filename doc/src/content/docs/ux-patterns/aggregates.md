---
title: Totals & row grouping
description: Aggregate listing columns over the whole filtered set — totals footer, and group subtotal rows with @GroupBy.
---

**Status:** ✅ Implemented

## Intent

Operational listings are also **reports**: the user filtering June's invoices wants the month's
total, not just the rows; a sales listing reads better grouped by region with a subtotal per
group. Without first-class support, developers export to Excel just to sum a column.

## Solution

Annotate the row class:

```java
public class Sale implements Identifiable {
    String id;
    @GroupBy String region;                          // group subtotal rows per region
    String product;
    @Aggregate(AggregateFunction.sum) double amount; // totals footer + per-group subtotal
    @Aggregate(AggregateFunction.count) String invoice;
}
```

- **`@Aggregate(sum|avg|min|max|count)`** on a column shows a **totals footer** under the listing
  with the value computed over the **whole filtered result set** — not just the visible page.
  `count` counts non-null values.
- **`@GroupBy`** on one column groups the rows: it becomes the implicit primary sort (your own
  sort still applies within each group), and a **group subtotal row** renders whenever the value
  changes — group value, row count, and each aggregated column's per-group value.
- Filtering and searching recompute everything over the filtered set only.

## Pushing the aggregation to the database

The default computation runs in memory over `findAll()` — the same cost class as the default
`CrudRepository.find`. A repository backed by a database overrides **one method** and runs a
single aggregate query instead:

```java
@Override
public ListingSummaries summaries(String searchText, Sale filters,
        List<FilterCriterion> criteria,
        Map<String, AggregateFunction> aggregates, String groupByField) {
    // SELECT region, count(*), sum(amount) … GROUP BY region  (+ one ungrouped row for totals)
    return new ListingSummaries(totals, groups);
}
```

Declarative `Listing<Filters, Row>` classes own their `search(...)`, so they attach the numbers
themselves: `ListingData.of(rows).withAggregates(totals).withGroups(groups)` — the `@Aggregate`
and `@GroupBy` marks on the row class drive the rendering either way.

## Wire

Column metadata carries `aggregate`; the crud metadata carries `groupBy`; each search result
carries `aggregates` (totals) and `groups` (`value`, `count`, per-group `aggregates`). Same
contract from the Java, .NET and Python servers, rendered by every design system.

## Related

- [Filters & Listing](/ux-patterns/filters-and-listing/) — the filters the totals respect
- [Saved views](/ux-patterns/saved-views/) — name the slice you keep totalling
