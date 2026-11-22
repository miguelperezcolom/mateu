/**
 * Which family module draws each catalogue wire type — known up front so the families can load on
 * demand (one chunk each) while the dispatch and the conformance count stay synchronous.
 * families.test.ts checks this table against the family modules, so it cannot drift.
 */
export type LazyFamily = 'display' | 'status' | 'visual'

export const LAZY_FAMILIES: Record<LazyFamily, readonly string[]> = {
  display: ['HeroSection', 'EntityHeader', 'CalloutCard', 'NotFound', 'Breadcrumbs', 'Icon', 'Avatar', 'AvatarGroup', 'Details', 'Tooltip', 'Popover', 'FormItem', 'FeatureGrid', 'Testimonials', 'Faq', 'CookieConsent', 'Timeline', 'CommentThread', 'FileList', 'MessageList', 'MessageInput', 'Chat'],
  status: ['Scoreboard', 'MetricCard', 'Stat', 'Meter', 'ComparisonCard', 'OfferCard', 'PricingTable', 'Ledger', 'TaskProgress', 'Checklist', 'StatusList', 'ProcessMonitor', 'ProgressSteps', 'TaskQueue', 'DashboardLayout', 'DashboardPanel', 'BoardLayout', 'BoardLayoutRow', 'BoardLayoutItem', 'SplitLayout', 'MasterDetailLayout', 'CarouselLayout', 'FoldoutLayout', 'VirtualList', 'MenuBar', 'ContextMenu', 'Directory', 'ActionPanel', 'DropZone'],
  visual: ['Chart', 'TrendChart', 'Funnel', 'Heatmap', 'Calendar', 'Gantt', 'PlanningBoard', 'Kanban', 'MatrixGrid', 'OrgChart', 'RecordMerge', 'Map', 'Grid', 'ResourceGrid', 'AddOnPicker', 'PaymentPicker', 'Bpmn', 'Workflow', 'FormEditor'],
}
