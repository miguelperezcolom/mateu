import type { Catalogue } from './types'
import './visual.css'
import { Chart, Funnel, Heatmap, TrendChart } from './visual/charts'
import { Calendar, Gantt, PlanningBoard } from './visual/time'
import { Kanban, MatrixGrid, OrgChart, RecordMerge } from './visual/boards'
import { AddOnPicker, Bpmn, CustomComponent, FormEditor, Grid, MapView, PaymentPicker, ResourceGrid, Workflow } from './visual/widgets'

/**
 * Wire types of the "visual" group (charts, time, boards, data widgets), each drawn with Primer:
 * SVG in Primer's data-vis palette, CSS grids on Primer's tokens, Primer components for the
 * controls — and the React Native renderer's pure helpers for every rule (layouts, action
 * parameters, text alternatives), so the three renderers agree.
 */
export const visual: Catalogue = {
  Chart, TrendChart, Funnel, Heatmap,
  Calendar, Gantt, PlanningBoard,
  Kanban, MatrixGrid, OrgChart, RecordMerge,
  Map: MapView, Grid, ResourceGrid, AddOnPicker, PaymentPicker, CustomComponent,
  Bpmn, Workflow, FormEditor,
}
