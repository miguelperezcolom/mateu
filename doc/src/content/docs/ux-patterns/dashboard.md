---
title: Dashboard
description: Give users a prioritized, at-a-glance overview of their essential business status.
---

**Status:** ✅ Implemented · Redwood template: **Dashboard landing page** (`oj-sp-dashboard-landing-page`, overview category)

A dashboard landing page is the screen a user opens to find out how the business is doing before
deciding what to work on. It condenses figures that usually live in many places into two layers: a
strip of key numbers that answers "where do we stand?", and a grid of panels — charts, short lists,
notes — that explain why the numbers are what they are and lead to the detail behind them. A
featured heading can introduce the grid when one metric deserves the spotlight.

In Mateu this is the `Dashboard` archetype: you declare fields holding components, and Mateu turns
the `MetricCard` fields into the KPI strip (the *scoreboard*) and the `@Panel` fields into the tiles
of a responsive grid.

## When to use it

- As the **home route** of an operational back office: the scoreboard answers "is everything OK?"
  and every panel is one click away from whatever is not.
- When the figures come from **several sources** and the user needs them side by side to compare
  trends, rather than one listing at a time.
- With **one dominant visualization** (put it first and let it span the whole row — Redwood calls
  this the *hero* arrangement) or with **two to five panels that must be visible together** (the
  *above-the-fold* arrangement).

Don't use it when the overview is about a single collection — a listing with `@KPI` header facts
does that better — or to complete a task: a dashboard reads, it does not edit.

## Anatomy

![The dashboard landing page painted by the Redwood renderer: header, KPI strip and panel grid](/images/docs/redwood-templates/dashboard-landing-1.png)

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | Page header | Page title, optional subtitle, primary action, optional timestamp, optional context/object switcher | `@Title`; `@Toolbar` methods (the first primary-styled one is the primary action) |
| 2 | Scoreboard | A strip of KPI tiles: label, value, trend, short caption; a tile may lead to the detail | consecutive `MetricCard` fields (fluent: `Scoreboard`) |
| 3 | Performance title | An optional heading that introduces the grid and names the metric being featured | — no dedicated piece (see [Known gaps](#known-gaps)) |
| 4 | Dashboard grid | The arrangement of the panels: one dominant panel, or several in a row | the archetype's `ResponsiveGrid`; `columns()`, `@Panel(colSpan, rowSpan)` |
| 5 | Dashboard panel | One business story: a title, a subtitle and its content (a chart, a list, a map…) | a component field with `@Panel(title, subtitle)` (fluent: `DashboardPanel`) |

Any component field without `@Panel` lands on the grid as a bare tile, and a field of any other type
is ignored, so ordinary state fields can live on the class.

## Responsive behaviour

Redwood keeps the scoreboard as one horizontal strip (scrolling sideways when the tiles do not fit)
and reflows the grid panels from a row into a single column as the window narrows.

In Mateu the grid is one `ResponsiveGrid`:

- **No `columns()`** (the default, `0`): the tiles auto-fit — as many 16rem tiles per row as the
  width allows, down to one per row on a phone.
- **`columns()` = N**: N equal tracks on wide screens; each `@Panel(colSpan)` takes that many of
  them, the KPI strip takes the whole row, and everything stacks on small screens.

On the Redwood renderer the page is Spectra's own `oj-sp-dashboard-landing-page`: the KPI strip is
its scoreboard in the `kpi` slot, so it behaves like Redwood's — one line that scrolls sideways (with
arrows) when the tiles do not fit — and up to five panels go on Spectra's `oj-sp-dashboard-grid`,
which picks its own layout for the width (above the fold, hero plus, stacked on a phone). That grid
ignores `colSpan`, `rowSpan` and `columns()`, so it is used only when the dashboard declares none of
them: as soon as a `@Panel` has a `colSpan` or `rowSpan` other than 1, or `columns()` is not 0, the
panels stay on Mateu's grid, which honours the declared columns and spans (as it does with more than
five panels or with `reorderable()`). The Vaadin renderer
wraps the KPI tiles onto a second line instead.

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported · ➖ not applicable

| Element | Mateu piece | Redwood | Notes |
|---|---|---|---|
| Page title (required) | `@Title` | ✅ | the `oj-sp-dashboard-landing-page` header |
| Subtitle | — | ❌ | a dashboard composes its own tree, so `@Subtitle` is not read |
| Primary action | `@Toolbar(buttonStyle = ButtonStyle.primary)` method | ✅ | further `@Toolbar` methods become secondary actions |
| Timestamp ("last updated") | — | ❌ | `@Timestamp` is a form-page feature |
| Context / object switcher | — | ❌ | `RecordSwitcherSupplier` needs a reflected page header |
| KPI tiles | `MetricCard` fields → scoreboard | ✅ | Spectra's `oj-sp-scoreboard`, drawn exactly as Spectra draws it ("pure KPI"): value + unit, a percentage trend as its period-change indicator, any other trend as a coloured badge, timeframe and description as the tile's meta line |
| KPI icon | `MetricCard.icon` | ➖ | not shown on Redwood: Spectra's metric card has no icon, and none is added (the other renderers draw it) |
| KPI drill-in | `MetricCard.actionId` | ✅ | the whole tile is the target (click or Enter); the scoreboard's own *selection* is a filter, so it stays off |
| KPI timeframe | `MetricCard.timeframe` | ✅ | shown under the value and read in the tile's accessible name |
| Sticky scoreboard | — | ❌ | the strip scrolls with the page |
| Maximum visible KPIs | — | ❌ | every declared metric renders |
| Performance title | — | ❌ | |
| Grid arrangement (hero / above the fold) | `columns()` + `@Panel(colSpan)` | 🟡 | nothing declared and up to five panels: Spectra's `oj-sp-dashboard-grid` lays them out itself (its above-the-fold / hero-plus layouts); a `colSpan`/`rowSpan` ≠ 1 or `columns()` ≠ 0, more than five panels, or `reorderable()`: Mateu's grid with `columns()` and `colSpan` (`rowSpan` is not drawn as a row span on that grid) |
| Panel title and subtitle | `@Panel(title, subtitle)` | ✅ | Spectra's `oj-sp-dashboard-panel` (`panelTitle` / `panelSubtitle`) |
| Panel content: chart | `Chart`, `TrendChart` | ✅ | JET `oj-chart` |
| Panel content: list | `Grid`, `StatusList`, `Markdown`… | ✅ | |
| Panel content: map | `Map` | ✅ | Leaflet over OpenStreetMap (JET has no street map) |
| Panel content: treemap, sunburst | — | ❌ | no Mateu component (`Heatmap` is the nearest) |
| Empty panel | `EmptyState` as the panel content | ✅ | Spectra's `oj-sp-empty-state` |
| General / create-edit drawer | an action returning a `Drawer` | ✅ | |
| Page width | `@PageWidth` on the class | ✅ | fixed by default; full width and edge to edge also allowed by Redwood |
| Density | override `style()` to return `StyleConstants.COMPACT` | ✅ | `@Compact` is not read on composed archetypes |
| Viewer-arranged tiles | `reorderable()` | 🟡 | each viewer's own order, kept in the browser; no shared layouts |
| PWA back arrow | — | ➖ | |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Extend `Dashboard` and declare fields holding components. Mateu lays them out as a dashboard grid:

- Consecutive `MetricCard` fields are grouped into a **scoreboard** band (full-width strip of KPI tiles).
- Component fields annotated with `@Panel` become **titled tiles** on a responsive grid (`title` defaults to the field label; `colSpan`/`rowSpan` control the footprint).
- Any other component field is placed on the grid as-is.

```java
@UI("/dashboard")
@Title("Sales dashboard")
public class SalesDashboard extends Dashboard {

    MetricCard revenue = MetricCard.builder()
            .title("Revenue").value("1.2").unit("M€")
            .trend(MetricTrend.up).trendLabel("+8% vs last month")
            .timeframe("This month")
            .icon("vaadin:dollar")
            .build();

    MetricCard orders = MetricCard.builder()
            .title("Orders").value("3,421")
            .trend(MetricTrend.up).trendLabel("+112")
            .timeframe("Last 7 days")
            .build();

    @Panel(title = "Monthly sales", subtitle = "Units sold per month", colSpan = 2)
    Chart sales = Chart.builder()
            .chartType(ChartType.bar)
            .chartData(ChartData.builder()
                    .labels(List.of("Jan", "Feb", "Mar"))
                    .datasets(List.of(ChartDataset.builder()
                            .label("2026").data(List.of(120d, 190d, 300d)).build()))
                    .build())
            .build();

    @Panel(title = "Notes")
    Markdown notes = new Markdown("- Summer campaign starts **July 15th**", null, null);

    @Override
    protected int columns() {
        return 3;            // "Monthly sales" takes two of the three columns
    }

    @Toolbar(buttonStyle = ButtonStyle.primary)
    Object newCampaign() {   // the header's primary action
        return URI.create("/campaigns/new");
    }
}
```

![Sales dashboard](/images/docs/dashboard/sales-dashboard.png)

Populate the fields in the constructor or field initializers — query your use cases or repositories there, exactly like any other Mateu view-model. Override `columns()` to fix the number of grid columns; the default (`0`) lets the renderer pick a responsive auto-fit count.

For the hero arrangement, give the dominant panel `colSpan` equal to `columns()` and declare it
first; for the above-the-fold arrangement, keep two to five panels whose spans fill one or two rows.

### Drill-in

Give a `MetricCard` an `actionId` to make it clickable; the action is dispatched to the page like a button press, so you can navigate to the backing listing:

```java
MetricCard pending = MetricCard.builder()
        .title("Pending approvals").value("14")
        .actionId("openPending")
        .build();

@Action
Object openPending() {
    return URI.create("/approvals");
}
```

![A KPI tile leading to its listing on Redwood](/images/docs/redwood-templates/dashboard-landing-2.png)

### Tiles the viewer can rearrange

Override `reorderable()` to let each viewer drag the tiles into their own order, the way OPERA Cloud's dashboard works:

```java
@Override
protected boolean reorderable() {
    return true;
}
```

The viewer drops a tile on another to put it there. From the keyboard, focus a tile and press **Alt+←** or **Alt+→** to move it one place. The order belongs to the viewer: it is kept in the browser for that screen, keyed by each tile's id (the field name), and the declaration order stays the default. A tile you add later shows up after the ones the viewer has already placed. Nothing goes to the server, so a viewer who changes browser starts from the declared order.

The flag lives on the grid the archetype composes (`ResponsiveGrid.reorderable`; fluent: `grid.asReorderable()`), so any responsive grid of tiles can offer it. It works on the Vaadin and Redwood renderers. The native renderers keep the declared order.

### Fluent variant

Everything is also available as fluent components for `ComponentTreeSupplier` pages: put a `Scoreboard`, `DashboardPanel`s and `MetricCard`s on a `ResponsiveGrid` — the grid the `Dashboard` archetype composes — when the layout is data-dependent. (`DashboardLayout` is deprecated: use `ResponsiveGrid`.)

```java
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

@Override
public Component component(HttpRequest request) {
    return new ResponsiveGrid(
            "dashboard",
            List.of(),                         // no tracks = auto-fit; or N × GridTrack.fill()
            List.of(
                    Scoreboard.builder().metrics(kpis()).build(),
                    DashboardPanel.builder().title("Monthly sales").colSpan(2)
                            .content(salesChart()).build()));
}
```

### In YAML

A YAML page fills the template with `template: {type: DashboardLandingPage}` on its `type: Form`:
the scoreboard's `MetricCard`s in its `kpi` slot, the form's `content` as the panels — see
[Page templates](/define/yaml/pages/#page-templates--template). The page header (title, subtitle,
timestamp, toolbar) is the form's own.

```yaml
type: Form
title: The galaxy at a glance
template:
  type: DashboardLandingPage
  kpi:
    - {type: MetricCard, title: Characters, value: "82"}
    - {type: MetricCard, title: Planets, value: "60"}
content:
  - type: DashboardPanel
    title: Characters per film
    content:
      type: Chart
      chartType: bar
      chartData: {labels: [I, II, III], datasets: [{label: Characters, data: [34, 40, 34]}]}
```

### Checklist for KPIs

A number on a dashboard is only useful if the reader knows what it measures and over which period. Before shipping a dashboard, check that:

- **Every metric is named and explained.** Give each `MetricCard` a `title` and a `description` (or a panel subtitle) that says what is counted, so the tile reads without asking anyone.
- **Every number carries its timeframe.** Set `timeframe` to the period the value covers, e.g. `MetricCard.builder().title("Revenue").value("12.4k").timeframe("Last 7 days")`. The renderers show it under the value, small and in the secondary text colour, and add it to the tile's accessible name ("Revenue, 12.4k, Last 7 days, …"). A blank timeframe shows nothing. "1,204 orders" without a period is ambiguous; "1,204 orders · This month" is not.
- **One date format per locale.** Format the dates in titles, timeframes and panels the same way across the dashboard (format them from the request locale), rather than mixing `07/10`, `Oct 7` and `2026-10-07` on one screen.
- **Every listing on the dashboard has a meaningful default sort**, such as most recent first or largest amount first, so the rows that matter are at the top without a click.

`timeframe` is **experimental** (`@Experimental`): its name and shape may still change before it is declared stable. To help adoption, Mateu logs a one-time INFO hint when a dashboard's `MetricCard`s carry no timeframe.

## Redwood parameter and slot reference

What the Redwood `dashboard-landing-page` template (plus `dashboard-grid`, `dashboard-panel` and
`scoreboard`) exposes, and what Mateu gives you for it. The canonical page-header elements shared by
every template are documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** `kpi` | consecutive `MetricCard` fields, grouped into the scoreboard band | ✅ |
| `scoreboard.data` | the `MetricCard` fields themselves (or `Scoreboard` in the fluent variant) | ✅ |
| `scoreboard.selection` / `selectionMode: none \| single` | `MetricCard.actionId` makes a tile actionable, but a tile cannot hold selected state | 🟡 |
| `scoreboard.maxKpis` | — every declared metric renders | — |
| `dashboard-panel {panelTitle, panelSubtitle}` | `@Panel(title, subtitle)` / `DashboardPanel` | ✅ |
| `dashboard-grid` placement | up to five panels: Spectra's own layouts (`@Panel(colSpan, rowSpan)` and `columns()` not read); more, or `reorderable()`: Mateu's grid with `colSpan` | 🟡 |
| `displayOptions.scoreboardSticky` | — the band scrolls with the page | — |
| `displayOptions.density: standard \| compact` | override `style()` to return `StyleConstants.COMPACT` (`@Compact` is read only on reflected pages) | 🟡 |
| `selectContext` / `selectObject` + `displayOptions.switcherSearch` | `RecordSwitcherSupplier`, but only on a reflected page with a header — the `Dashboard` archetype (and an `@AutoPage`-inferred dashboard) composes its own tree and cannot carry one | 🟡 |
| `editLayoutMode` (drag tiles) | `reorderable()`: each viewer drags the tiles into their own order, kept in their browser | 🟡 |
| `contentLibraryData`, `editLayoutOptions {share, properties, contentLibraryFilters}` | ⚪ adding tiles from a content library and sharing layouts are a Fusion Apps concern, out of scope by decision | ⚪ |
| `spRestoreDefaults`, `spShare` | ⚪ part of the same edit-layout feature | ⚪ |

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| `Dashboard` archetype (scoreboard band + panels) | ✅ | ✅ | ✅ | ✅ | ✅ ¹ | ✅ | ✅ |
| `MetricCard.actionId` drill-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MetricCard.timeframe` (under the value + in the accessible name) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@AutoPage` inference (MetricCard fields → dashboard) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reorderable tiles | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |

¹ On Spectra's `oj-sp-dashboard-landing-page` (scoreboard in its `kpi` slot, `oj-sp-dashboard-panel`s on `oj-sp-dashboard-grid` up to five panels); `MetricCard.icon` is not shown.

The renderer columns of the first three rows need no dashboard code: the archetype is pure
composition on the one responsive grid. Tile reordering is client-side (the viewer's own order),
built on the web renderers (Vaadin, Redwood) only.

## Known gaps

The full element-by-element review, with code references, is in
[dashboard-landing review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/dashboard-landing.md). In short:

- Since 2026-10-24 Redwood paints the archetype with Spectra's `oj-sp-dashboard-landing-page`,
  `oj-sp-scoreboard`, `oj-sp-dashboard-grid` and `oj-sp-dashboard-panel`. On Spectra's grid (≤ 5
  panels) `colSpan`/`rowSpan`/`columns()` are not read — Spectra picks the layout; `MetricCard.icon`
  is not shown.
- No subtitle, timestamp, record switcher, performance title or sticky scoreboard on the archetype.
- `@Compact` is not read on a dashboard; use `style()`.
