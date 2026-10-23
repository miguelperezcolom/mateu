# Redwood «Gantt page» — review against the guide (2026-10-23)

Source: the Redwood guide page of the Gantt page template (`oj-sp-gantt-page-pattern`; category
*Transactional*, since 22C — description plus one anatomy image). The pattern's API is not in the
CDN extraction (`design/vb-page-template-apis.md` §2bis lists it as "not analysed").

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

## 1. When it is used

An interactive **scheduling workspace**: time segments (jobs, shifts, projects) across a time
horizon — start, progress, end, downtime, calendar events, dependencies — where the user monitors,
adjusts and analyses the schedule. In Mateu: the `GanttPage` archetype
(`orchestrators/ganttpage/GanttPage.java:33`) over the `Gantt` component.

## 2. Regions (anatomy, from the guide's image)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Transactional page header | avatar, title, subtitle, history/undo/redo, Cancel, actions, Primary, timestamp | `heading()` = an xl `Text` (`GanttPage.java:72-89`); no header actions hook | a `Text` | ❌ |
| 2 | Time-range selector ("October 2024 ▾") | yes | — the axis is derived from the tasks' dates | scales chosen from the span (`boards.mjs:136-137`) | ❌ |
| 3 | Row axis | hierarchical rows (expand/collapse), avatars | one row per `GanttTask`, flat (`GanttTask.java:8`) | `oj-gantt` row axis | 🟡 flat only |
| 4 | Timeline | major/minor scale, several bars per row, progress, downtime, dependencies | one bar per row, `progress`, `color` | `oj-gantt` bars + progress fill (`boards.mjs:102-146`) | 🟡 |
| 5 | Task selection → detail | yes | bar click → `selectGanttTask` → `taskDrawer(task, rq)` (`GanttPage.java:127-154`) | `oj-gantt` click → `_clickedTaskId` | ✅ (the drawer inherits the Redwood drawer gaps: `size(m)` ignored) |
| 6 | Docked detail / bottom drawer | the page uses a bottom drawer and a side drawer together | `detail(rq)` (a `Card` under the canvas) + `bottomPanel(rq)` (a collapsible modeless bottom `Drawer`, `:100-113`) | `detail` ✅ as content; `bottomPanel` as an inline `oj-collapsible` panel (`content.mjs:1031-1044`), not docked | 🟡 |
| — | The template itself | `oj-sp-gantt-page-pattern` | — | not used: composed `VerticalLayout`; the canvas is JET's `oj-gantt` | 🟡 |

## 3. Responsive behaviour

No responsive section in the guide. Mateu: edge to edge (`PageWidthStyle.EDGE_TO_EDGE`,
`GanttPage.java:36`); the canvas scrolls horizontally; `oj-gantt` row axis capped at 30% width
(`main-start-page.html` `row-axis.max-width="30%"`).

## 4. Configuration

| Element | Guide | Mateu | Vaadin | Redwood | Status |
|---|---|---|---|---|---|
| Edge-to-edge canvas | page layout | `pageWidth()` | ✅ | ✅ | ✅ |
| Bars with start/end, progress, colour | yes | `GanttTask(id, title, start, end, progress, color)` | ✅ | ✅ (done part in a darker shade of the colour) | ✅ |
| Task click → side drawer | yes | `taskDrawer` / `taskDetail` overridable | ✅ | 🟡 drawer drawn without size | 🟡 |
| Bottom drawer of supporting data | yes | `bottomPanel(rq)` + `bottomPanelTitle()` | ✅ docked, collapsible, modeless | 🟡 inline collapsible panel | 🟡 |
| Hierarchical rows | yes | — | ❌ | ❌ | ❌ |
| Several segments per row, downtime, calendar events | yes | — on `Gantt`; `PlanningBoard` (resources × blocks, drag) covers multi-segment rows | ❌ | ❌ on `Gantt` | ❌ |
| Dependencies | yes | — | ❌ | ❌ | ❌ |
| Adjusting the schedule (drag/resize) | yes | — on `Gantt` (read-only); `PlanningBoard.moveActionId` does it | ❌ | ❌ on `Gantt` | ❌ |
| Time-range / zoom control | yes | — | ❌ | 🟡 automatic scale | ❌ |
| Transactional header | yes | — | ❌ | ❌ | ❌ |

## 5. Findings

1. The archetype is a **monitor**, the template a **workspace**: no editing, no hierarchy, no
   multiple segments per row, no dependencies, no time-range control. `PlanningBoard` already has
   multi-block rows + drag on `oj-gantt` — the gap is in `Gantt`/`GanttTask`, not in the renderer.
2. No transactional header (same as DataManagement).
3. The default `taskDetail` text is hard-coded Spanish (`"% completado"`, `GanttPage.java:162`) — it
   should go through chrome texts / i18n.
4. The bottom drawer is not docked on Redwood (inline collapsible panel).

## 6. Proposed plan

1. `GanttTask` gains `parentId` (hierarchy) and the `Gantt` an optional `moveActionId` (reuse the
   `PlanningBoard` contract) — `oj-gantt` already supports both.
2. Header actions + `@Timestamp` on the archetype (shared with DataManagement).
3. Translate the default `taskDetail` line.
