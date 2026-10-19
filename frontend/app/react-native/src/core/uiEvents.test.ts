// One function applies an agent's UI event, whether it came in the assistant chat's stream or over
// the live-push channel (core/uiEvents.ts): a pushed message must do EXACTLY what the chat's does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MateuSession } from './MateuSession.ts';
import { applyUiEvent } from './uiEvents.ts';
import { AgentChannel, agentActionRequest, AGENT_CHANNEL_ACTION } from './agentPush.ts';

function fakeSession() {
  const session = new MateuSession('http://x', 'install-1', {}, null);
  const log: unknown[] = [];
  session.navigateTo = (nav) => log.push(['navigate', nav]);
  session.showPreview = (increment, target, title) => log.push(['preview', increment, target, title]);
  session.currentScreen = () => ({ route: '/orders', componentState: {}, component: null } as never);
  session.notify = (_t, text, variant) => log.push(['notify', text, variant]);
  session.closeAssistant = () => log.push(['closeAssistant']);
  const requests: unknown[] = [];
  (session.api as unknown as { runAction: (p: unknown) => Promise<unknown> }).runAction = async (p) => {
    requests.push(p);
    return { fragments: [{ component: { type: 'Text' } }] };
  };
  return { session, log, requests };
}

const flush = () => new Promise((r) => setImmediate(r));

test('render-screen: a subscriber first, else __preview__ on the current route, shown where asked', async () => {
  const { session, log, requests } = fakeSession();
  assert.equal(applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'type: Text\n', target: 'drawer', title: 'Hi' } }), 'rendered');
  await flush();
  assert.deepEqual(requests, [
    {
      route: '/orders',
      consumedRoute: '/orders',
      actionId: '__preview__',
      serverSideType: null,
      initiatorComponentId: 'chat-render-screen',
      componentState: {},
      parameters: { _yaml: 'type: Text\n', _untrusted: true },
      appState: {},
    },
  ]);
  assert.deepEqual(log, [['closeAssistant'], ['preview', { fragments: [{ component: { type: 'Text' } }] }, 'drawer', 'Hi']]);

  const taken: unknown[] = [];
  session.subscribe('owner', 'render-screen', (p) => void taken.push(p));
  assert.equal(applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'x' } }), 'subscriber');
  assert.deepEqual(taken, [{ yaml: 'x' }]);
});

test('navigation-requested navigates like a menu click and hides the assistant; other events reach the bus', () => {
  const { session, log } = fakeSession();
  assert.equal(applyUiEvent(session, { event: 'navigation-requested', detail: { route: '/orders/42', consumedRoute: '' } }), 'navigated');
  assert.deepEqual(log, [['navigate', { route: '/orders/42', consumedRoute: '', actionId: '' }], ['closeAssistant']]);
  const got: unknown[] = [];
  session.subscribe('o', 'highlight-row', (p) => void got.push(p));
  assert.equal(applyUiEvent(session, { event: 'highlight-row', detail: { id: 7 } }), 'dispatched');
  assert.equal(applyUiEvent(session, { event: 'nobody-listens', detail: null }), 'dispatched');
  assert.deepEqual(got, [{ id: 7 }]);
});

test('a failed __preview__ is told to the user', async () => {
  const { session, log } = fakeSession();
  (session.api as unknown as { runAction: () => Promise<unknown> }).runAction = async () => {
    throw new Error('HTTP 403: nope');
  };
  applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'x', target: 'content' } }, () => {});
  await flush();
  assert.deepEqual(log, [['notify', 'HTTP 403: nope', 'error']]);
});

test('pushed messages over the channel land on the very same function', async () => {
  const { session, log } = fakeSession();
  const channel = new AgentChannel({
    state: session.agent,
    request: () => agentActionRequest({}, AGENT_CHANNEL_ACTION, session.agent.session, {}),
    open: async (_r, onIncrement) => {
      onIncrement({ commands: [{ type: 'AgentPush', data: { kind: 'navigate', event: 'navigation-requested', detail: { route: '/a', consumedRoute: '' } } }] });
    },
    onEvent: (e) => applyUiEvent(session, e),
    schedule: () => () => {},
  });
  channel.start();
  await flush();
  channel.dispose();
  assert.deepEqual(log, [['navigate', { route: '/a', consumedRoute: '', actionId: '' }], ['closeAssistant']]);
});

test('the chat and the channel share ONE UI session, and both go through the shared hooks', () => {
  const { session } = fakeSession();
  const id = session.agent.session.sessionId;
  assert.match(id, /^ui-/);
  assert.equal(session.agent.session.sessionId, id);
  const chat = readFileSync(new URL('../renderer/ChatPanel.tsx', import.meta.url), 'utf8');
  assert.ok(chat.includes('session.agent.session.sessionId'), 'the chat sends the UI session id');
  assert.ok(chat.includes('uiEventHooks(session, onClose)'), 'the chat applies its events through the shared hooks');
  assert.ok(!chat.includes('renderScreen: (req)'), 'no private copy of the render-screen handling left in the chat');
  const push = readFileSync(new URL('../renderer/AgentPush.tsx', import.meta.url), 'utf8');
  assert.ok(push.includes('applyUiEvent(session, event)'), 'the channel applies pushed events through the same function');
});

test('a hub UI and the single-backend app each have their own UI session; an island shares its host\'s', async () => {
  const a = new MateuSession('http://a', 'i', {}, null);
  const b = new MateuSession('http://b', 'i', {}, null);
  assert.notEqual(a.agent.session.sessionId, b.agent.session.sessionId);
  const { islandSession } = await import('./MateuSession.ts');
  assert.equal(islandSession(a, 'http://remote').agent, a.agent);
});

test('a render-screen into the CONTENT asks before discarding unsaved changes (drawers and dialogs do not)', async () => {
  const { session, log, requests } = fakeSession();
  let answer = false;
  const asked: string[] = [];
  session.hasUnsavedChanges = () => true;
  session.confirmDiscard = async () => { asked.push('asked'); return answer; };
  applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'type: Text\n' } });
  await flush();
  assert.deepEqual(asked, ['asked']);
  assert.equal(requests.length, 0, 'kept: nothing rendered over the edit');
  answer = true;
  applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'type: Text\n' } });
  await flush();
  assert.equal(requests.length, 1, 'discarded on purpose: rendered');
  applyUiEvent(session, { event: 'render-screen', detail: { yaml: 'type: Text\n', target: 'drawer' } });
  await flush();
  assert.deepEqual(asked, ['asked', 'asked'], 'a drawer covers nothing it would lose');
  assert.equal(log.filter((l) => (l as unknown[])[0] === 'preview').length, 2);
});
