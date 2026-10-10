// A tiny Mateu-wire fixture backend for VISUAL checks of the native renderers: it answers every
// POST /mateu/v3/sync/* with one page showing the component types the demos rarely use (grids,
// breadcrumbs, avatars, menus, layouts, outcome pages, diagrams…), in wire shape.
//
//   node scripts/wire-fixture-server.mjs [port=18600] [wireVersion=3.0]
//   EXPO_PUBLIC_MATEU_BACKEND_PORT=18600 CI=1 npx expo start --web --port 19081
//
// Not a test of the server — of the RENDERER: it is how the "every wire type renders" claim was
// looked at on expo web (e2e/rn-shot.mjs). Pass a different wireVersion to see the mismatch toast.
import { createServer } from 'node:http';

const port = Number(process.argv[2] ?? 18600);
const wireVersion = process.argv[3] ?? '3.0';

const cs = (metadata, children = [], extra = {}) => ({ type: 'ClientSide', metadata, id: extra.id ?? null, children, ...extra });
const text = (t) => cs({ type: 'Text', text: t });
const section = (title, ...children) => cs({ type: 'FormSection', title }, children);
const col = (id, label, more = {}) => cs({ type: 'GridColumn', id, label, ...more }, [], { id });

const BPMN = `<bpmn:definitions xmlns:bpmn="m" xmlns:bpmndi="d" xmlns:dc="c" xmlns:di="i"><bpmn:process id="p">
<bpmn:startEvent id="s" name="Order in"/><bpmn:userTask id="t" name="Approve"/><bpmn:exclusiveGateway id="g"/><bpmn:endEvent id="e" name="Done"/></bpmn:process>
<bpmndi:BPMNDiagram><bpmndi:BPMNPlane bpmnElement="p">
<bpmndi:BPMNShape bpmnElement="s"><dc:Bounds x="20" y="40" width="36" height="36"/></bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="t"><dc:Bounds x="100" y="18" width="100" height="80"/></bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="g"><dc:Bounds x="240" y="33" width="50" height="50"/></bpmndi:BPMNShape>
<bpmndi:BPMNShape bpmnElement="e"><dc:Bounds x="330" y="40" width="36" height="36"/></bpmndi:BPMNShape>
<bpmndi:BPMNEdge bpmnElement="f1"><di:waypoint x="56" y="58"/><di:waypoint x="100" y="58"/></bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="f2"><di:waypoint x="200" y="58"/><di:waypoint x="240" y="58"/></bpmndi:BPMNEdge>
<bpmndi:BPMNEdge bpmnElement="f3"><di:waypoint x="290" y="58"/><di:waypoint x="330" y="58"/></bpmndi:BPMNEdge>
</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`;

const WORKFLOW = JSON.stringify({
  name: 'Onboarding',
  steps: [
    { id: 'a', type: 'ACTION', name: 'Create account' },
    { id: 'b', type: 'USER_TASK', name: 'Verify identity', preconditionStepId: 'a' },
    { id: 'c', type: 'ACTION', name: 'Welcome mail', preconditionStepId: 'a' },
    { id: 'd', type: 'END', name: 'Done', preconditionStepId: 'b' },
  ],
});

const menu = [
  { label: 'File', submenus: [{ label: 'New', actionId: 'new' }, { label: 'Open recent', submenus: [{ label: 'report.pdf', actionId: 'open' }] }] },
  { label: 'Edit', actionId: 'edit' },
  { separator: true },
  { label: 'Help', route: '/help' },
];

const content = [
  section('Breadcrumbs, avatars, icons',
    cs({ type: 'Breadcrumbs', currentItemText: 'Order 42', breadcrumbs: [{ text: 'Home', link: '/' }, { text: 'Orders', link: '/orders' }] }),
    cs({ type: 'HorizontalLayout' }, [
      cs({ type: 'Avatar', name: 'Ada Lovelace' }),
      cs({ type: 'AvatarGroup', maxItemsVisible: 3, avatars: [{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { name: 'Grace Hopper' }, { name: 'Linus T' }, { name: 'Barbara Liskov' }] }),
      cs({ type: 'Icon', icon: 'vaadin:calendar' }),
      cs({ type: 'Icon', icon: '🚀' }),
    ]),
    cs({ type: 'Breadcrumb', text: 'A lone breadcrumb', link: '/x' }),
  ),
  section('Menus',
    cs({ type: 'MenuBar', options: menu }),
    cs({ type: 'ContextMenu', activateOnLeftClick: false, menu, wrapped: text('Long-press me for a context menu') }),
    cs({ type: 'Tooltip', text: 'Shown on long-press', wrapped: text('Long-press me for a tooltip') }),
    cs({ type: 'Directory', menu: [{ label: 'Sales', submenus: [{ label: 'Orders', route: '/orders' }, { label: 'Invoices', route: '/invoices' }] }, { label: 'Settings', route: '/settings' }] }),
  ),
  section('Grid and lists',
    cs({ type: 'Grid', tree: true, content: [col('name', 'Name'), col('qty', 'Qty', { align: 'end' }), col('open', 'Open', { actionId: 'openRow' })],
      page: { content: [{ name: 'Fruit', qty: 3, open: 'view', children: [{ name: 'Apple', qty: 1, open: 'view' }, { name: 'Pear', qty: 2, open: 'view' }] }, { name: 'Bread', qty: 7, open: 'view' }], totalElements: 2 } }, [], { id: 'grid1' }),
    cs({ type: 'VirtualList', page: { content: [text('Virtual item 1'), text('Virtual item 2')], totalElements: 2 } }),
    cs({ type: 'Details', opened: true, summary: text('Details (tap to collapse)'), content: text('Hidden content of the details') }),
  ),
  section('Layouts',
    cs({ type: 'MasterDetailLayout' }, [text('Master list'), text('Detail pane')]),
    cs({ type: 'CarouselLayout', dots: true, nav: true, loop: true, auto: false, duration: 4000, selected: 0 }, [
      cs({ type: 'Card', title: 'Slide 1' }, [text('First slide')]),
      cs({ type: 'Card', title: 'Slide 2' }, [text('Second slide')]),
    ]),
    cs({ type: 'ContentLayout', asidePosition: 'end', asideWidth: '30%', asideSticky: true }, [
      cs({ type: 'Text', text: 'Main column' }, [], { slot: 'main-0' }),
      cs({ type: 'Text', text: 'Aside column' }, [], { slot: 'aside-0' }),
      cs({ type: 'Text', text: 'Footer' }, [], { slot: 'footer-0' }),
    ]),
    cs({ type: 'ResponsiveGrid', gridTemplateColumns: 'repeat(3, 1fr)', colSpans: [2, 1, 3] }, [text('Cell A (span 2)'), text('Cell B'), text('Cell C (span 3)')]),
    cs({ type: 'BoardLayout', rows: [] }, [cs({ type: 'BoardLayoutRow' }, [cs({ type: 'BoardLayoutItem', boardCols: 2 }, [text('Board item 2 cols')]), cs({ type: 'BoardLayoutItem', boardCols: 1 }, [text('Board item 1 col')])])]),
    cs({ type: 'FormItem' }, [text('Inside a FormItem')]),
    cs({ type: 'Stepper' }, [text('Pick a plan'), text('Pay'), text('Done')]),
    cs({ type: 'Tab', label: 'A lone tab' }, [text('Tab content')]),
    cs({ type: 'AccordionPanel', label: 'A lone panel' }, [text('Panel content')]),
  ),
  section('Messaging',
    cs({ type: 'MessageList', items: [{ text: 'Hi! The order is ready.', userName: 'Ada Lovelace', time: '10:02' }, { text: 'Great, thanks', userName: 'Alan Turing', time: '10:03', userColorIndex: 3 }] }),
    cs({ type: 'MessageInput', actionId: 'send' }),
    cs({ type: 'Chat', sseUrl: '/chat' }),
  ),
  section('Outcomes and notices',
    cs({ type: 'Result', title: 'Payment accepted', resultType: 'Success', message: 'We sent the receipt by mail.', interestingLinks: [{ type: 'Url', value: '/orders', description: 'See your orders' }], nowTo: { type: 'View', value: '/', description: 'Back home' } }),
    cs({ type: 'NotFound', title: 'Booking FO-X6 not found', message: 'It may have been cancelled.', backRoute: '/', backLabel: 'Back to bookings' }),
    cs({ type: 'Notification', title: 'Heads up', text: 'Maintenance tonight at 22:00' }),
    cs({ type: 'CookieConsent', cookieName: 'demo-consent', message: 'We use cookies to remember your preferences.', learnMore: 'Learn more', learnMoreLink: 'https://example.com', dismiss: 'OK', position: 'Bottom' }),
    cs({ type: 'Drawer', headerTitle: 'An in-place drawer', subtitle: 'rendered in the tree', content: text('Drawer content') }),
  ),
  section('Elements and nested app',
    cs({ type: 'Element', name: 'h3', attributes: {}, on: {}, content: 'An <h3> element', html: false }),
    cs({ type: 'Element', name: 'p', attributes: {}, on: { click: 'clicked' }, content: '<b>HTML</b> paragraph, tap me', html: true }),
    cs({ type: 'Element', name: 'my-web-widget', attributes: {}, on: {}, content: 'Custom element fallback text', html: false }),
  ),
  section('Diagrams (read-only)',
    cs({ type: 'Bpmn', xml: BPMN }),
    cs({ type: 'Workflow', value: WORKFLOW }),
    cs({ type: 'FormEditor', value: JSON.stringify({ name: 'Signup form', fields: [{ id: 'email', label: 'Email', dataType: 'string', stereotype: 'email', required: true }, { id: 'age', label: 'Age', dataType: 'integer' }] }) }),
  ),
];

const page = cs({ type: 'Page', title: 'Wire coverage', subtitle: 'Every remaining wire type, natively', badges: [], kpis: [], banners: [], toolbar: [], buttons: [], header: [], footer: [], fabs: [] }, content);

const increment = () => ({
  commands: [{ targetComponentId: 'ux_main', type: 'SetWindowTitle', data: 'Wire coverage' }],
  messages: [],
  fragments: [{ targetComponentId: 'ux_main', component: { type: 'ServerSide', id: 'fx', serverSideType: 'fixture.WireCoverage', route: '', children: [page], actions: [] }, state: {}, data: {} }],
  wireVersion,
});

createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors).end();
    return;
  }
  let body = '';
  req.on('data', (d) => (body += d));
  req.on('end', () => {
    const auth = req.headers['authorization'] ?? '-';
    console.log(`${req.method} ${req.url} session=${req.headers['x-session-id'] ?? '-'} auth=${auth === '-' ? '-' : 'Bearer …'}`);
    const action = (() => {
      try {
        return JSON.parse(body || '{}').actionId ?? '';
      } catch {
        return '';
      }
    })();
    const payload = action
      ? { commands: [], fragments: [], messages: [{ variant: 'info', text: `Action "${action}" reached the server`, title: null }], wireVersion }
      : increment();
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }).end(JSON.stringify(payload));
  });
}).listen(port, () => console.log(`wire fixture on :${port} (wireVersion ${wireVersion})`));
