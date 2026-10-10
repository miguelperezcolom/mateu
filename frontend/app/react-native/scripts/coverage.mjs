// What the React Native renderer does with each component type of the wire — the source of the
// «React Native component coverage» table in doc/src/content/docs/reference/parity.md (generated
// from here: node scripts/parity-check.mjs --write). parity-check.mjs fails CI when:
//   - a wire type (ComponentMetadataDto @JsonSubTypes) has no `case 'X'` in ComponentRenderer.tsx
//     — i.e. it would render as "Unsupported component";
//   - a wire type is not classified here, or this lists one the wire does not have;
//   - the generated section of parity.md does not match this table.
// status: full (✅ native widget) · partial (🟡 rendered, with a documented mobile adaptation or
// limit) · layout (✅ container: its children flow in the screen) · part (✅ piece of another
// component, also drawn on its own).
export const RN_COVERAGE = {
  // ── pages and structure ──
  App: { status: 'full', note: 'drawer / tabs shell (AppRenderer); nested App = own island at its home route' },
  Page: { status: 'full', note: 'header (title, subtitle, badges, KPIs, toolbar, banners), FABs' },
  Form: { status: 'full' },
  Crud: { status: 'full', note: 'table / list / cards / tree, smart-search panel, selection, totals, groups, inline edit, saved views' },
  Card: { status: 'full' },
  Details: { status: 'full', note: 'collapsible panel' },
  AccordionLayout: { status: 'full' },
  AccordionPanel: { status: 'part', note: 'of AccordionLayout' },
  TabLayout: { status: 'full' },
  Tab: { status: 'part', note: 'of TabLayout' },
  FoldoutLayout: { status: 'full', note: 'overview card + accordion of panels' },
  SplitLayout: { status: 'full' },
  MasterDetailLayout: { status: 'full', note: 'side by side ≥ 768 px, stacked on a phone' },
  HorizontalLayout: { status: 'layout' },
  VerticalLayout: { status: 'layout' },
  FormLayout: { status: 'layout' },
  FormRow: { status: 'layout' },
  FormItem: { status: 'layout' },
  FormSection: { status: 'full' },
  FormSubSection: { status: 'full' },
  Scroller: { status: 'layout' },
  FullWidth: { status: 'layout' },
  Container: { status: 'layout' },
  Div: { status: 'layout' },
  ContentLayout: { status: 'full', note: 'main / aside / footer; aside beside main ≥ 768 px, stacked on a phone' },
  ResponsiveGrid: { status: 'full', note: 'declared tracks + col spans; stacks below stackBelow (600 px default)' },
  BoardLayout: { status: 'layout' },
  BoardLayoutRow: { status: 'part', note: 'of BoardLayout (items side by side ≥ 768 px)' },
  BoardLayoutItem: { status: 'part', note: 'of BoardLayout' },
  CarouselLayout: { status: 'full', note: 'paging swipe, dots, prev/next, auto-advance, loop' },
  DashboardLayout: { status: 'full' },
  DashboardPanel: { status: 'full' },
  Scoreboard: { status: 'full' },
  HeroSection: { status: 'full' },
  Stepper: { status: 'full', note: 'children as numbered steps' },
  // ── fields and input ──
  FormField: { status: 'full', note: 'every stereotype, date picker, lookups, capture fields' },
  CustomField: { status: 'layout', note: 'its component in place' },
  Button: { status: 'full' },
  Anchor: { status: 'full', note: 'in-app route or OS browser' },
  Element: { status: 'partial', note: 'HTML tags map to native text / image / rule, on.click runs its action; custom elements (web components) show their text content' },
  CustomComponent: { status: 'partial', note: 'registry (registerCustomComponent) + visible placeholder' },
  MicroFrontend: { status: 'full', note: 'own island (own session when it has its own baseUrl)' },
  // ── overlays ──
  Dialog: { status: 'full', note: 'overlay fragments open as a modal sheet' },
  Drawer: { status: 'full', note: 'overlay fragments open as a modal sheet; a Drawer in the tree is drawn in place' },
  ConfirmDialog: { status: 'full' },
  ContextMenu: { status: 'partial', note: 'long-press (no right-click on touch) opens an action sheet' },
  Popover: { status: 'partial', note: 'opens on press (no hover on touch)' },
  Tooltip: { status: 'partial', note: 'long-press shows it (no hover on touch); also the accessibility hint' },
  Notification: { status: 'full', note: 'inline status strip' },
  CookieConsent: { status: 'full', note: 'dismissible banner, dismissal persisted on the device' },
  // ── navigation ──
  Breadcrumbs: { status: 'full' },
  Breadcrumb: { status: 'part', note: 'of Breadcrumbs' },
  MenuBar: { status: 'full', note: 'horizontal strip; submenus as an action sheet' },
  Directory: { status: 'full' },
  // ── display ──
  Text: { status: 'full' },
  Markdown: { status: 'full' },
  Image: { status: 'full' },
  Icon: { status: 'partial', note: 'emoji / glyphs and common icon names; other design-system icons show a dot' },
  Badge: { status: 'full' },
  Separator: { status: 'full' },
  Avatar: { status: 'full', note: 'image or initials' },
  AvatarGroup: { status: 'full', note: 'overlapping, +N overflow' },
  ProgressBar: { status: 'full' },
  ProgressSteps: { status: 'full', note: 'vertical by design' },
  Notice: { status: 'full' },
  BulletedList: { status: 'full' },
  EmptyState: { status: 'full' },
  Skeleton: { status: 'full' },
  NotFound: { status: 'full' },
  Result: { status: 'full', note: 'icon by result type, links, next step' },
  EntityHeader: { status: 'full' },
  Meter: { status: 'full' },
  TaskProgress: { status: 'full' },
  StatusList: { status: 'full' },
  TaskQueue: { status: 'full' },
  ResourceGrid: { status: 'full' },
  OfferCard: { status: 'full' },
  AddOnPicker: { status: 'full' },
  Ledger: { status: 'full' },
  PaymentPicker: { status: 'full' },
  ProcessMonitor: { status: 'full' },
  Stat: { status: 'full' },
  MetricCard: { status: 'full' },
  Chart: { status: 'full' },
  TrendChart: { status: 'full' },
  Gantt: { status: 'full' },
  Kanban: { status: 'full' },
  Timeline: { status: 'full' },
  Calendar: { status: 'full', note: 'month / week / day / list' },
  PricingTable: { status: 'full' },
  OrgChart: { status: 'full' },
  Heatmap: { status: 'full' },
  Funnel: { status: 'full' },
  FeatureGrid: { status: 'full' },
  Testimonials: { status: 'full' },
  Faq: { status: 'full' },
  CalloutCard: { status: 'full' },
  CommentThread: { status: 'full' },
  FileList: { status: 'full' },
  Checklist: { status: 'full' },
  ComparisonCard: { status: 'full' },
  ActionPanel: { status: 'full', note: 'modal; no keyboard shortcut' },
  MatrixGrid: { status: 'full' },
  PlanningBoard: { status: 'full', note: 'drag + select (PanResponder)' },
  DropZone: { status: 'partial', note: '"Move to…" picker (no drag on touch)' },
  Map: { status: 'full' },
  Grid: { status: 'full', note: 'horizontal-scroll table, tree rows indented, action cells' },
  GridColumn: { status: 'part', note: 'of Grid / Crud' },
  VirtualList: { status: 'full' },
  // ── messaging ──
  Chat: { status: 'full', note: 'opens the assistant panel (same contract as the app chat FAB)' },
  MessageList: { status: 'full' },
  MessageInput: { status: 'full' },
  // ── diagrams / editors ──
  Bpmn: { status: 'partial', note: 'read-only diagram (react-native-svg, from the BPMN DI section); edit on the web' },
  Workflow: { status: 'partial', note: 'read-only layered diagram; edit on the web' },
  FormEditor: { status: 'partial', note: 'read-only definition preview; edit on the web' },
};

const ICON = { full: '✅', layout: '✅ container', partial: '🟡', part: '✅ part' };

/** The markdown section (between the rn-coverage markers of parity.md). */
export function coverageTable(coverage = RN_COVERAGE) {
  const order = { full: 0, layout: 1, partial: 2, part: 3 };
  const rows = Object.entries(coverage).sort(([a, x], [b, y]) => order[x.status] - order[y.status] || a.localeCompare(b));
  const count = (s) => rows.filter(([, c]) => c.status === s).length;
  return [
    'Generated from `frontend/app/react-native/scripts/coverage.mjs` and checked in CI against the',
    "wire catalogue and the renderer's switch (`node scripts/parity-check.mjs`): every wire type has a",
    `native renderer — ${count('full')} rendered, ${count('layout')} layout containers, ${count('part')} parts of another component,`,
    `${count('partial')} with a documented mobile adaptation. None is dropped.`,
    '',
    '| Component | React Native | How |',
    '|---|---|---|',
    ...rows.map(([t, c]) => `| \`${t}\` | ${ICON[c.status]} | ${c.note ?? ''} |`),
  ].join('\n');
}
