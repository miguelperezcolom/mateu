import type { Catalogue } from './types'
import './status.css'
import { ComparisonCard, Ledger, Meter, MetricCard, OfferCard, PricingTable, Scoreboard, Stat } from './status/kpis'
import { Checklist, ProcessMonitor, ProgressSteps, StatusList, TaskProgress, TaskQueue } from './status/progress'
import { BoardLayout, BoardLayoutItem, BoardLayoutRow, CarouselLayout, DashboardLayout, DashboardPanel, FoldoutLayout, MasterDetailLayout, SplitLayout, VirtualList } from './status/layouts'
import { ActionPanel, ContextMenu, Directory, DropZone, MenuBar } from './status/menus'

/** Wire types of the "status" group (KPIs, progress, status lists, layouts, menus), each drawn with Primer. */
export const status: Catalogue = {
  Scoreboard, MetricCard, Stat, Meter, ComparisonCard, OfferCard, PricingTable, Ledger,
  TaskProgress, Checklist, StatusList, ProcessMonitor, ProgressSteps, TaskQueue,
  DashboardLayout, DashboardPanel, BoardLayout, BoardLayoutRow, BoardLayoutItem,
  SplitLayout, MasterDetailLayout, CarouselLayout, FoldoutLayout, VirtualList,
  MenuBar, ContextMenu, Directory, ActionPanel, DropZone,
}
