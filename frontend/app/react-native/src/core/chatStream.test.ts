import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAT_TEXTS,
  ChatAnswer,
  ChatProgress,
  ChatTurn,
  SseParser,
  applyChatEvent,
  chatLinkNavigation,
  chatNavigationOf,
  inAppRouteOf,
  menuNavigationOf,
  chatRequestBody,
  classifyChatPayload,
  firstComponentFragment,
  isEmptyUsage,
  menuContextOf,
  previewActionOf,
  previewOverlayOf,
  projectScreen,
  renderScreenRequestOf,
  resolveChatUrl,
  uploadedFiles,
  usageLine,
  type ChatEventHooks,
  type ChatUiEvent,
} from './chatStream.ts';

const sse = (...events: string[]) => events.map((e) => `data: ${e}\n\n`).join('');

// ── SSE parsing ──

test('an event is its data lines joined with newlines; one space after data: is dropped, indentation kept', () => {
  const p = new SseParser();
  assert.deepEqual(p.push('data: # Title\ndata:\ndata:   - indented\n\n'), ['# Title\n\n  - indented']);
});

test('comments and other fields are ignored, CRLF and CR end lines', () => {
  const p = new SseParser();
  assert.deepEqual(p.push(':keep-alive\r\nevent: x\r\nid: 1\r\ndata: a\r\n\r\ndata: b\r\rdata\n\n'), ['a', 'b', '']);
});

test('chunks split anywhere, including a CR from its LF, make the same events', () => {
  const p = new SseParser();
  const out = [...p.push('da'), ...p.push('ta: hel'), ...p.push('lo\r'), ...p.push('\n\r'), ...p.push('\ndata: x')];
  assert.deepEqual(out, ['hello']);
  assert.deepEqual(p.end(), ['x']);
  assert.deepEqual(new SseParser().end(), []);
});

// ── classification ──

test('payloads are classified in contract order', () => {
  assert.deepEqual(classifyChatPayload('{"inputTokens":1,"event":"x"}'), { kind: 'usage', usage: { inputTokens: 1, event: 'x' } });
  assert.deepEqual(classifyChatPayload('{"event":"agent-delta","detail":{"text":"Hi"}}'), { kind: 'delta', text: 'Hi' });
  assert.deepEqual(classifyChatPayload('{"event":"agent-delta"}'), { kind: 'delta', text: '' });
  assert.equal(classifyChatPayload('{"event":"agent-status","detail":{"phase":"p"}}').kind, 'status');
  assert.equal(classifyChatPayload('{"event":"agent-tool","detail":{"name":"t"}}').kind, 'tool');
  assert.deepEqual(classifyChatPayload('{"event":"agent-error","detail":{"message":"boom"}}'), { kind: 'error', message: 'boom' });
  assert.deepEqual(classifyChatPayload('{"event":"agent-error"}'), { kind: 'error', message: CHAT_TEXTS.agentError });
  assert.deepEqual(classifyChatPayload('{"event":"close-requested"}'), { kind: 'event', event: 'close-requested', detail: {} });
  assert.deepEqual(classifyChatPayload('{"event":"x","detail":{"a":1}}'), { kind: 'event', event: 'x', detail: { a: 1 } });
});

test('text that starts with { but is no event/usage object is answer text', () => {
  for (const t of ['{not json', '{"a":1}', '[1,2]', '{"event":3}', 'plain']) {
    assert.deepEqual(classifyChatPayload(t), { kind: 'text', text: t });
  }
});

test('all-zero usage is a placeholder', () => {
  assert.equal(isEmptyUsage(null), true);
  assert.equal(isEmptyUsage({}), true);
  assert.equal(isEmptyUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }), true);
  assert.equal(isEmptyUsage({ inputTokens: 0, outputTokens: 3 }), false);
});

test('the token line', () => {
  assert.equal(usageLine(null), null);
  assert.equal(usageLine({ totalTokens: 0 }), null);
  assert.equal(usageLine({ inputTokens: 1000, outputTokens: 234, totalTokens: 1234 }), '1,234 tokens (in 1,000 · out 234)');
  assert.equal(usageLine({ inputTokens: 10, outputTokens: 5 }), '15 tokens (in 10 · out 5)');
  assert.equal(usageLine({ totalTokens: 7 }), '7 tokens');
  assert.equal(usageLine({ outputTokens: 2 }), '2 tokens (out 2)');
});

// ── the answer ──

test('without deltas each text event is one line — newlines, not glued', () => {
  const a = new ChatAnswer();
  a.line('# Title');
  a.line('- one');
  assert.equal(a.line('- two'), '# Title\n- one\n- two');
});

test('deltas append, the next full text replaces them; an error replaces everything', () => {
  const a = new ChatAnswer();
  a.delta('Hel');
  assert.equal(a.delta('lo'), 'Hello');
  assert.equal(a.line('Hello, world'), 'Hello, world');
  assert.equal(a.line('more'), 'Hello, world\nmore');
  assert.equal(a.error('down'), '⚠️ down');
});

// ── progress ──

test('progress: status, tool calls, answering, seconds', () => {
  const p = new ChatProgress(0);
  assert.equal(p.line(0), CHAT_TEXTS.thinking);
  p.status({ phase: 'plan', text: 'Planning' }, 1000);
  assert.equal(p.line(3500), 'Planning 2 s');
  p.status({ phase: 'plan', text: 'Planning' }, 4000); // same phase: the clock keeps running
  assert.equal(p.line(4000), 'Planning 3 s');
  p.status({ phase: 'x' }, 5000);
  assert.equal(p.line(5000), CHAT_TEXTS.thinking);
  p.tool({ name: 'search', phase: 'start' }, 6000);
  p.tool({ phase: 'start' }, 6000);
  assert.equal(p.line(6000), 'Calling tool…');
  p.tool({ phase: 'end', ms: 5 }, 7000);
  assert.equal(p.line(7000), 'Calling search…');
  p.tool({ name: 'search', phase: 'end', ms: 900 }, 8000);
  p.tool({ name: 'orphan', phase: 'end' }, 8000);
  assert.equal(p.runningTool, undefined);
  assert.deepEqual(p.steps.map((s) => [s.name, s.running]), [['search', false], ['tool', false], ['orphan', false]]);
  p.text(9000);
  p.text(9500);
  assert.equal(p.line(20000), CHAT_TEXTS.answering);
  p.status({ phase: 'x' }, 21000); // back from answering: the clock restarts
  assert.equal(p.since, 21000);
});

// ── a whole turn, streamed ──

test('a turn applies events mid-stream, in order, and keeps the last usage', () => {
  const t = new ChatTurn(0);
  const u1 = t.push(sse('{"event":"agent-status","detail":{"text":"Looking"}}', '{"event":"navigation-requested","detail":{"route":"/a"}}'), 0);
  assert.deepEqual(u1, { answer: false, progress: true, events: [{ event: 'navigation-requested', detail: { route: '/a' } }] });
  t.push(sse('{"inputTokens":1,"outputTokens":1,"totalTokens":2}'), 0);
  const u2 = t.push(sse('{"inputTokens":0,"outputTokens":0,"totalTokens":0}', '{"event":"agent-delta","detail":{"text":"Hi "}}'), 0);
  assert.equal(u2.answer, true);
  t.push('data: {"event":"agent-delta","detail":{"text":"there"}}\n', 0);
  assert.equal(t.answer.text, 'Hi ');
  t.push('\n' + sse('{"inputTokens":3,"outputTokens":4,"totalTokens":7}'), 0);
  assert.equal(t.answer.text, 'Hi there');
  assert.deepEqual(t.usage, { inputTokens: 3, outputTokens: 4, totalTokens: 7 });
  t.push(sse('{"event":"agent-tool","detail":{"name":"q","phase":"start"}}'), 0);
  const last = t.push('data: Hi there, **friend**', 0);
  assert.equal(last.answer, false);
  assert.equal(t.end(0).answer, true);
  assert.equal(t.finalText, 'Hi there, **friend**');
});

test('an agent error is shown, an empty stream says so, a {-line is text', () => {
  const t = new ChatTurn(0);
  assert.equal(t.finalText, CHAT_TEXTS.noAnswer);
  t.push(sse('{"weird": true}', '{"event":"agent-error","detail":{"message":"quota"}}'), 0);
  assert.equal(t.finalText, '⚠️ quota');
  const t2 = new ChatTurn(0);
  t2.push(sse('{"weird": true}', 'line 2'), 0);
  assert.equal(t2.finalText, '{"weird": true}\nline 2');
});

// ── request ──

test('relative urls resolve against the backend base url with URL semantics', () => {
  assert.equal(resolveChatUrl('/api/ai/chat', 'http://h:8080/app'), 'http://h:8080/api/ai/chat');
  assert.equal(resolveChatUrl('api/chat', 'http://h:8080/app'), 'http://h:8080/api/chat');
  assert.equal(resolveChatUrl('api/chat', 'http://h:8080/app/'), 'http://h:8080/app/api/chat');
  assert.equal(resolveChatUrl('api/chat', 'http://h:8080'), 'http://h:8080/api/chat');
  assert.equal(resolveChatUrl('?x=1', 'http://h/a/b'), 'http://h/a/b?x=1');
  assert.equal(resolveChatUrl('?x=1', 'http://h'), 'http://h/?x=1');
  assert.equal(resolveChatUrl('//cdn/x', 'https://h'), 'https://cdn/x');
  assert.equal(resolveChatUrl('https://other/x', 'http://h'), 'https://other/x');
  assert.equal(resolveChatUrl('x', 'not a url'), 'x');
  assert.equal(resolveChatUrl('x', 'file:rel'), 'file:/x');
  assert.equal(resolveChatUrl('  ', 'http://h'), '');
  assert.equal(resolveChatUrl(null, 'http://h'), '');
});

test('the menu flattens into breadcrumbed navigations, skipping separators and unresolved remotes', () => {
  const menu = [
    { label: 'Sales', submenus: [{ label: 'Orders', route: '/orders', consumedRoute: '', serverSideType: 'O', description: 'All orders' }, { separator: true }] },
    { label: 'Remote', remote: true, route: '/r' },
    { label: 'Run', actionId: 'go', baseUrl: 'http://b', uriPrefix: '/p' },
    null,
  ];
  assert.deepEqual(menuContextOf(menu), [
    { path: ['Sales', 'Orders'], description: 'All orders', navigation: { route: '/orders', consumedRoute: '', actionId: '', baseUrl: undefined, serverSideType: 'O', uriPrefix: undefined } },
    { path: ['Run'], navigation: { route: '', consumedRoute: '', actionId: 'go', baseUrl: 'http://b', serverSideType: undefined, uriPrefix: '/p' } },
  ]);
  assert.deepEqual(menuContextOf(undefined), []);
  assert.deepEqual(menuContextOf([{ submenus: [{ route: '/x' }] }])[0].path, ['', '']);
});

const screenTree = {
  type: 'ClientSide',
  metadata: { type: 'Page', pageTitle: 'Order 7' },
  children: [
    { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string' } },
    { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Dup' } },
    { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'qty' } },
    { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Save' } },
    { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Again' } },
    { type: 'ClientSide', metadata: { type: 'Button', actionId: 'go' } },
    { type: 'ClientSide', metadata: { type: 'Form', title: 'Inner' } },
  ],
};
// a cycle must not hang the walk
(screenTree.children[0] as Record<string, unknown>)['self'] = screenTree;

test('the screen projection: fields with values, button actions, the page title', () => {
  assert.deepEqual(projectScreen(screenTree, { name: 'Ana' }), {
    title: 'Order 7',
    fields: [{ id: 'name', label: 'Name', dataType: 'string', value: 'Ana' }, { id: 'qty', label: 'qty', dataType: 'string' }],
    actions: [{ id: 'save', label: 'Save' }, { id: 'go', label: 'go' }],
  });
  assert.deepEqual(projectScreen(null, null), { fields: [], actions: [] });
  assert.deepEqual(projectScreen({ metadata: { type: 'Page', title: '' } }, undefined), { fields: [], actions: [] });
});

test('the body carries the screen, context, absolute mcpUrl and menu context when given', () => {
  const body = chatRequestBody({
    message: 'hi',
    sessionId: 's1',
    attachments: [{ name: 'a.png', path: 'up/a.png' }],
    screen: { route: '/orders/7', componentState: { name: 'Ana' }, component: screenTree },
    appState: { hotel: 'H1' },
    mcpUrl: 'http://h/mcp',
    menuContext: [],
  });
  assert.deepEqual(Object.keys(body), ['message', 'sessionId', 'attachments', 'currentRoute', 'context', 'screen', 'mcpUrl', 'menuContext']);
  assert.deepEqual(body['context'], { route: '/orders/7', screenTitle: 'Order 7', appState: { hotel: 'H1' }, componentState: { name: 'Ana' } });
  assert.deepEqual(chatRequestBody({ message: 'x', sessionId: 's' }), { message: 'x', sessionId: 's' });
  assert.deepEqual(chatRequestBody({ message: 'x', sessionId: 's', appState: { a: 1 } }), { message: 'x', sessionId: 's', context: { appState: { a: 1 } } });
  const bare = chatRequestBody({ message: 'x', sessionId: 's', screen: { route: '', title: 'T' }, attachments: [] });
  assert.deepEqual(bare, { message: 'x', sessionId: 's', currentRoute: '', context: { route: '', screenTitle: 'T', componentState: {} } });
  const noScreen = chatRequestBody({ message: 'x', sessionId: 's', screen: { route: '/r', component: { metadata: { type: 'Text' } } } });
  assert.equal('screen' in noScreen, false);
});

test('the upload answer becomes attachments', () => {
  assert.deepEqual(uploadedFiles({ files: [{ name: 'a', path: 'p/a' }, { path: 'p/b' }, { name: 'c' }, null, { path: '' }] }), [
    { name: 'a', path: 'p/a' },
    { name: 'p/b', path: 'p/b' },
  ]);
  assert.deepEqual(uploadedFiles(null), []);
  assert.deepEqual(uploadedFiles({ files: 'x' }), []);
});

// ── UI events ──

test('render-screen: yaml wins, then a uidl string, then a uidl object; target and title', () => {
  assert.deepEqual(renderScreenRequestOf({ yaml: 'a: 1', uidl: 'b', target: 'drawer', title: 'T' }), { yaml: 'a: 1', target: 'drawer', title: 'T' });
  assert.deepEqual(renderScreenRequestOf({ uidl: 'b', target: 'dialog' }), { yaml: 'b', target: 'dialog' });
  assert.deepEqual(renderScreenRequestOf({ uidl: { type: 'Text' }, target: 'elsewhere' }), { yaml: '{"type":"Text"}', target: 'content' });
  assert.equal(renderScreenRequestOf({}), null);
  assert.equal(renderScreenRequestOf(null), null);
});

test('the preview action: current route, consumed = current, no serverSideType, _yaml', () => {
  assert.deepEqual(previewActionOf({ yaml: 'y', target: 'content' }, '/orders'), {
    route: '/orders',
    consumedRoute: '/orders',
    actionId: '__preview__',
    serverSideType: null,
    initiatorComponentId: 'chat-render-screen',
    componentState: {},
    parameters: { _yaml: 'y' },
  });
});

test('the first fragment with a component, and the overlay it opens as', () => {
  assert.equal(firstComponentFragment(null), null);
  assert.equal(firstComponentFragment({ fragments: [{ data: {} }] }), null);
  const frag = { component: { type: 'ServerSide', initialData: { a: 1 } }, state: { b: 2 } };
  assert.equal(firstComponentFragment({ fragments: [null, { data: 1 }, frag] }), frag);
  assert.deepEqual(previewOverlayOf(frag, 'dialog', 'T'), {
    type: 'ClientSide',
    id: 'chat-render-screen',
    metadata: { type: 'Dialog', headerTitle: 'T', content: { type: 'ServerSide', initialData: { a: 1, b: 2 } } },
    children: [],
  });
  const plain = { component: { type: 'ClientSide' } };
  assert.deepEqual((previewOverlayOf(plain, 'drawer').metadata as Record<string, unknown>), { type: 'Drawer', headerTitle: '', content: { type: 'ClientSide' } });
  assert.deepEqual(previewOverlayOf({ component: { type: 'X' }, state: {} }, 'drawer').metadata, { type: 'Drawer', headerTitle: '', content: { type: 'X' } });
  assert.deepEqual(previewOverlayOf({ component: { type: 'X', initialData: null }, state: { s: 1 } }, 'drawer').metadata, { type: 'Drawer', headerTitle: '', content: { type: 'X', initialData: { s: 1 } } });
});

test('a navigation-requested detail keeps every field a menu click carries', () => {
  assert.deepEqual(chatNavigationOf({ route: '/a', consumedRoute: '', actionId: '', baseUrl: 'http://b', serverSideType: 'S', uriPrefix: '/p' }), {
    route: '/a', consumedRoute: '', actionId: '', baseUrl: 'http://b', serverSideType: 'S', uriPrefix: '/p',
  });
  assert.deepEqual(chatNavigationOf({ actionId: 'run', serverSideType: 7 }), { route: '', consumedRoute: '', actionId: 'run' });
  assert.equal(chatNavigationOf({}), null);
  assert.equal(chatNavigationOf(undefined), null);
});

const hooksLog = (subscribed: boolean) => {
  const log: unknown[] = [];
  const hooks: ChatEventHooks = {
    dispatch: (e, d) => {
      log.push(['dispatch', e, d]);
      return subscribed;
    },
    navigate: (n) => log.push(['navigate', n]),
    close: () => log.push(['close']),
    renderScreen: (r) => log.push(['render', r]),
  };
  return { log, hooks };
};

test('events: navigate, close, render-screen to a subscriber or the shell, others to the bus', () => {
  const run = (e: ChatUiEvent, subscribed = false) => {
    const { log, hooks } = hooksLog(subscribed);
    return { outcome: applyChatEvent(e, hooks), log };
  };
  assert.deepEqual(run({ event: 'navigation-requested', detail: { route: '/x' } }), { outcome: 'navigated', log: [['navigate', { route: '/x', consumedRoute: '', actionId: '' }]] });
  assert.deepEqual(run({ event: 'navigation-requested', detail: {} }), { outcome: 'ignored', log: [] });
  assert.deepEqual(run({ event: 'close-requested', detail: undefined }), { outcome: 'closed', log: [['close']] });
  assert.deepEqual(run({ event: 'render-screen', detail: { yaml: 'y' } }, true), { outcome: 'subscriber', log: [['dispatch', 'render-screen', { yaml: 'y' }]] });
  assert.deepEqual(run({ event: 'render-screen', detail: { yaml: 'y' } }).log[1], ['render', { yaml: 'y', target: 'content' }]);
  assert.equal(run({ event: 'render-screen', detail: null }).outcome, 'ignored');
  assert.deepEqual(run({ event: 'order-picked', detail: null }), { outcome: 'dispatched', log: [['dispatch', 'order-picked', {}]] });
});

// ── links in answers ──

test('an in-app route is an href with a single leading slash', () => {
  assert.equal(inAppRouteOf(' /booking/bookings/4 '), '/booking/bookings/4');
  for (const h of ['//cdn/x', 'https://x', 'rel', '', null, undefined]) assert.equal(inAppRouteOf(h), undefined);
});

const linkMenu = [
  { label: 'Booking', submenus: [
    { label: 'Bookings', route: '/booking/bookings', consumedRoute: '/booking', baseUrl: 'http://b', serverSideType: 'B', uriPrefix: '/u' },
    { label: 'Booking home', route: '/booking', consumedRoute: '' },
    { separator: true },
    { label: 'Remote', remote: true, route: '/booking/bookings/4' },
  ] },
  { label: 'Root', route: '/' },
  { label: 'No route' },
  null,
];

test('a route opens through the menu entry with the longest matching prefix', () => {
  assert.deepEqual(menuNavigationOf(linkMenu, '/booking/bookings/4MBZS7?tab=1'), {
    route: '/booking/bookings/4MBZS7?tab=1', consumedRoute: '/booking', actionId: '', baseUrl: 'http://b', serverSideType: 'B', uriPrefix: '/u',
  });
  assert.deepEqual(menuNavigationOf(linkMenu, '/booking'), { route: '/booking', consumedRoute: '', actionId: '' });
  assert.deepEqual(menuNavigationOf([{ route: '/a/', consumedRoute: 'c' }], '/a/b'), { route: '/a/b', consumedRoute: 'c', actionId: '' });
  assert.equal(menuNavigationOf(linkMenu, '/bookingx'), null);
  assert.equal(menuNavigationOf(undefined, '/x'), null);
});

test('a pressed answer link: menu entry, else route resolution, else not ours', () => {
  assert.equal(chatLinkNavigation(linkMenu, '/booking/bookings/1')?.serverSideType, 'B');
  assert.deepEqual(chatLinkNavigation(linkMenu, '/elsewhere'), { route: '/elsewhere', consumedRoute: '', actionId: '' });
  assert.equal(chatLinkNavigation(linkMenu, 'https://x'), null);
});
