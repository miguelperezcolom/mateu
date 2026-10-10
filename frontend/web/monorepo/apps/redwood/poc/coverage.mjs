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
  ResponsiveGrid: { status: 'full', note: 'fixed tracks → oj-flex columns by their fr weights and spans; auto-fill/auto-fit → as many per row as fit at each breakpoint; reorderable tiles drag (and Alt+←/→)' },
  BoardLayout: { status: 'layout', note: 'children stacked, not a board' },
  BoardLayoutRow: { status: 'part', note: 'of BoardLayout' },
  BoardLayoutItem: { status: 'part', note: 'of BoardLayout' },
  CarouselLayout: { status: 'full', note: 'an image gallery is an oj-film-strip; other slides one at a time with a ‹ › pager and dots (client-side)' },
  DashboardLayout: { status: 'full', note: 'oj-flex columns, each panel its colSpan' },
  DashboardPanel: { status: 'full', note: 'oj-panel tile (title, subtitle, content)' },
  Scoreboard: { status: 'full', note: 'KPI band' },
  HeroSection: { status: 'full', note: 'the Welcome archetype: oj-sp-header-welcome-banner; in the content, a hero band (title, subtitle, background image) over its children' },
  // ── campos y entrada ──
  FormField: { status: 'full', note: 'oj-input-*, oj-select-*, oj-radioset, oj-checkboxset, oj-input-number, capture fields' },
  CustomField: { status: 'layout', note: 'its component in place' },
  Button: { status: 'full', note: 'oj-button' },
  Anchor: { status: 'full', note: 'link / file download' },
  Element: { status: 'full', note: 'third-party web component, events wired back' },
  CustomComponent: { status: 'full', note: 'a registry the app fills (bridge.registerCustomComponent); without a view, a visible placeholder + its children — same contract as the web' },
  // ── overlays ──
  Dialog: { status: 'full', via: "=== 'Dialog'", note: 'oj-dialog (overlay stack)' },
  Drawer: { status: 'full', via: 'export function overlayOf', note: 'oj-drawer-popup (overlay stack), subtitle, footer actions' },
  ConfirmDialog: { status: 'full', note: 'oj-dialog, open while its openedCondition holds; Confirm / Reject / Cancel send their actions' },
  ContextMenu: { status: 'full', note: 'its content, then an oj-menu-button with the menu; a right click on the content opens it too' },
  Popover: { status: 'full', note: 'trigger + the content WITH its structure (headings, lists, links, badges, markdown) as sanitised HTML in a shared oj-popup (hover/focus or click)' },
  Tooltip: { status: 'full', note: 'the wrapped component keeps its view; the text opens in the shared oj-popup on hover/focus (on the button itself, or an info marker)' },
  Notification: { status: 'full', note: 'an info band (title — text); action messages show as toasts' },
  CookieConsent: { status: 'full', note: 'a band fixed to the top/bottom; hidden once its cookie exists, dismissing sets it' },
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
  ProgressBar: { status: 'full', note: 'oj-progress-bar (value or the state at valueKey, indeterminate); a wizard shows its progress as the guided process' },
  ActionPanel: { status: 'full', note: 'oj-dialog + oj-switch ("I want to…")' },
  DropZone: { status: 'full', note: 'drop target for @DragRows listing rows (oj-table dnd); its content as text lines' },
  MatrixGrid: { status: 'full', note: 'oj-data-grid' },
  PlanningBoard: { status: 'full', note: 'oj-gantt (move, resize, double click, range selection)' },
  EmptyState: { status: 'full', note: 'oj-sp-empty-state: the page-level one, and any other in the content with its call to action' },
  NotFound: { status: 'full', via: "findByType(tree, 'NotFound')" },
  MetricCard: { status: 'full', note: 'KPI tile: value, trend, drill-in action' },
  Chart: { status: 'full', note: 'oj-chart: bar, line, pie, doughnut, radar/polar area, scatter; several series' },
  TrendChart: { status: 'full', note: 'oj-chart line/area' },
  Gantt: { status: 'full', note: 'oj-gantt: a row per task, progress fill, task click → onTaskSelectionActionId' },
  Kanban: { status: 'full', note: 'JET has no board: oj-panel columns, cards as oj-action-card when they act (_clickedCard)' },
  Timeline: { status: 'full', note: 'oj-timeline is deprecated: a Redwood list with markers, items with an action as borderless oj-buttons (_clickedItem)' },
  Calendar: { status: 'full', note: 'month, week, day and list views (JET has no calendar: a Redwood-token grid, oj-buttonset-one switcher), per-date cells, clickable dates' },
  PricingTable: { status: 'full', note: 'oj-panel plans (the featured one highlighted), CTA oj-button' },
  OrgChart: { status: 'full', note: 'the tree as an indented outline (VB templates cannot recurse) with oj-avatar; nodes with an action are oj-action-cards (_clickedNode)' },
  Heatmap: { status: 'full', note: 'JET has none: a calendar heatmap (a column per week), 4 levels + legend, values on hover' },
  Funnel: { status: 'full', note: 'oj-chart type funnel' },
  FeatureGrid: { status: 'full', note: 'oj-panel / oj-action-card tiles on an oj-flex grid of its columns' },
  Testimonials: { status: 'full', note: 'oj-panel quotes, oj-avatar, oj-rating-gauge (read only)' },
  Faq: { status: 'full', note: 'oj-collapsible per question (client-side state), the answer as Markdown' },
  CalloutCard: { status: 'full', note: 'oj-panel band with its theme, icon and CTA oj-button' },
  CommentThread: { status: 'full', note: 'replies indented under their comment, oj-avatar per author' },
  FileList: { status: 'full', note: 'a row per file: icon by type, download link, size · type, its action' },
  Checklist: { status: 'full', note: 'oj-checkboxset per item (sends {_item, _done}) + oj-progress-bar' },
  ComparisonCard: { status: 'full', note: 'oj-panel: both values and the delta with its trend' },
  ProcessMonitor: { status: 'full', note: 'a row per process: systems, ok/warning/error badges, status, action' },
  Skeleton: { status: 'full', note: 'the shell skeleton bones (JET has no skeleton), text/card/grid/form × count' },
  Avatar: { status: 'full', note: 'oj-avatar' },
  AvatarGroup: { status: 'full', note: 'oj-avatar per person, +N beyond maxItemsVisible' },
  Icon: { status: 'full', note: 'the Redwood icon font (oj-ux-ico-*), an emoji as text' },
  Image: { status: 'full', note: 'JET has no image component: an <img>; relative sources are served by the backend' },
  Markdown: { status: 'full', note: 'formatted (headings, lists, quotes, code, tables, bold, italics, links, allowed inline HTML) as allowlist-sanitized HTML' },
  Map: { status: 'full', note: 'Leaflet + OSM tiles (JET has no street map): markers, fit, markerActionId' },
  Breadcrumbs: { status: 'full', note: 'a breadcrumb nav in the content (the shell keeps its own trail)' },
  Breadcrumb: { status: 'part', note: 'of Breadcrumbs' },
  Grid: { status: 'full', note: 'oj-table (list display): tree rows with disclosure, client-side paging by its size' },
  GridColumn: { status: 'part', note: 'of Grid / Crud' },
  VirtualList: { status: 'full', note: 'every item through the same projection (no windowing — neither has the neutral web renderer)' },
  MenuBar: { status: 'full', note: 'oj-buttons, links and oj-menu-buttons for submenus' },
  MessageList: { status: 'full', note: 'oj-avatar + name, time and text per message' },
  MessageInput: { status: 'full', note: 'oj-input-text + Send oj-button; Enter or Send sends {message}' },
  Chat: { status: 'full', note: 'an inline conversation streamed from its sseUrl (poc/chat.mjs); the app-level assistant is the shell panel' },
  Bpmn: { status: 'full', note: 'an SVG drawn from its BPMN-DI (or laid out by its flows): bpmn-js is not under a permissive licence' },
  Workflow: { status: 'partial', note: 'read only: the definition as a numbered flow of steps; the web designer edits it' },
  FormEditor: { status: 'partial', note: 'read only: the defined form previewed with the real field widgets; the web designer edits it' },
  Stepper: { status: 'full', note: 'a numbered step header per child, its content below' },
  Result: { status: 'full', note: 'oj-panel with the icon of its type, message, links and the what-next action' },
  Directory: { status: 'full', note: 'a column per group with its links (in-app routes navigate inside the shell)' },
  MicroFrontend: { status: 'full', note: 'loaded from its baseUrl into a surface of its own and painted in place; its actions go back to it' },
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
    `containers, ${count('partial')} partial, ${count('none')} not rendered. A type the renderer does not know`,
    `(one added to the wire later) shows a visible "Unsupported component" placeholder, like the web`,
    `renderers, and its children still render.`,
    '',
    '| Component | Redwood | How |',
    '|---|---|---|',
    ...rows,
  ].join('\n')
}
