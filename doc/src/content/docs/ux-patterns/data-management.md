---
title: Data management
description: A dense, full-width page that shows the same data as a grid and as a Gantt, with a toolbar switcher between them — the Redwood Data management template.
---

**Status:** ✅ Implemented (Java, .NET, Python)

## Intent

Present a large data set two ways — a **data grid** and a **Gantt timeline** — on one dense,
full-width page, with a toolbar switcher so the user can review it as a table or as a schedule, and
panels docked beside or under it for details and messages. The Oracle Redwood **Data management**
template.

In Redwood the template is a *transactional* workspace for complex data: the user sorts, filters and
edits the grid in place, follows the same records as tasks on a timeline, and keeps supporting
information in panels around them. Mateu's `DataManagement` archetype gives the page, the switcher
and the docked panels; the grid and the Gantt are whatever components you hand it.

## When to use it

- A big, homogeneous set of records the user **reviews and plans** — production operations, a bill of
  materials, a project's tasks — where both a tabular and a time-based view make sense.
- The user needs density: many columns, many rows, little chrome, the full width of the window.
- Not for a plain list with a detail page (use a [CRUD](/ux-patterns/inline-crud-editing/) or a
  [collection detail](/ux-patterns/collection-detail/)), and not for a schedule alone (use the
  [Gantt page](/ux-patterns/gantt/#gantt-page-template-ganttpage-archetype)).

## Anatomy

| Region | What it holds | Mateu piece |
|---|---|---|
| Page header | title (Redwood: also subtitle, avatar, Save/Cancel, undo/redo, history, timestamp) | `heading()` — the class `@Title` by default; no header actions (see *Known gaps*) |
| Toolbar | the view switcher and the panel toggles (Redwood: also edit icons, sort, export, column settings) | built by the archetype: `gridLabel()` / `ganttLabel()` buttons + one toggle per docked panel |
| Data grid | the records as a dense table | `gridView(rq)` — any component: a fluent `Grid`, an embedded crud/listing, `@InlineEditing` + `@Compact` for in-place editing |
| Gantt | the same records on a time axis | `ganttView(rq)` — typically a `Gantt` |
| End panel (`innerEnd`) | a details or properties pane beside the content | `endPanel(rq)` → `DockedPanel` |
| Bottom panel (`innerBottom`) | a messages, log or totals strip under the content | `bottomPanel(rq)` → `DockedPanel` |
| Overlay panels (`outerEnd` / `outerBottom`) | panels that float over the page | a `Drawer` returned from an action |

![The data management page showing the grid view](/images/docs/redwood-templates/data-management-1.png)

![The same page switched to the Gantt view](/images/docs/redwood-templates/data-management-2.png)

## Responsive behaviour

- The page is **full width** at every size (`PageWidthStyle.FULL_WIDTH`).
- An open end panel is a fixed track beside the content (default `22rem`); below **48rem** of
  available width it stacks **under** the content instead.
- The bottom panel caps its height at its `size` (default `16rem`) and scrolls.

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Full-width canvas | `pageWidth()` → `PageWidthStyle.FULL_WIDTH` | ✅ | |
| Grid ⇄ Gantt switch | `gridView(rq)` / `ganttView(rq)`; labels `gridLabel()` / `ganttLabel()`; the active view is page state (`_view`) | ✅ | the grid is an `oj-table`, the Gantt an `oj-gantt` |
| Page heading | `heading()` (from `@Title`; return blank to omit) | ✅ | Redwood paints it as the title of Spectra's `oj-sp-data-management-page` header |
| Docked end / bottom panels (reflow) | `endPanel(rq)` / `bottomPanel(rq)` → `DockedPanel(id, title, content, size, open)` | ✅ | a toolbar toggle and a ✕ per panel; open state is page state. Redwood docks them in the template's `innerEnd` (`oj-sp-general-drawer-template`) and `innerBottom` (`oj-sp-bottom-drawer-template`) drawers; `size` is not applied there (Spectra's own drawer sizes) |
| Overlay panels | return a `Drawer` (`modeless`, any `DrawerPosition`) from an action | 🟡 | Redwood opens every drawer modal at the end edge — see [Drawer](/ux-patterns/drawer/) |
| Bottom drawer states (closed / minimized / maximized) | `DrawerPosition.bottom` + `collapsible` + `maximizable` | ✅ | `oj-sp-bottom-drawer-template` (see [Drawer](/ux-patterns/drawer/)) |
| Density | `@Compact`, `Grid.compact(true)` | ✅ | |
| In-place editing in the grid | an embedded `AutoCrud` with `@InlineEditing` as `gridView` | 🟡 | a fluent `Grid` is read-only; not a spreadsheet-style data grid (no cell selection) |
| Transactional header (Cancel + one primary) | a `@Toolbar` method named `cancel` and one `@Toolbar(buttonStyle = primary)` method | ✅ | opt-in: without them the header has no Cancel/primary. Redwood binds them to the template's own Cancel and primary buttons |
| Header pieces (subtitle, overline, `@Timestamp`, `@KPI`, badges, peer navigation, record switcher) | the same annotations / supplier interfaces as any page | 🟡 | Vaadin draws them in the page header; Redwood's data-management template has no slot for them yet |
| Undo/redo, history | — | ❌ | |
| Tab bar under the header | — | ❌ | |
| Messages | toasts and alerts ride on the wire's `messages`, not as a page slot | 🟡 | |
| Search | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 | |
| Screen-reader announcements | `UICommand.announce(text)` from any action | ✅ | |
| Feedback survey | ⚪ out of scope | — | |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Extend `DataManagement` and supply the two views:

```java
@UI("/project-plan")
@Title("Project plan")
public class ProjectPlanBoard extends DataManagement {

  record Task(String id, String name, LocalDate start, LocalDate end, int progress) {}

  record TaskRow(String id, String name, String start, String end, String progress) {}

  static final List<Task> TASKS = List.of(
      new Task("t1", "Analysis", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 16), 100),
      new Task("t2", "Design", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 1, 30), 80),
      new Task("t3", "Build", LocalDate.of(2026, 1, 26), LocalDate.of(2026, 3, 6), 45));

  @Override
  protected Component gridView(HttpRequest rq) {   // the dense table
    List<Object> rows = new ArrayList<>();
    for (Task t : TASKS) {
      rows.add(new TaskRow(t.id(), t.name(), t.start().toString(), t.end().toString(),
          t.progress() + "%"));
    }
    return Grid.builder()
        .compact(true)
        .content(List.of(
            GridColumn.builder().id("name").label("Task").build(),
            GridColumn.builder().id("start").label("Start").build(),
            GridColumn.builder().id("end").label("End").build(),
            GridColumn.builder().id("progress").label("%").build()))
        .page(new Page<Object>("", 20, 1, rows.size(), rows))
        .build();
  }

  @Override
  protected Component ganttView(HttpRequest rq) {  // the Gantt canvas
    List<GanttTask> bars = new ArrayList<>();
    for (Task t : TASKS) {
      bars.add(new GanttTask(t.id(), t.name(), t.start(), t.end(), t.progress(), null));
    }
    return Gantt.builder().tasks(bars).build();
  }
}
```

- The page lays out **full width** (`PageWidthStyle.FULL_WIDTH`).
- A toolbar switcher (two buttons, labels via `gridLabel()`/`ganttLabel()`) flips the active view.
- The active view is kept in state (`_view`, `"grid"` by default) and the page **re-renders in
  place** when the user switches — no navigation.
- A heading (from `@Title`) sits above the toolbar; override `heading()` or return blank to omit it.

`gridView` is any component — typically a dense table (an embedded crud/listing, a fluent `Grid`,
or `@InlineEditing` + `@Compact` for in-place editing); `ganttView` is typically a `Gantt` (the same
canvas the `GanttPage` archetype uses). Pure composition of existing components, so it renders on
Vaadin, Redwood (`oj-table` + `oj-gantt`) and the native renderers without renderer work.

### Docked panels

The Redwood data-management page docks panels beside and under the content — a details pane next
to the grid, a messages or log strip under it. Override `endPanel(rq)` and/or `bottomPanel(rq)`:

```java
@Override
protected DockedPanel endPanel(HttpRequest rq) {
  return DockedPanel.builder().id("details").title("Details")
      .content(new Text("Select a row to see its details.")).size("24rem").open(true).build();
}

@Override
protected DockedPanel bottomPanel(HttpRequest rq) {
  return DockedPanel.builder().id("log").title("Log").content(new Text("No messages.")).build();
}
```

Each declared panel gets a toggle in the toolbar (and a ✕ in its own header); whether it is open is
page state, so toggling re-renders in place. The panels **reflow** the content — the grid or Gantt
shrinks to make room (the end panel is a fixed track beside it, stacking under it below 48rem; the
bottom panel caps its height at `size`, default `16rem`, and scrolls) — which is the *inner*,
modeless variant of the Redwood slots. For an *overlay* panel, return a `Drawer` from an action.

![Docked end and bottom panels](/images/docs/data-management/docked-panels.png)

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| View switcher (grid ⇄ Gantt) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Docked end / bottom panels | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |


## In YAML

A YAML page fills the template with `template: {type: DataManagementPage}` on its `type: Form`: the
form's `content` is the data view (typically a `Listing`), its toolbar's buttons sit over the data,
and the template's `end` and `bottom` are `DockedPanel`s docked beside and under it — see
[Page templates](/define/yaml/pages/#page-templates--template). With no server behind the page a
panel cannot be toggled by an action: it is shown while `open`. On Redwood a `Listing` in the data
view is painted inside the template (with its own search box).

```yaml
type: Form
title: Fleet
toolbar:
  - {type: Button, label: New vehicle, buttonStyle: primary, actionable: {type: RouteLink, route: vehicles/new}}
template:
  type: DataManagementPage
  end: {id: fleet-summary, title: Fleet at a glance, open: true, content: {type: MetricCard, title: Vehicles, value: "39"}}
content:
  - {type: Listing, rowRoute: "vehicles/${row.id}", rowsSource: {ref: swapi-vehicles}, columns: [{type: GridColumn, id: name, label: Name}]}
```

## Known gaps

- The transactional header is opt-in (a `cancel` + one primary `@Toolbar` method); no undo/redo,
  history or tab bar.
- The grid is a table: no spreadsheet-like cell selection; editing needs an embedded crud with
  `@InlineEditing`.
- Overlay panels inherit the Redwood drawer gaps (always modal, end edge).
- On Redwood the page is Spectra's `oj-sp-data-management-page`; its header is transactional by
  design, so the Cancel / primary buttons it always draws stay hidden unless the page declares
  them. Subtitle, KPIs and the other header pieces are not drawn there yet.

Details: [data-management review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/data-management.md).

## Demo

`demo-admin-panel/.../datamanagement/DataManagementDemo.java` and `demo-redwood-showcase`
(`/data-management-demo`): a project plan shown as a table and as a Gantt, switchable from the
toolbar; in the showcase a click on a task name opens its detail in a drawer. Docked panels:
`e2e/sut` `/patterns/data`.

## See also

- [Gantt](/ux-patterns/gantt/) — the Gantt component and the `GanttPage` archetype used as the timeline view.
- [Inline editing in listings](/ux-patterns/inline-crud-editing/) and [High-density screens](/ux-patterns/high-density/) —
  for the dense, editable grid view.
