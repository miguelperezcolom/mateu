---
title: General overview
description: A record context switcher over the selected record's overview — the Redwood "General Overview" template as a Mateu archetype.
---

**Status:** ✅ Implemented · Redwood template: **General overview page** (`oj-sp-general-overview-page`; Redwood files it under *Details*)

The general overview is the plainest detail page there is: everything worth knowing about one
simple business object, read-only, on one screen. A header names the record and carries a strip of
key facts; below it, the record's attributes are grouped into titled sections of label/value pairs,
and an optional side column holds secondary context such as related contacts or recent activity.
A switcher in the header jumps to another record without leaving the page.

In Mateu this is the `GeneralOverview<Row>` archetype: you list the records, load one, and return
its overview; Mateu adds the switcher and re-renders in place when the user picks another record.

## When to use it

- To **view** a simple business object — a requisition, a supplier, an asset — whose information
  fits in a few sections and needs no tabs.
- When users **move between sibling records** often and should not go back to a list to do so.

When the object has many categories of related information, use the [Foldout](/ux-patterns/foldout/)
or the [Item overview](/ux-patterns/item-overview/); when the user must edit, use an editable view or
a CRUD.

## Anatomy

![The general overview painted by the Redwood renderer: header with record switcher and facts, sections, info column](/images/docs/redwood-templates/general-overview-1.png)

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | Header | Record title (doubling as the record switcher), subtitle, status badge, a strip of contextual facts | `switcherOptions()` + `load()`; an `EntityHeader` (title, subtitle, badges, facts, metric) returned by `overview()` |
| 2 | Main slot | The record's attributes in titled sections of label/value pairs | the rest of `overview()`: `Card`s, property rows, `StatusList`s… |
| 3 | Info slot | Secondary, read-only context beside the main content | `info(row, rq)` + `infoWidth()` |

:::caution[Redwood: include an `EntityHeader`]
The Redwood renderer recognises the page as a general overview by the `EntityHeader` in the overview
**and** the record switcher. Without an `EntityHeader` (or while `emptyOverview()` is showing), the
page is painted as an ordinary form: the switcher as a select field and the overview below it.
:::

## Responsive behaviour

On wide screens the main content and the info column sit side by side; on narrow ones they stack
(below 48rem on Vaadin, below the `md` breakpoint on Redwood) and the main content comes first.
`promoteInfoSlot` puts the info column on top when stacked. The header and its facts strip stay at
the top in every width.

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported · ➖ not applicable

| Element | Mateu piece | Redwood | Notes |
|---|---|---|---|
| Page width | `@PageWidth` | ✅ | |
| Record title | `EntityHeader.title` | ✅ | Spectra's general-overview header |
| Record switcher | `switcherOptions()`, `load()`; first record selected by default | ✅ | it **is** the title (Spectra's data switcher) |
| Switcher label | `recordLabel()` | 🟡 | Redwood always labels it "Record" |
| Switcher type-ahead search | — | ❌ | available for header switchers on other pages (`RecordSwitcherSupplier`) |
| Subtitle | `EntityHeader.subtitle` | ✅ | |
| Status badge | `EntityHeader.badges` | ✅ | the first is the template header's badge, the rest follow the subtitle |
| Contextual facts | `EntityHeader.facts`, `metricLabel`/`metricValue` | ✅ | the metric becomes one more fact |
| Primary / secondary actions | `@Toolbar` methods | ✅ | the template header's primary / secondary actions |
| Previous / next record | `PeerNavigationSupplier` | ❌ | travels on the wire, but the overview header does not draw the arrows |
| Main slot sections | `Card`s (titled) and any other component | ✅ | each piece is one card; a lone column puts two cards per row |
| Info slot | `info(row, rq)`, `infoWidth()` | ✅ | the template's own `info` slot (its neutral column); `infoWidth()` is not applied — Spectra sizes it |
| `promoteInfoSlot` | `display()` → `GeneralOverviewDisplay.promoteInfoSlot` | ✅ | the template's own display option |
| Hide the info panel | `display()` → `GeneralOverviewDisplay.info(Toggle.off)` | ✅ | |
| Nothing selected | `emptyOverview()` | 🟡 | shown, but Redwood paints the page as a plain form meanwhile |
| Density | `@Compact` | ✅ | a general overview is a reflected page, so `@Compact` is read |
| Display mode (header colour) | — | ❌ | |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

The `GeneralOverview<Row>` archetype renders a **context switcher** at the top (a select listing your records) and the **selected record's overview** below, re-rendered in place when the user picks another record — no navigation.

```java
@UI("/requisitions")
@Title("Requisitions")
public class RequisitionOverview extends GeneralOverview<Requisition> {

  @Autowired RequisitionRepository repo;

  @Override
  protected List<Option> switcherOptions(HttpRequest rq) {
    return repo.findAll().stream().map(r -> new Option(r.id(), r.title())).toList();
  }

  @Override
  protected Requisition load(String id, HttpRequest rq) { return repo.findById(id); }

  @Override
  protected Component overview(Requisition r, HttpRequest rq) {
    return VerticalLayout.builder().content(List.of(
        EntityHeader.builder()          // the metadata strip: title + badges + facts + metric
            .title(r.title())
            .badges(List.of(new Chip(r.status(), "success")))
            .facts(List.of(new Fact("Business Unit", r.unit())))
            .metricLabel("Amount").metricValue(r.amount())
            .build(),
        Card.builder().title(new Text("Details")).build()   // … the property cards
    )).build();
  }

  @Override
  protected Component info(Requisition r, HttpRequest rq) {
    return Card.builder().title(new Text("Recent activity")).content(activityOf(r)).build();
  }

  @Override
  protected String recordLabel() { return "Requisition"; }
}
```

The first record is selected by default. `emptyOverview()` customizes what shows when nothing is selected, and `recordLabel()` labels the switcher (unlabelled by default). Pair the header with `Card`s, `StatusList`s or property rows for the record body — or an embedded routed island when the detail needs its own actions.

![Switching record from the header on Redwood](/images/docs/redwood-templates/general-overview-2.png)

## The `info` slot

The Redwood general overview is `main` + `info`: the overview, and a contextual side panel with
secondary, read-only context — related contacts, recent activity, notes. Override `info(row, rq)`:

```java
@Override
protected Component info(Requisition r, HttpRequest rq) {
  return Card.builder().content(activityOf(r)).build();
}

@Override
protected GeneralOverviewDisplay display() {   // optional
  return GeneralOverviewDisplay.defaults().toBuilder().promoteInfoSlot(Toggle.on).build();
}
```

On wide pages the panel sits beside the overview (`infoWidth()`, default `20rem`); below 48rem the
two stack. **`promoteInfoSlot`** (the Redwood display option of the same name, default `off`) puts
the info panel ABOVE the overview when they stack. `display().info()` = `off` drops the panel.
Composed on the one responsive grid (a `ResponsiveGrid` template `"main info"`), so every renderer
draws it.

![The info slot beside the overview](/images/docs/general-overview/info-slot.png)

### A switcher in the header of any page

This archetype's switcher is a field in the page body. For a record or context switcher in the
**page header** — on any page, not just this one, with type-ahead search and the
`object`/`context` distinction — implement `RecordSwitcherSupplier`; see
[Page templates › record switcher](/ux-patterns/page-templates/#record-and-context-switcher).

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Switcher + overview | ✅ | ✅ | ✅ | ✅ | ✅ ¹ | ✅ | ✅ |
| `info` slot | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `promoteInfoSlot` | ✅ | ✅ | ✅ | ✅ | ✅ ² | ✅ | ✅ |

¹ When the overview contains an `EntityHeader`; painted with Spectra's `oj-sp-general-overview-page`.
² The template's own `displayOptions.promoteInfoSlot`.

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
| `dataSwitcherType: context \| object` | the header switcher (`RecordSwitcherSupplier`, `RecordSwitcher.type`); this archetype's body switcher has no type (Redwood paints it as an `object` switcher) | 🟡 |
| `displayOptions.switcherSearch` (type-ahead inside the switcher) | the header switcher's `RecordSwitcher.searchable`; not on this archetype | 🟡 |
| `displayOptions.promoteInfoSlot` | `GeneralOverviewDisplay.promoteInfoSlot` | ✅ |
| `displayOptions.contextualInfoLabel` / `contextualInfoSticky` | `@KPI` facts render, but neither toggle exists | 🟡 |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `previousItem` / `nextItem` + `spPreviousItem` / `spNextItem` | `PeerNavigationSupplier` → `PeerNav`; the Redwood overview header does not draw them | 🟡 |
| `primaryAction` / `secondaryActions` | the page's `@Toolbar` methods | ✅ |
| `badge` | the first `EntityHeader` badge | ✅ |
| **Slot** `main` | `overview(Row, HttpRequest)` | ✅ |
| **Slot** `info` (contextual side panel) | `info(Row, HttpRequest)`; `infoWidth()` is not applied on Redwood | ✅ |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| **Slot** `announcement` (aria-live) | `UICommand.announce(text)` from any action | ✅ |
| Switcher change event | `switchRecord` — re-renders in place, no navigation | ✅ |

Mateu adds two things the Redwood template has no equivalent for: `emptyOverview()` (what shows
before anything is selected) and `load(String id, HttpRequest)` as an explicit data port, so the
switcher never carries the record payload.

## Known gaps

The element-by-element review, with code references, is in
[general-overview review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/general-overview.md). In short:

- Redwood needs an `EntityHeader` in the overview to paint the template at all.
- Since 2026-10-24 Redwood paints the archetype with Spectra's `oj-sp-general-overview-page`
  (header with switcher, badge, facts and actions; `main` and `info` slots).
- No previous/next arrows on the overview header; `infoWidth()` is not applied (Spectra sizes the
  info column); the switcher label is fixed ("Record").

## Demo

`demo-admin-panel/.../generaloverview/RequisitionOverview.java` (`/general-overview-demo`, Vaadin); the same class in `demo-redwood-showcase` (Redwood, same route) and `demo-vb` `RequisitionsOverview` (`/requisitions`). Tests: `GeneralOverviewSyncTest`.
