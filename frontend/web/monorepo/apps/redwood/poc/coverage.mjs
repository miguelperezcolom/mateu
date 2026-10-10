// COBERTURA REAL del renderer Redwood/VB por tipo de componente del wire — la fuente de la tabla
// «Redwood component coverage» de reference/parity.md (que se GENERA de aquí: node
// parity-check.mjs --write). parity-check.mjs, en CI, falla si:
//   - un tipo del wire (ComponentMetadataDto) no está aquí, o aquí hay uno que el wire no tiene;
//   - un tipo 'full'/'partial' no tiene la rama que dice (`via`, por defecto `t === 'X'` en
//     reduceContexts.mjs) — la documentación prometería algo sin código detrás;
//   - un tipo 'none' SÍ tiene rama (la tabla se quedó atrás: hay que subirlo);
//   - la sección generada de parity.md no coincide con esta tabla.
// status: full (✅ lo pinta un componente Oracle o el átomo propio) · partial (🟡, con nota) ·
// layout (✅ contenedor: sus hijos se pintan en el flujo de la página) · part (pieza de otro
// componente: se juzga con su dueño) · none (— no se pinta: se pierde en silencio, ojo).
export const REDWOOD_COVERAGE = {
  // ── páginas y estructura ──
  App: { status: 'full', note: 'oj-sp shell: navigation drawer / top tabs / card menus' },
  Page: { status: 'full', note: 'oj-sp header (title, subtitle, KPIs, toolbar, banners)' },
  Form: { status: 'full', via: "'Form'", note: 'oj-form-layout' },
  Crud: { status: 'full', via: "'Crud'", note: 'oj-table + smart search; groups, totals, tones, columns, saved views, export' },
  Card: { status: 'full', note: 'oj-panel' },
  Details: { status: 'full', note: 'oj-collapsible (client-side state)' },
  AccordionLayout: { status: 'full', note: 'oj-collapsible per panel' },
  AccordionPanel: { status: 'part', note: 'of AccordionLayout' },
  TabLayout: { status: 'full', note: 'oj-tab-bar (nested strips flattened)' },
  Tab: { status: 'part', note: 'of TabLayout' },
  FoldoutLayout: { status: 'full', note: 'oj-sp-foldout-layout; inside a tab, collapsible panels' },
  SplitLayout: { status: 'full', note: 'two panes' },
  MasterDetailLayout: { status: 'full', note: 'list + detail panes' },
  HorizontalLayout: { status: 'full', note: 'oj-flex row' },
  VerticalLayout: { status: 'layout' },
  FormLayout: { status: 'full', note: 'oj-form-layout' },
  FormRow: { status: 'part', note: 'of FormLayout' },
  FormItem: { status: 'layout' },
  FormSection: { status: 'layout' },
  FormSubSection: { status: 'layout' },
  Scroller: { status: 'layout' },
  FullWidth: { status: 'layout' },
  Container: { status: 'layout' },
  Div: { status: 'layout' },
  ContentLayout: { status: 'layout' },
  ResponsiveGrid: { status: 'partial', note: 'fixed tracks → oj-flex columns sized by their fr weights and spans; auto-fill/auto-fit grids stack; reorderable tiles drag (and Alt+←/→)' },
  BoardLayout: { status: 'layout', note: 'children stacked, not a board' },
  BoardLayoutRow: { status: 'part', note: 'of BoardLayout' },
  BoardLayoutItem: { status: 'part', note: 'of BoardLayout' },
  CarouselLayout: { status: 'partial', note: 'an image gallery is an oj-film-strip; slides with other content are stacked' },
  DashboardLayout: { status: 'full', note: 'oj-flex columns, each panel its colSpan' },
  DashboardPanel: { status: 'full', note: 'oj-panel tile (title, subtitle, content)' },
  Scoreboard: { status: 'full', note: 'KPI band' },
  HeroSection: { status: 'partial', via: "findByType(ctx.tree, 'HeroSection')", note: 'Welcome archetype hero only' },
  // ── campos y entrada ──
  FormField: { status: 'full', note: 'oj-input-*, oj-select-*, oj-radioset, oj-checkboxset, oj-input-number, capture fields' },
  CustomField: { status: 'layout', note: 'its component in place' },
  Button: { status: 'full', note: 'oj-button' },
  Anchor: { status: 'full', note: 'link / file download' },
  Element: { status: 'full', note: 'third-party web component, events wired back' },
  CustomComponent: { status: 'partial', note: 'visible placeholder + slotted children (no VB registry)' },
  // ── overlays ──
  Dialog: { status: 'full', via: "=== 'Dialog'", note: 'oj-dialog (overlay stack)' },
  Drawer: { status: 'full', via: 'export function overlayOf', note: 'oj-drawer-popup (overlay stack), subtitle, footer actions' },
  ConfirmDialog: { status: 'none' },
  ContextMenu: { status: 'none', note: 'its wrapped content shows, the menu does not' },
  Popover: { status: 'partial', note: 'trigger + the content as text lines in a shared oj-popup (hover/focus or click); the wrapped component shows as its text' },
  Tooltip: { status: 'none' },
  Notification: { status: 'none', note: 'action messages do show as toasts; the component does not' },
  CookieConsent: { status: 'none' },
  // ── display ──
  Text: { status: 'full' },
  Badge: { status: 'full', note: 'oj-badge classes' },
  Separator: { status: 'full' },
  BulletedList: { status: 'full' },
  Notice: { status: 'full', note: 'oj-sp-message-banner style band + actions' },
  EntityHeader: { status: 'full', note: 'projected to the page header (sticky business card)' },
  Meter: { status: 'full', note: 'oj-progress-bar' },
  TaskProgress: { status: 'full' },
  StatusList: { status: 'full' },
  TaskQueue: { status: 'full' },
  ResourceGrid: { status: 'full' },
  OfferCard: { status: 'full' },
  AddOnPicker: { status: 'full' },
  Ledger: { status: 'full' },
  PaymentPicker: { status: 'full' },
  Stat: { status: 'full' },
  ProgressSteps: { status: 'full', note: 'oj-train' },
  ProgressBar: { status: 'partial', via: "=== 'ProgressBar'", note: 'wizard progress only' },
  ActionPanel: { status: 'full', note: 'oj-dialog + oj-switch ("I want to…")' },
  DropZone: { status: 'full', note: 'drop target for @DragRows listing rows (oj-table dnd); its content as text lines' },
  MatrixGrid: { status: 'full', note: 'oj-data-grid' },
  PlanningBoard: { status: 'full', note: 'oj-gantt (move, resize, double click, range selection)' },
  EmptyState: { status: 'partial', via: "findByType(tree, 'EmptyState')", note: 'page-level empty state only' },
  NotFound: { status: 'full', via: "findByType(tree, 'NotFound')" },
  MetricCard: { status: 'full', note: 'KPI tile: value, trend, drill-in action' },
  Chart: { status: 'full', note: 'oj-chart: bar, line, pie, doughnut, radar/polar area, scatter; several series' },
  TrendChart: { status: 'full', note: 'oj-chart line/area' },
  Gantt: { status: 'full', note: 'oj-gantt: a row per task, progress fill, task click → onTaskSelectionActionId' },
  Kanban: { status: 'none' },
  Timeline: { status: 'none' },
  Calendar: { status: 'full', note: 'month, week, day and list views (JET has no calendar: a Redwood-token grid, oj-buttonset-one switcher), per-date cells, clickable dates' },
  PricingTable: { status: 'none' },
  OrgChart: { status: 'none' },
  Heatmap: { status: 'none' },
  Funnel: { status: 'none' },
  FeatureGrid: { status: 'none' },
  Testimonials: { status: 'none' },
  Faq: { status: 'none' },
  CalloutCard: { status: 'none' },
  CommentThread: { status: 'none' },
  FileList: { status: 'none' },
  Checklist: { status: 'none' },
  ComparisonCard: { status: 'none' },
  ProcessMonitor: { status: 'none' },
  Skeleton: { status: 'none', note: 'the shell shows its own loading skeleton' },
  Avatar: { status: 'full', note: 'oj-avatar' },
  AvatarGroup: { status: 'full', note: 'oj-avatar per person, +N beyond maxItemsVisible' },
  Icon: { status: 'none' },
  Image: { status: 'full', note: 'JET has no image component: an <img>; relative sources are served by the backend' },
  Markdown: { status: 'partial', note: 'formatted (headings, lists, quotes, code, bold, italics, links) as allowlist-sanitized HTML; no tables, and HTML inside the Markdown shows as text' },
  Map: { status: 'none' },
  Breadcrumbs: { status: 'none', note: 'the shell has its own breadcrumbs' },
  Breadcrumb: { status: 'part', note: 'of Breadcrumbs' },
  Grid: { status: 'partial', note: 'oj-table (list display) with its columns and rows; no tree, no paging' },
  GridColumn: { status: 'part', note: 'of Grid / Crud' },
  VirtualList: { status: 'none' },
  MenuBar: { status: 'none' },
  MessageList: { status: 'none' },
  MessageInput: { status: 'none' },
  Chat: { status: 'none', note: 'the app-level AI chat panel exists; the component does not' },
  Bpmn: { status: 'none' },
  Workflow: { status: 'none' },
  FormEditor: { status: 'none' },
  Stepper: { status: 'none' },
  Result: { status: 'none' },
  Directory: { status: 'none' },
  MicroFrontend: { status: 'none' },
}

export const STATUS_MARK = { full: '✅', layout: '✅ layout', partial: '🟡', part: '↳', none: '—' }

/** La tabla Markdown de parity.md (sección generada). */
export function coverageTable(coverage = REDWOOD_COVERAGE) {
  const order = { full: 0, layout: 1, partial: 2, part: 3, none: 4 }
  const rows = Object.entries(coverage)
    .sort(([a, x], [b, y]) => (order[x.status] - order[y.status]) || a.localeCompare(b))
    .map(([type, c]) => `| \`${type}\` | ${STATUS_MARK[c.status]} | ${c.note || ''} |`)
  const count = (s) => Object.values(coverage).filter((c) => c.status === s).length
  return [
    `Generated from \`frontend/web/monorepo/apps/redwood/poc/coverage.mjs\` and checked in CI against the`,
    `wire catalogue and the renderer's code (\`node poc/parity-check.mjs\`): ${count('full')} rendered, ${count('layout')} layout`,
    `containers, ${count('partial')} partial, ${count('none')} not rendered (they are dropped silently — the`,
    `children of a container still render).`,
    '',
    '| Component | Redwood | How |',
    '|---|---|---|',
    ...rows,
  ].join('\n')
}
