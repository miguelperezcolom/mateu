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

## Demo

`demo-admin-panel/.../generaloverview/RequisitionOverview.java` (`/general-overview-demo`). Tests: `GeneralOverviewSyncTest`.
