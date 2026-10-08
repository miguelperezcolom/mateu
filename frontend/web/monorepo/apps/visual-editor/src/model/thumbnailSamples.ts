import { ComponentSpec, createNode } from './componentSchema'
import type { PageNode } from './pageModel'

/**
 * What a palette thumbnail shows for each component: a sample filled in enough to be RECOGNISABLE
 * (a grid with rows, tabs with a couple of tabs, a chart with data), where the palette's freshly
 * dropped node would be an empty box. Anything not listed falls back to that dropped node.
 *
 * `scripts/thumbnails.mjs` renders these with the editor's own canvas and saves what it paints, so a
 * thumbnail is the real component, never a drawing. Keep the samples SMALL: a thumbnail is a glance.
 */
/** A raw authored node: single-content slots (a Card's `content`) hold ONE node, which PageNode cannot say. */
type Sample = { type: string; [prop: string]: unknown }

const text = (t: string, extra: Record<string, unknown> = {}): Sample => ({ type: 'Text', text: t, ...extra })
const field = (id: string, label: string, extra: Record<string, unknown> = {}): Sample =>
    ({ type: 'FormField', id, label, dataType: 'string', ...extra })
const button = (label: string, extra: Record<string, unknown> = {}): Sample => ({ type: 'Button', label, actionId: 'go', ...extra })
const card = (title: string, body: string): Sample =>
    ({ type: 'Card', title: text(title), content: text(body), variants: ['outlined'] })
const metric = (title: string, value: string, trend = 'up', trendLabel = '+12%'): Sample =>
    ({ type: 'MetricCard', title, value, trend, trendLabel })

const ORDERS = [
    { ref: 'SO-1024', customer: 'Acme Corp', status: 'Shipped', total: '1,240.00' },
    { ref: 'SO-1025', customer: 'Globex', status: 'Pending', total: '310.50' },
    { ref: 'SO-1026', customer: 'Initech', status: 'Paid', total: '89.90' },
]
const ORDER_COLUMNS: Sample[] = [
    { type: 'GridColumn', id: 'ref', label: 'Order' },
    { type: 'GridColumn', id: 'customer', label: 'Customer' },
    { type: 'GridColumn', id: 'status', label: 'Status' },
    { type: 'GridColumn', id: 'total', label: 'Total', align: 'end' },
]

const SAMPLES: Record<string, Sample> = {
    // --- layout ---
    AccordionLayout: { type: 'AccordionLayout', panels: [
        { type: 'AccordionPanel', label: 'Shipping', active: true, content: text('Delivered in 2–3 working days.') },
        { type: 'AccordionPanel', label: 'Returns', content: text('30 days.') },
        { type: 'AccordionPanel', label: 'Warranty', content: text('2 years.') },
    ] },
    AccordionPanel: { type: 'AccordionPanel', label: 'Shipping', active: true, content: text('Delivered in 2–3 working days.') },
    BoardLayout: { type: 'BoardLayout', rows: [{ type: 'BoardLayoutRow', content: [metric('Revenue', '€48k'), metric('Orders', '312'), metric('Churn', '2.1%', 'down', '-0.4%')] }] },
    BoardLayoutRow: { type: 'BoardLayoutRow', content: [metric('Revenue', '€48k'), metric('Orders', '312')] },
    BoardLayoutItem: { type: 'BoardLayoutItem', content: metric('Revenue', '€48k') },
    Card: { type: 'Card', title: text('Acme Corp'), subtitle: text('Customer since 2019'), content: text('Key account · 12 open orders'), variants: ['outlined'] },
    CarouselLayout: { type: 'CarouselLayout', dots: true, nav: true, content: [card('Slide 1', 'Spring collection'), card('Slide 2', 'Summer sale')] },
    Container: { type: 'Container', content: card('Container', 'Any content') },
    ContentLayout: { type: 'ContentLayout', main: [card('Main', 'The page content')], aside: [card('Aside', 'Related info')] },
    DashboardLayout: { type: 'DashboardLayout', columns: 2, items: [
        { type: 'DashboardPanel', title: 'Revenue', content: metric('This month', '€48k') },
        { type: 'DashboardPanel', title: 'Orders', content: metric('This month', '312') },
    ] },
    DashboardPanel: { type: 'DashboardPanel', title: 'Revenue', subtitle: 'This month', content: metric('Total', '€48k') },
    Details: { type: 'Details', opened: true, summary: text('More details'), content: text('Shown when expanded.') },
    Div: { type: 'Div', children: [text('A plain container')] },
    FoldoutLayout: { type: 'FoldoutLayout', headerTitle: 'Booking 4711', overview: card('Overview', '2 guests · 3 nights'),
        panels: [{ type: 'FoldoutPanel', title: 'Payments', open: true, content: text('Paid €420') }, { type: 'FoldoutPanel', title: 'Notes', open: false, content: text('—') }] },
    FoldoutPanel: { type: 'FoldoutPanel', title: 'Payments', open: true, content: text('Paid €420') },
    FormLayout: { type: 'FormLayout', content: [field('name', 'Name'), field('email', 'Email', { stereotype: 'email' }), field('phone', 'Phone'), field('city', 'City')] },
    FormRow: { type: 'FormRow', content: [field('first', 'First name'), field('last', 'Last name')] },
    FormItem: { type: 'FormItem', content: [field('name', 'Name')] },
    FormSection: { type: 'FormSection', title: 'Contact', content: [field('email', 'Email'), field('phone', 'Phone')] },
    FormSubSection: { type: 'FormSubSection', title: 'Address', content: [field('street', 'Street'), field('city', 'City')] },
    Form: { type: 'Form', title: 'New customer', content: [field('name', 'Name'), field('email', 'Email')], buttons: [button('Save', { buttonStyle: 'primary' })] },
    FullWidth: { type: 'FullWidth', content: card('Full width', 'Spans the whole page') },
    HeroSection: { type: 'HeroSection', title: 'Find your next stay', subtitle: '1,200 hotels, one search', centered: true, height: '12rem' },
    HorizontalLayout: { type: 'HorizontalLayout', spacing: true, content: [card('Left', 'One'), card('Middle', 'Two'), card('Right', 'Three')] },
    VerticalLayout: { type: 'VerticalLayout', spacing: true, content: [card('Top', 'One'), card('Bottom', 'Two')] },
    MasterDetailLayout: { type: 'MasterDetailLayout', master: card('Orders', 'SO-1024 · SO-1025 · SO-1026'), detail: card('SO-1024', 'Acme Corp · €1,240') },
    SplitLayout: { type: 'SplitLayout', master: card('List', 'Pick an item'), detail: card('Detail', 'The selected item') },
    ResponsiveGrid: { type: 'ResponsiveGrid', gap: '1rem', columns: [{ size: 'fill' }, { size: 'fill' }], content: [card('One', 'A'), card('Two', 'B')] },
    Scroller: { type: 'Scroller', content: text('Scrollable content') },
    TabLayout: { type: 'TabLayout', tabs: [
        { type: 'Tab', label: 'General', active: true, content: text('General settings') },
        { type: 'Tab', label: 'Billing', content: text('Billing') },
        { type: 'Tab', label: 'Users', content: text('Users') },
    ] },
    Tab: { type: 'Tab', label: 'General', active: true, content: text('General settings') },

    // --- form ---
    FormField: field('email', 'Email', { stereotype: 'email', placeholder: 'name@example.com' }),
    CustomField: { type: 'CustomField', label: 'Period', content: { type: 'HorizontalLayout', spacing: true, content: [field('from', 'From', { dataType: 'date' }), field('to', 'To', { dataType: 'date' })] } },
    MessageInput: { type: 'MessageInput', actionId: 'send' },

    // --- display ---
    Anchor: { type: 'Anchor', text: 'Open the documentation', url: 'https://mateu.io' },
    Avatar: { type: 'Avatar', name: 'Ada Lovelace', abbreviation: 'AL' },
    AvatarGroup: { type: 'AvatarGroup', avatars: [{ type: 'Avatar', name: 'Ada Lovelace' }, { type: 'Avatar', name: 'Alan Turing' }, { type: 'Avatar', name: 'Grace Hopper' }] },
    Badge: { type: 'Badge', text: 'Confirmed', color: 'success' },
    Breadcrumbs: { type: 'Breadcrumbs', breadcrumbs: [{ text: 'Home', link: '/' }, { text: 'Orders', link: '/orders' }], currentItemText: 'SO-1024' },
    BulletedList: { type: 'BulletedList', items: ['Late check-out', 'Sea view', 'Extra pillow'] },
    Calendar: { type: 'Calendar', month: '2026-10-01', events: [
        { id: '1', title: 'Team meeting', date: '2026-10-06' }, { id: '2', title: 'Release', date: '2026-10-14', color: '#16a34a' }, { id: '3', title: 'Audit', date: '2026-10-22', color: '#dc2626' },
    ] },
    CalloutCard: { type: 'CalloutCard', title: 'Complete your profile', description: 'Two steps left to unlock invoicing.', ctaLabel: 'Continue', actionId: 'go', icon: '✨' },
    Chart: { type: 'Chart', chartType: 'bar', chartData: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Sales', data: [12, 19, 8, 15, 22] }] } },
    Checklist: { type: 'Checklist', title: 'Onboarding', items: [
        { id: '1', label: 'Create account', done: true }, { id: '2', label: 'Verify email', done: true }, { id: '3', label: 'Add payment method', done: false },
    ] },
    CommentThread: { type: 'CommentThread', comments: [
        { id: '1', author: 'Ada', text: 'Can we ship this on Friday?', timestamp: '2h ago', replies: [{ id: '2', author: 'Alan', text: 'Yes, QA is done.', timestamp: '1h ago' }] },
    ] },
    ComparisonCard: { type: 'ComparisonCard', title: 'Revenue', leftLabel: 'Last year', leftValue: '€410k', rightLabel: 'This year', rightValue: '€486k', delta: '+18%', trend: 'up' },
    EmptyState: { type: 'EmptyState', icon: '📭', title: 'No orders yet', description: 'Orders you receive will show up here.', actionLabel: 'Create order', actionId: 'go' },
    EntityHeader: { type: 'EntityHeader', title: 'Acme Corp', subtitle: 'Key account · Madrid', badges: [{ label: 'Active', color: 'success' }],
        facts: [{ label: 'Owner', value: 'Ada' }, { label: 'Since', value: '2019' }], metricLabel: 'Balance', metricValue: '€12,400' },
    Faq: { type: 'Faq', items: [{ question: 'Can I cancel anytime?', answer: 'Yes, with no fees.', open: true }, { question: 'Do you offer refunds?', answer: 'Within 30 days.' }] },
    FeatureGrid: { type: 'FeatureGrid', columns: 3, features: [
        { icon: '⚡', title: 'Fast', description: 'Sub-second pages' }, { icon: '🔒', title: 'Secure', description: 'SSO and audit' }, { icon: '🌍', title: 'Global', description: '12 regions' },
    ] },
    FileList: { type: 'FileList', files: [{ name: 'contract.pdf', size: '240 KB', type: 'pdf' }, { name: 'invoice-1024.pdf', size: '88 KB', type: 'pdf' }] },
    Funnel: { type: 'Funnel', stages: [{ label: 'Visits', value: 1200 }, { label: 'Sign-ups', value: 420 }, { label: 'Trials', value: 160 }, { label: 'Paid', value: 48 }] },
    Gantt: { type: 'Gantt', tasks: [
        { id: '1', title: 'Design', start: '2026-10-01', end: '2026-10-10', progress: 100 },
        { id: '2', title: 'Build', start: '2026-10-08', end: '2026-10-28', progress: 45 },
        { id: '3', title: 'Launch', start: '2026-10-27', end: '2026-11-05', progress: 0 },
    ] },
    Heatmap: { type: 'Heatmap', cells: Array.from({ length: 35 }, (_, i) => ({ date: `2026-09-${String((i % 30) + 1).padStart(2, '0')}`, value: (i * 7) % 10 })) },
    Icon: { type: 'Icon', icon: 'Airplane' },
    Image: { type: 'Image', src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" rx="8" fill="#dbe7fb"/><path d="M30 95 80 45l35 35 25-20 50 35z" fill="#7aa2e3"/><circle cx="175" cy="38" r="14" fill="#f6c453"/></svg>') },
    KPI: { type: 'KPI', title: 'Occupancy', text: '87%' },
    Kanban: { type: 'Kanban', columns: [
        { id: 'todo', title: 'To do', cards: [{ id: '1', title: 'Write specs' }, { id: '2', title: 'Book venue' }] },
        { id: 'doing', title: 'Doing', cards: [{ id: '3', title: 'Build API', badge: 'API' }] },
        { id: 'done', title: 'Done', cards: [{ id: '4', title: 'Kick-off' }] },
    ] },
    Ledger: { type: 'Ledger', currency: 'EUR', totalLabel: 'Total', total: 470, lines: [{ concept: 'Room · 3 nights', amount: 390 }, { concept: 'Breakfast', amount: 60 }, { concept: 'City tax', amount: 20 }] },
    Markdown: { type: 'Markdown', markdown: '### Release notes\n- **Faster** search\n- New *export* button' },
    MessageList: { type: 'MessageList', items: [
        { text: 'Is room 204 ready?', userName: 'Front desk', time: '10:02', userColorIndex: 1 },
        { text: 'Yes, cleaned at 9:40.', userName: 'Housekeeping', time: '10:03', userColorIndex: 3 },
    ] },
    Meter: { type: 'Meter', label: 'Storage', value: 72, max: 100, unit: '%', caption: '72 of 100 GB', warnAt: 70, dangerAt: 90 },
    MetricCard: metric('Revenue', '€48,210'),
    Notice: { type: 'Notice', text: '2 complaints pending', theme: 'warning', actionLabel: 'Review', actionId: 'go' },
    NotFound: { type: 'NotFound', title: 'Page not found', message: 'The page you asked for does not exist.', backRoute: '/', backLabel: 'Go home' },
    OfferCard: { type: 'OfferCard', tag: 'Best value', title: 'Premium room', subtitle: 'Sea view · 32 m²', features: ['Breakfast', 'Late check-out'], priceLabel: '€180 / night', actionLabel: 'Upgrade', actionId: 'go' },
    OrgChart: { type: 'OrgChart', root: { id: '1', title: 'Ada', subtitle: 'CEO', children: [{ id: '2', title: 'Alan', subtitle: 'CTO' }, { id: '3', title: 'Grace', subtitle: 'COO' }] } },
    PlanningBoard: { type: 'PlanningBoard', from: '2026-10-05', to: '2026-10-11',
        resources: [{ id: '101', label: 'Room 101' }, { id: '102', label: 'Room 102' }, { id: '103', label: 'Room 103' }],
        blocks: [{ id: 'a', resourceId: '101', start: '2026-10-05', end: '2026-10-08', label: 'Smith' }, { id: 'b', resourceId: '103', start: '2026-10-07', end: '2026-10-10', label: 'Garcia', color: '#16a34a' }] },
    PricingTable: { type: 'PricingTable', plans: [
        { id: 'free', name: 'Free', price: '€0', period: '/mo', features: ['1 project'], ctaLabel: 'Start' },
        { id: 'pro', name: 'Pro', price: '€29', period: '/mo', featured: true, features: ['Unlimited projects', 'SSO'], ctaLabel: 'Buy' },
    ] },
    ProcessMonitor: { type: 'ProcessMonitor', items: [
        { id: '1', name: 'Nightly import', systems: ['ERP'], ok: 1200, warnings: 3, errors: 0, status: 'ok' },
        { id: '2', name: 'Invoice sync', systems: ['Billing'], ok: 310, warnings: 0, errors: 4, status: 'error' },
    ] },
    ProgressBar: { type: 'ProgressBar', value: 0.62, min: 0, max: 1, text: 'Importing… 62%' },
    ProgressSteps: { type: 'ProgressSteps', steps: [
        { id: '1', title: 'Cart', status: 'done' }, { id: '2', title: 'Shipping', status: 'current' }, { id: '3', title: 'Payment', status: 'upcoming' },
    ] },
    ResourceGrid: { type: 'ResourceGrid', columns: 3, items: [
        { id: '101', title: 'Room 101', subtitle: 'Double', statusLabel: 'Clean', statusColor: 'success' },
        { id: '102', title: 'Room 102', subtitle: 'Single', statusLabel: 'Dirty', statusColor: 'error', recommended: true },
        { id: '103', title: 'Room 103', subtitle: 'Suite', statusLabel: 'Clean', statusColor: 'success' },
    ] },
    Scoreboard: { type: 'Scoreboard', metrics: [metric('Revenue', '€48k'), metric('Orders', '312'), metric('Returns', '1.8%', 'down', '-0.3%')] },
    // A lone 1px rule is invisible in a column layout (and unrecognisable): picture it between two lines.
    Separator: { type: 'VerticalLayout', horizontalAlignment: 'STRETCH', content: [text('Contact details'), { type: 'Separator' }, text('Billing details')] },
    Skeleton: { type: 'Skeleton', variant: 'card', count: 2 },
    Stat: { type: 'Stat', label: 'Active users', value: '1,284', delta: '+6%', trend: 'up', spark: [3, 5, 4, 6, 8, 7, 9] },
    StatusList: { type: 'StatusList', items: [
        { id: '1', title: 'Passport', description: 'Verified', status: 'Done', statusColor: 'success' },
        { id: '2', title: 'Credit card', description: 'Pending authorisation', status: 'Pending', statusColor: 'warning' },
    ] },
    TaskProgress: { type: 'TaskProgress', label: 'Check-ins today', total: 24, done: 15, actionLabel: 'Open queue', actionId: 'go' },
    TaskQueue: { type: 'TaskQueue', actionId: 'go', groups: [
        { label: 'Today (2)', items: [{ id: '1', title: 'Smith, J.', caption: 'Room 204 · 3 nights', badges: [{ label: 'VIP', color: 'warning' }] }, { id: '2', title: 'Garcia, M.', caption: 'Room 118 · 1 night' }] },
    ] },
    Testimonials: { type: 'Testimonials', items: [{ quote: 'We shipped our back office in two weeks.', author: 'Ada L.', role: 'CTO, Acme', rating: 5 }] },
    Text: text('Heading text', { container: 'h3' }),
    Timeline: { type: 'Timeline', items: [
        { id: '1', title: 'Order placed', timestamp: '09:12' }, { id: '2', title: 'Paid', timestamp: '09:14' }, { id: '3', title: 'Shipped', timestamp: '15:40' },
    ] },
    TrendChart: { type: 'TrendChart', title: 'Bookings', values: [12, 18, 15, 22, 28, 25, 31], labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], area: true },

    // --- actions ---
    Button: button('Save', { buttonStyle: 'primary' }),
    // A ButtonGroup only lives in a form's toolbar or buttons, so it is pictured there.
    ButtonGroup: { type: 'Form', title: 'Order SO-1024', toolbar: [{ type: 'ButtonGroup', label: 'Actions', buttons: [button('Print'), button('Duplicate'), button('Cancel order')] }] },
    MenuBar: { type: 'MenuBar', options: [
        { type: 'RouteLink', label: 'File', route: 'file' }, { type: 'RouteLink', label: 'Edit', route: 'edit' }, { type: 'RouteLink', label: 'View', route: 'view' },
    ] },
    AddOnPicker: { type: 'AddOnPicker', totalLabel: 'Extras', currency: 'EUR', actionId: 'go', items: [
        { id: 'bk', icon: '☕', title: 'Breakfast', description: 'Buffet', price: 15, unit: '/day' },
        { id: 'pk', icon: '🅿️', title: 'Parking', description: 'Covered', price: 20, unit: '/day', added: true },
    ] },
    PaymentPicker: { type: 'PaymentPicker', actionId: 'go', contextLabel: 'To pay', contextValue: '€470.00', confirmLabel: 'Pay',
        methods: [{ id: 'card', label: 'Card' }, { id: 'cash', label: 'Cash' }, { id: 'transfer', label: 'Transfer' }], selected: 'card' },

    // --- overlays and wrappers ---
    Dialog: { type: 'Dialog', headerTitle: 'Delete order?', content: text('SO-1024 will be deleted. This cannot be undone.'), footer: button('Delete', { buttonStyle: 'primary', color: 'error' }) },
    ConfirmDialog: { type: 'ConfirmDialog', header: 'Discard changes?', content: text('Your edits will be lost.'), confirmText: 'Discard', canCancel: true },
    Drawer: { type: 'Drawer', headerTitle: 'Edit contact', content: { type: 'FormLayout', content: [field('name', 'Name'), field('email', 'Email')] }, width: '22rem' },
    Tooltip: { type: 'Tooltip', text: 'Saves the order', wrapped: button('Save') },
    Popover: { type: 'Popover', wrapped: button('Details'), content: text('More about this order') },
    ContextMenu: { type: 'ContextMenu', wrapped: card('Right-click me', 'A context menu'), menu: [{ type: 'RouteLink', label: 'Open', route: 'open' }] },

    // --- data ---
    Grid: { type: 'Grid', content: ORDER_COLUMNS, page: { pageSize: 10, pageNumber: 0, totalElements: 3, content: ORDERS } },
    Listing: { type: 'Listing', title: 'Orders', searchable: true, columns: ORDER_COLUMNS },
}

// A part that only renders inside its parent (a column outside a grid answers "Unknown metadata
// type") is pictured as the parent it belongs to.
Object.assign(SAMPLES, {
    AccordionPanel: SAMPLES.AccordionLayout,
    BoardLayoutItem: SAMPLES.BoardLayout,
    BoardLayoutRow: SAMPLES.BoardLayout,
    DashboardPanel: SAMPLES.DashboardLayout,
    FoldoutPanel: SAMPLES.FoldoutLayout,
    FormItem: SAMPLES.FormLayout,
    FormRow: { type: 'FormLayout', content: [SAMPLES.FormRow] },
    GridColumn: SAMPLES.Grid,
    GridGroupColumn: SAMPLES.Grid,
    Tab: SAMPLES.TabLayout,
})

/**
 * Components with no thumbnail, and why. They are wiring rather than something on screen, or they
 * need a context a lone sample cannot give. `thumbnails.test.ts` holds every other component to
 * having one, so a new component either gets pictured or gets listed here — on purpose.
 */
export const NO_THUMBNAIL: Readonly<Record<string, string>> = {
    AutoSaveTrigger: 'a trigger, nothing on screen',
    OnCustomEventTrigger: 'a trigger, nothing on screen',
    OnErrorTrigger: 'a trigger, nothing on screen',
    OnLoadTrigger: 'a trigger, nothing on screen',
    OnSuccessTrigger: 'a trigger, nothing on screen',
    OnValueChangeTrigger: 'a trigger, nothing on screen',
    ContentLink: 'a menu entry, pictured by the app shell',
    FieldLink: 'a menu entry, pictured by the app shell',
    MethodLink: 'a menu entry, pictured by the app shell',
    RouteLink: 'a menu entry, pictured by the app shell',
    RuleLink: 'a menu entry, pictured by the app shell',
    RemoteMenu: 'a menu entry, pictured by the app shell',
    Menu: 'a menu entry, pictured by the app shell',
    MenuSeparator: 'a menu entry, pictured by the app shell',
    Directory: 'a menu entry, pictured by the app shell',
    AppShell: 'the whole app chrome; it needs a running app behind it',
    MicroFrontend: 'another app embedded at runtime',
    EmbeddedView: 'a server view embedded at runtime',
    ComponentRef: 'whatever the referenced component is',
    Partial: 'whatever the referenced partial holds',
    CustomComponent: 'a renderer-registered component, unknown to the catalog',
    Element: 'a raw HTML element, whatever it is told to be',
    Slotted: 'a slot wrapper, pictured by its content',
    Bpmn: 'needs a BPMN diagram to show anything',
    KPI: 'the Vaadin renderer only paints KPIs in the page header, not as a component',
    VirtualList: 'its rows come from a running listing',
    CookieConsent: 'a site-wide banner the app raises at runtime',
    Notification: 'a toast the app raises at runtime; nothing stays on the page',
}

export function thumbnailSample(spec: ComponentSpec): PageNode {
    const sample = SAMPLES[spec.name]
    return sample ? (structuredClone(sample) as PageNode) : createNode(spec)
}

/** The components with a hand-written sample (the rest render as freshly dropped). */
export const SAMPLED_TYPES: ReadonlySet<string> = new Set(Object.keys(SAMPLES))
