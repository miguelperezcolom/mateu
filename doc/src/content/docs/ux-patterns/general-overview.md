---
title: General overview
description: A record context switcher over the selected record's overview — the Redwood "General Overview" template as a Mateu archetype.
---

The `GeneralOverview<Row>` archetype renders a **context switcher** at the top (a select listing your records) and the **selected record's overview** below, re-rendered in place when the user picks another record — no navigation.

```java
@UI("/requisitions")
@Title("Requisitions")
public class RequisitionOverview extends GeneralOverview<Requisition> {

  @Override
  protected List<Option> switcherOptions(HttpRequest rq) {
    return repo.findAll().stream().map(r -> new Option(r.id(), r.title(), null, null, null, null, null)).toList();
  }

  @Override
  protected Requisition load(String id, HttpRequest rq) { return repo.findById(id); }

  @Override
  protected Component overview(Requisition r, HttpRequest rq) {
    return VerticalLayout.builder().content(List.of(
        EntityHeader.builder()          // the metadata strip: title + badges + facts + metric
            .title(r.title())
            .facts(List.of(Fact.builder().label("Business Unit").value(r.unit()).build()))
            .metricLabel("Amount").metricValue(...)
            .build(),
        ...property cards...)).build();
  }
}
```

The first record is selected by default. `emptyOverview()` customizes what shows when nothing is selected. Pair the header with `Card`s, `StatusList`s or property rows for the record body — or an embedded routed island when the detail needs its own actions.

## Redwood parameter and slot reference

What the Redwood `general-overview-page` template exposes, and what Mateu gives you for it. The
canonical page-header elements shared by every template — title, avatar, status badge, `@KPI`
facts, `@Timestamp`, peer navigation — are documented once in
[Page templates](/ux-patterns/page-templates/); this table covers what is specific to this one.

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| `selectContext` / `selectObject` `{data, itemText, secondaryText, avatar, icon}` | `switcherOptions(HttpRequest)` returning `Option`s | ✅ |
| `selectContextValue` / `selectContextItem` (controlled selection) | the public `record` field, set by the switcher | ✅ |
| `dataSwitcherType: context \| object` | — Mateu does not distinguish the two switcher semantics | — |
| `displayOptions.switcherSearch` (type-ahead inside the switcher) | — the switcher is a plain select | — |
| `displayOptions.promoteInfoSlot` | — see the `info` slot below | — |
| `displayOptions.contextualInfoLabel` / `contextualInfoSticky` | `@KPI` facts render, but neither toggle exists | 🟡 |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `previousItem` / `nextItem` + `spPreviousItem` / `spNextItem` | `PeerNavigationSupplier` → `PeerNav` | ✅ |
| **Slot** `main` | `overview(Row, HttpRequest)` | ✅ |
| **Slot** `info` (contextual side panel) | — the archetype renders a single region; a side panel needs `@Aside`/`ContentLayout` composed by hand | — |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| **Slot** `announcement` (aria-live) | live regions are installed client-side for a11y, but the backend cannot declare announcement content | 🟡 |
| Switcher change event | `switchRecord` — re-renders in place, no navigation | ✅ |

Mateu adds two things the Redwood template has no equivalent for: `emptyOverview()` (what shows
before anything is selected) and `load(String id, HttpRequest)` as an explicit data port, so the
switcher never carries the record payload.

## Demo

`demo-admin-panel/.../generaloverview/RequisitionOverview.java` (`/general-overview-demo`). Tests: `GeneralOverviewSyncTest`.
