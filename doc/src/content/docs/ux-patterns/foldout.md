---
title: Foldout
description: Show a record overview beside fold-out panels with categories of associated information.
---

**Status:** ✅ Implemented · Redwood template: **Foldout layout** (`oj-sp-foldout-layout` + `oj-sp-foldout-panel`; Redwood files it under *Details*)

A foldout page shows one business object — or one running process — as a row of panels. The first
panel is the overview: who or what this is, and its key facts. Each further panel holds one category
of information that belongs to it (payments, history, contacts, notes…). The user reads across the
row, folds panels away to make room for others, and keeps the overview in sight the whole time.

In Mateu this is the `Foldout` archetype: the first component field is the overview, every `@Panel`
field is a fold-out panel.

## When to use it

- **Record workspaces** where the user works one object at a time and hops between two or more
  categories of associated information — reservations, contracts, patient records, an employee.
- When seeing **several categories side by side** matters more than seeing one in depth.

Prefer `@Tab` when categories are mutually exclusive and context loss is acceptable, the
[Item overview](/ux-patterns/item-overview/) when one tabbed area is enough, or `MasterDetailView`
when the "categories" are really alternative detail parts of a master form.

## Anatomy

![The foldout layout painted by the Redwood renderer: navigation header, overview panel and three fold-out panels](/images/docs/redwood-templates/foldout-layout-1.png)

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | Navigation header | Go back to the parent, move to the previous / next object of the same kind, optional search | `navigationHeader()` → `FoldoutNavigation` |
| 2 | Overview panel | The object's identity and key information (avatar, name, contact details…), with an optional Edit action | the first component field without `@Panel`; `headerTitle()` (defaults to `@Title`); a `List<Badge>` field; `overviewEditActionId()` |
| 3 | Fold-out panels | One category of associated information each; a folded panel shows only its title (and a short summary) | component fields with `@Panel(title, subtitle, icon, open)`; `panelSummary(field)` |
| 4 | Drill-down | A deeper level opened from a panel, inside the same layout | — not supported |

**Orientation.** By default (vertical) the overview is the first column at the left of the panels.
With `orientation()` = `FoldoutOrientation.horizontal` the overview becomes a band across the top
and the panels run below it.

## Responsive behaviour

The layout is a horizontal carousel: open panels sit side by side, the row scrolls sideways when
they do not fit, and page dots show where the user is. On narrow screens one panel fills the width
at a time. On Redwood all of this is Spectra's own `oj-sp-foldout-layout`; the Vaadin shell draws
the same carousel (`mateu-vaadin-foldout`), and the native renderers show the panels as an accordion.

A panel declared `open = false` starts folded as a narrow strip with its title; selecting it (click,
keyboard focus or its page dot) unfolds it.

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported · ➖ not applicable

| Element | Mateu piece | Redwood | Notes |
|---|---|---|---|
| Page width | edge to edge by default (`Foldout.pageWidth()`); `@PageWidth` overrides | ✅ | |
| Orientation (vertical / horizontal) | `orientation()` | ✅ | horizontal uses the layout's `overview` slot |
| Go to parent | `FoldoutNavigation.parentLabel` + `parentActionId` | ✅ | |
| Previous / next object | `FoldoutNavigation.previousActionId` / `nextActionId` | ✅ | both arrows show once `previousActionId` is set |
| Search in the header | — | ❌ | |
| Overview title | `headerTitle()` / `@Title` | ✅ | the overview panel's title |
| Overview badges | a `List<Badge>` field (`headerBadges()`) | 🟡 | painted as JET badges at the top of the overview, all neutral (the badge colour is not used) |
| Overview Edit action | `overviewEditActionId()` | ✅ | the panel's own pencil action |
| Panel title | `@Panel(title)` | ✅ | defaults to the field label |
| Panel subtitle | `@Panel(subtitle)` | 🟡 | joined to the title ("Payments · Charges and refunds") |
| Panel icon | `@Panel(icon)` | 🟡 | Spectra's panel has no icon; Mateu draws a decorative one beside the title |
| Panel width | `FoldoutPanel.width` (fluent) | ✅ | |
| Starts folded | `@Panel(open = false)` | ✅ | |
| Summary on the folded strip | `panelSummary(field)` / `FoldoutPanel.summary` | 🟡 | a line Mateu draws under the title, not the panel's `summary` slot |
| Panel actions | — (only the overview has Edit) | ❌ | put buttons inside the panel content |
| Recommendation area | — | ❌ | |
| "No data" state | `EmptyState` as the panel content | 🟡 | |
| Drill-down | — | ❌ | |
| Page header with actions | `@Toolbar` methods | ✅ | a foldout with toolbar actions keeps the regular page header above the layout |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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

    @Override
    public FoldoutNavigation navigationHeader() {
        return FoldoutNavigation.builder()
                .parentLabel("Bookings").parentActionId("backToBookings")
                .previousActionId("previousBooking").nextActionId("nextBooking")
                .build();
    }

    @Override
    public String overviewEditActionId() {
        return "editBooking";
    }

    @Action Object backToBookings() { return URI.create("/bookings"); }
    @Action Object previousBooking() { return URI.create("/booking/2026-08116"); }
    @Action Object nextBooking() { return URI.create("/booking/2026-08118"); }
    @Action Object editBooking() { return URI.create("/booking/2026-08117/edit"); }
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
                    FoldoutPanel.builder().title("Payments").width("40rem").content(paymentsGrid()).build(),
                    FoldoutPanel.builder().title("Notes").open(false).content(notes()).build()))
            .build();
}
```

`FoldoutPanel.width` is an optional CSS length for the **expanded** panel — unset panels keep the renderer's default section width (`--mateu-foldout-panel-flex` / `--mateu-foldout-section-width`, 22rem). Use it to size panels to their content: a wide checklist or grid next to a narrow property list.

Two Vaadin-carousel behaviours worth knowing:

- The **scroll affordances** (the round left/right buttons at the bottom corners) only appear when
  the sections genuinely overflow the viewport — a few residual pixels (a scrollbar's width,
  rounding) don't summon them, and the carousel re-measures as slotted content settles or the
  window resizes.
- The **last fold never renders narrower than the overview column**: a skinny accessory panel
  (say a 14rem profile strip) widens to match the first fold, so the page reads as balanced
  columns instead of trailing off into a sliver.

## What a folded panel shows (`summary`)

A folded panel is a narrow strip with its rotated title. Give it a **summary** — a count, a status,
an amount — so the user can tell whether it is worth opening:

```java
@Override
protected Component panelSummary(String panelFieldName) {
  return switch (panelFieldName) {
    case "payments" -> new Text("payments-summary", "€240 due");
    case "requests" -> new Text("requests-summary", "2 open");
    default -> null;
  };
}
```

Fluent: `FoldoutPanel.builder()....summary(component)`. It travels as the child slotted
`summary-N` and is drawn in the strip under the title; renderers whose panels never fold (the
React Native accordion keeps it under a closed panel's title, IntelliJ under the panel heading)
show it as a one-line digest. Redwood draws the summary's texts as one line under the panel title.

![Folded panels showing their summary](/images/docs/foldout/summary.png)

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Overview + fold-out panels, orientation, navigation header | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Folded-panel `summary` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Redwood parameter and slot reference

What the Redwood `foldout-layout` and `foldout-panel` components expose, and what Mateu gives you
for them. The canonical page-header elements shared by every template are documented once in
[Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

### Layout (`foldout-layout`)

| Redwood prop / slot | Mateu | |
|---|---|---|
| `orientation: horizontal \| vertical` | `orientation()` → `FoldoutOrientation.vertical` (default: the overview is the first column, left of the panels) \| `horizontal` (the overview is the band across the top — Redwood's `overview` slot — and the panels run below it) | ✅ |
| `nextStep` / `previousStep` + `spPrevious` / `spNext` | `navigationHeader()` → `FoldoutNavigation.previousActionId` / `nextActionId` | ✅ |
| `displayOptions.goToParent` + `spGoToParent` | `FoldoutNavigation.parentLabel` / `parentActionId` | ✅ |
| **Slot** `overview` | the first component field (always visible) | ✅ |
| **Slot** default (the panels) | component fields annotated `@Panel`, or `FoldoutLayout.panels` | ✅ |
| **Slot** `drilldown` | — | — |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| `selectedPanel` (controlled selection) | `@Panel(open = …)` / `FoldoutPanel.open` set the initial state — the component has no folded state, so an `open = false` panel starts as a strip (title + summary) and selecting it (click, keyboard focus, its page dot) unfolds it; the selection is not a controlled prop afterwards | 🟡 |
| `animate` | the renderer animates folding; not configurable | 🟡 |
| `displayOptions.bidirectionalNavigation` | on when `FoldoutNavigation.previousActionId` is set (both arrows drawn) | ✅ |
| `displayOptions.background: default \| transparent` | — the Redwood renderer always uses `transparent` (`style`/`cssClasses` escape hatch) | — |
| `displayOptions.inFlowBack` + `spInFlowBack` | — | — |

### Panel (`foldout-panel`)

| Redwood prop / slot | Mateu | |
|---|---|---|
| `panelTitle` | `@Panel(title)` / `FoldoutPanel.title` (defaults to the field label) | ✅ |
| — | `subtitle`, `icon`, `width` are Mateu additions with no Redwood equivalent (the Redwood renderer joins `subtitle` to the title and draws `icon` in the panel's top-end corner, beside its title) | ✅ |
| **Slot** default | `@Panel` field value / `FoldoutPanel.content` | ✅ |
| **Slot** `summary` (what shows on the **collapsed strip**) | `panelSummary(panelFieldName)` / `FoldoutPanel.summary` — Redwood draws it as a line in the default slot, because the component reads its `summary` slot only once, before the page binds it | 🟡 |
| **Slot** `recommendation` | — | — |
| **Slot** `noData` | — compose an `EmptyState` as the panel content | 🟡 |
| `secondaryActions` + `spAction {actionId}` | the overview panel's Edit pencil: `overviewEditActionId()`; other panel-level actions live inside the panel content | 🟡 |

## Known gaps

The element-by-element review, with code references, is in
[foldout-layout review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/foldout-layout.md). In short:

- No drill-down level, no search in the navigation header, no recommendation area.
- Panels other than the overview cannot declare their own header actions.
- On Redwood the folded-strip summary and the panel icon are drawn by Mateu, not by Spectra's slots.
