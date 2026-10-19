// Live UI push (conformance/mcp/README.md "Live UI push (phase C)"): the UI session, the wire of the
// channel, what each pushed message does, and the channel's reconnect / back-off decisions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENT_CHANNEL_ACTION, AGENT_ERRORS, AgentChannel, AgentPushState, agentActionRequest, agentErrorOf, agentPairingOf,
  agentPushMessagesOf, agentReconnectDelay, agentsLine, agentStatusOf, newUiSessionIdentity, routeAgentPush,
  type AgentChannelDeps,
} from './agentPush.ts';
import type { ChatUiEvent } from './chatStream.ts';

const push = (kind: string, event: string, detail?: unknown) => ({ type: 'AgentPush', data: { kind, event, detail } });

test('a UI session: an unguessable ui- id and a 256-bit hex secret, new each time', () => {
  const a = newUiSessionIdentity();
  const b = newUiSessionIdentity();
  assert.match(a.sessionId, /^ui-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(a.secret, /^[0-9a-f]{64}$/);
  assert.notEqual(a.sessionId, b.sessionId);
  assert.notEqual(a.secret, b.secret);
});

test('the push state keeps ONE session until rotated, and reports status changes worth saying', () => {
  let n = 0;
  const state = new AgentPushState(() => ({ sessionId: `ui-${++n}`, secret: `s${n}` }));
  assert.equal(state.session.sessionId, 'ui-1');
  assert.equal(state.session.sessionId, 'ui-1');
  let repaints = 0;
  state.subscribe(() => repaints++);
  assert.equal(state.connected, false);
  assert.equal(state.setStatus({ paired: false, agents: [] }), null); // first status: connected, nothing to say
  assert.equal(state.connected, true);
  assert.equal(state.setStatus({ paired: true, agents: ['alice'] }), 'AI connected: alice');
  assert.equal(state.setStatus({ paired: true, agents: ['alice'] }), null);
  assert.equal(state.setStatus({ paired: true, agents: ['alice', 'an agent'] }), 'AI connected: alice and an agent');
  assert.equal(state.setStatus({ paired: false, agents: [] }), 'AI disconnected');
  assert.equal(repaints, 4);
  assert.equal(state.rotate().sessionId, 'ui-2');
  assert.equal(state.connected, false);
  assert.deepEqual(state.status, { paired: false, agents: [] });
});

test('agents read as a sentence', () => {
  assert.equal(agentsLine([]), 'an agent');
  assert.equal(agentsLine(['alice']), 'alice');
  assert.equal(agentsLine(['alice', 'bob', 'an agent']), 'alice, bob and an agent');
});

test('the AgentPush commands of an increment, in order; anything else skipped', () => {
  const increment = {
    commands: [
      push('status', 'mateu-agent-status', { paired: false, agents: [] }),
      { type: 'UpdateHeaderValue', data: { id: 'x', value: 'y' } },
      { type: 'AgentPush', data: { kind: 'event' } },
      push('event', 'highlight-row', { id: 7 }),
      push('event', 'ping'),
    ],
  };
  assert.deepEqual(agentPushMessagesOf(increment), [
    { kind: 'status', event: 'mateu-agent-status', detail: { paired: false, agents: [] } },
    { kind: 'event', event: 'highlight-row', detail: { id: 7 } },
    { kind: 'event', event: 'ping', detail: {} },
  ]);
  assert.deepEqual(agentPushMessagesOf({}), []);
  assert.deepEqual(agentPushMessagesOf(null), []);
  assert.deepEqual(agentStatusOf({ paired: true, agents: ['alice', 3, null] }), { paired: true, agents: ['alice'] });
  assert.deepEqual(agentStatusOf(undefined), { paired: false, agents: [] });
});

test('each kind becomes the chat\'s own event; a status is NOT dispatched; mismatches are ignored', () => {
  assert.deepEqual(routeAgentPush({ kind: 'status', event: 'mateu-agent-status', detail: { paired: true, agents: ['alice'] } }), {
    kind: 'status',
    status: { paired: true, agents: ['alice'] },
  });
  const render = { yaml: 'type: Text\ntext: Hello\n', target: 'drawer', title: 'Greeting' };
  assert.deepEqual(routeAgentPush({ kind: 'render', event: 'render-screen', detail: render }), { kind: 'ui', event: { event: 'render-screen', detail: render } });
  const nav = { route: '/orders/42', consumedRoute: '' };
  assert.deepEqual(routeAgentPush({ kind: 'navigate', event: 'navigation-requested', detail: nav }), {
    kind: 'ui',
    event: { event: 'navigation-requested', detail: nav },
  });
  assert.deepEqual(routeAgentPush({ kind: 'event', event: 'highlight-row', detail: { id: 7 } }), {
    kind: 'ui',
    event: { event: 'highlight-row', detail: { id: 7 } },
  });
  for (const odd of [
    { kind: 'render', event: 'highlight-row' },
    { kind: 'navigate', event: 'render-screen' },
    { kind: 'event', event: 'render-screen' },
    { kind: 'event', event: 'close-requested' },
    { kind: 'event', event: 'mateu-agent-status' },
    { kind: 'event', event: 'bad name!' },
    { kind: 'status', event: 'other' },
    { kind: 'telepathy', event: 'x' },
  ]) {
    assert.deepEqual(routeAgentPush({ ...odd, detail: {} }), { kind: 'ignored' }, JSON.stringify(odd));
  }
});

test('the server\'s refusals are recognised', () => {
  const err = (text: string, variant = 'error') => ({ messages: [{ variant, text }] });
  assert.deepEqual(agentErrorOf(err(AGENT_ERRORS.foreign)), { kind: 'foreign', text: AGENT_ERRORS.foreign });
  assert.deepEqual(agentErrorOf(err(AGENT_ERRORS.disabled)), { kind: 'disabled', text: AGENT_ERRORS.disabled });
  assert.deepEqual(agentErrorOf(err(AGENT_ERRORS.full, 'warning')), { kind: 'full', text: AGENT_ERRORS.full });
  assert.deepEqual(agentErrorOf(err('Boom')), { kind: 'other', text: 'Boom' });
  assert.equal(agentErrorOf(err('Saved', 'info')), null);
  assert.equal(agentErrorOf({ commands: [] }), null);
});

test('the agent actions are app-level, like _live-updates, and carry the id + secret', () => {
  const identity = { sessionId: 'ui-1', secret: 'sec' };
  assert.deepEqual(
    agentActionRequest({ serverSideType: 'com.x.App', rootRoute: '/app' }, AGENT_CHANNEL_ACTION, identity, { hotel: 'H1' }, { route: '/orders', renderer: 'react-native' }),
    {
      route: '/app',
      consumedRoute: '',
      actionId: '_agent-channel',
      serverSideType: 'com.x.App',
      initiatorComponentId: 'mateu-agent-push',
      componentState: {},
      appState: { hotel: 'H1' },
      parameters: { sessionId: 'ui-1', secret: 'sec', route: '/orders', renderer: 'react-native' },
    },
  );
  const root = agentActionRequest({}, '_agent-pair', identity, {});
  assert.equal(root.route, '');
  assert.equal(root.serverSideType, null);
  assert.deepEqual(root.parameters, { sessionId: 'ui-1', secret: 'sec' });
});

test('the pairing answer: a code, an unpair (null), or nothing (an error answer)', () => {
  assert.deepEqual(agentPairingOf({ fragments: [{ data: { _agentPairing: { code: 'K7QF-4MZP', expiresInSeconds: 300 } } }] }), {
    found: true,
    pairing: { code: 'K7QF-4MZP', expiresInSeconds: 300 },
  });
  assert.deepEqual(agentPairingOf({ fragments: [{ state: {} }, { data: { _agentPairing: null } }] }), { found: true, pairing: null });
  assert.deepEqual(agentPairingOf({ messages: [{ variant: 'error', text: 'x' }] }), { found: false, pairing: null });
  assert.equal(agentPairingOf({ fragments: [{ data: { _agentPairing: { code: 'AB' } } }] }).pairing?.expiresInSeconds, 300);
});

test('reconnect: at once after a clean end, backed off after errors', () => {
  assert.equal(agentReconnectDelay(0), 0);
  assert.equal(agentReconnectDelay(1), 2_000);
  assert.equal(agentReconnectDelay(3), 8_000);
  assert.equal(agentReconnectDelay(20), 60_000);
});

// ── the channel ────────────────────────────────────────────────────────────────────────────────

interface Harness {
  channel: AgentChannel;
  state: AgentPushState;
  events: ChatUiEvent[];
  said: string[];
  opened: ReturnType<AgentChannelDeps['request']>[];
  timers: { ms: number; fn: () => void; cancelled: boolean }[];
  /** The current stream: feed it, then end it (or fail it). */
  feed: (increment: unknown) => void;
  end: () => Promise<void>;
  fail: () => Promise<void>;
  signal: () => AbortSignal | null;
}

function harness(): Harness {
  let n = 0;
  const state = new AgentPushState(() => ({ sessionId: `ui-${++n}`, secret: `s${n}` }));
  const h = { events: [], said: [], opened: [], timers: [] } as unknown as Harness;
  let current: { onIncrement: (i: unknown) => void; resolve: () => void; reject: (e: unknown) => void; signal: AbortSignal } | null = null;
  const tick = () => new Promise((r) => setImmediate(r));
  h.state = state;
  h.channel = new AgentChannel({
    state,
    request: () => agentActionRequest({ serverSideType: 'App', rootRoute: '' }, AGENT_CHANNEL_ACTION, state.session, {}, { route: '', renderer: 'react-native' }),
    open: (request, onIncrement, signal) => {
      h.opened.push(request);
      return new Promise<void>((resolve, reject) => {
        current = { onIncrement, resolve, reject, signal };
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    },
    onEvent: (e) => h.events.push(e),
    onAnnounce: (t) => h.said.push(t),
    schedule: (fn, ms) => {
      const t = { ms, fn, cancelled: false };
      h.timers.push(t);
      return () => {
        t.cancelled = true;
      };
    },
  });
  h.feed = (i) => current!.onIncrement(i);
  h.end = async () => {
    current!.resolve();
    await tick();
  };
  h.fail = async () => {
    current!.reject(new Error('network'));
    await tick();
  };
  h.signal = () => current?.signal ?? null;
  return h;
}

const runTimer = (h: Harness) => {
  const t = h.timers.at(-1)!;
  assert.equal(t.cancelled, false);
  t.fn();
};

test('the channel registers, applies status + UI messages, and reopens AT ONCE after the 5-minute cut', async () => {
  const h = harness();
  h.channel.start();
  h.channel.start(); // idempotent while open
  assert.equal(h.opened.length, 1);
  assert.deepEqual(h.opened[0].parameters, { sessionId: 'ui-1', secret: 's1', route: '', renderer: 'react-native' });
  h.feed({ commands: [push('status', 'mateu-agent-status', { paired: false, agents: [] })] });
  assert.equal(h.state.connected, true);
  h.feed({ commands: [push('status', 'mateu-agent-status', { paired: true, agents: ['alice'] })] });
  h.feed({ commands: [push('render', 'render-screen', { yaml: 'type: Text\n', target: 'content' })] });
  h.feed({}); // the 20 s heartbeat
  h.feed({ commands: [push('navigate', 'navigation-requested', { route: '/orders/42', consumedRoute: '' })] });
  assert.deepEqual(h.said, ['AI connected: alice']);
  assert.deepEqual(h.events.map((e) => e.event), ['render-screen', 'navigation-requested']);
  await h.end();
  assert.equal(h.timers.at(-1)!.ms, 0);
  runTimer(h);
  assert.equal(h.opened.length, 2);
  assert.equal(h.opened[1].parameters.sessionId, 'ui-1'); // the same session
  h.channel.dispose();
});

test('errors back off; a stream that ends without a word counts as one; a delivery resets it', async () => {
  const h = harness();
  h.channel.start();
  await h.fail();
  assert.equal(h.timers.at(-1)!.ms, 2_000);
  runTimer(h);
  await h.end(); // ended without delivering anything
  assert.equal(h.timers.at(-1)!.ms, 4_000);
  runTimer(h);
  h.feed({ messages: [{ variant: 'error', text: AGENT_ERRORS.disabled }] });
  await h.end();
  assert.equal(h.channel.consecutiveFailures, 3);
  assert.equal(h.timers.at(-1)!.ms, 8_000);
  runTimer(h);
  h.feed({ commands: [push('status', 'mateu-agent-status', { paired: false, agents: [] })] });
  await h.end();
  assert.equal(h.channel.consecutiveFailures, 0);
  assert.equal(h.timers.at(-1)!.ms, 0);
  h.channel.dispose();
});

test('"belongs to another channel" gives the app a NEW UI session for the next attempt', async () => {
  const h = harness();
  h.channel.start();
  h.feed({ messages: [{ variant: 'error', text: AGENT_ERRORS.foreign }] });
  await h.end();
  runTimer(h);
  assert.equal(h.opened[1].parameters.sessionId, 'ui-2');
  assert.equal(h.opened[1].parameters.secret, 's2');
  h.channel.dispose();
});

test('stop (background) aborts the stream and schedules nothing; start reopens it', async () => {
  const h = harness();
  h.channel.start();
  const signal = h.signal()!;
  h.channel.stop();
  assert.equal(signal.aborted, true);
  await new Promise((r) => setImmediate(r));
  assert.equal(h.timers.length, 0);
  assert.equal(h.channel.isOpen, false);
  h.channel.start();
  assert.equal(h.opened.length, 2);
  await h.fail();
  h.channel.stop(); // a pending reconnect is cancelled too
  assert.equal(h.timers.at(-1)!.cancelled, true);
  h.channel.dispose();
  h.channel.start();
  assert.equal(h.opened.length, 2);
});

test('a UI event that throws while being applied does not take the channel down', async () => {
  const h = harness();
  const throwing = new AgentChannel({
    state: h.state,
    request: () => agentActionRequest({}, AGENT_CHANNEL_ACTION, h.state.session, {}),
    open: async (_r, onIncrement) => {
      onIncrement({ commands: [push('event', 'a'), push('event', 'b')] });
    },
    onEvent: (e) => {
      h.events.push(e);
      if (e.event === 'a') throw new Error('boom');
    },
    schedule: () => () => {},
  });
  throwing.start();
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(h.events.map((e) => e.event), ['a', 'b']);
  assert.equal(throwing.consecutiveFailures, 0);
  throwing.dispose();
});
