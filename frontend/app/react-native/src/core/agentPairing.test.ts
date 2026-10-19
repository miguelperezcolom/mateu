// "Connect AI": the pairing flow the drawer entry + modal paint (core/agentPairing.ts), what each
// state shows and says, and the a11y contract of the component (renderer/AgentPush.tsx).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AgentPushState } from './agentPush.ts';
import {
  AgentPairingModel, PAIRING_TEXTS, connectAiEntry, countdownSpoken, countdownText, pairingView, secondsLeft, spokenCode,
} from './agentPairing.ts';

const codeAnswer = (code = 'K7QF-4MZP', expiresInSeconds = 300) => ({ fragments: [{ data: { _agentPairing: { code, expiresInSeconds } } }] });

function model(answers: Record<string, () => Promise<unknown>>) {
  let now = 1_000_000;
  const state = new AgentPushState(() => ({ sessionId: 'ui-1', secret: 's' }));
  const calls: string[] = [];
  const m = new AgentPairingModel({
    state,
    now: () => now,
    run: (actionId) => {
      calls.push(actionId);
      return answers[actionId]();
    },
  });
  const detach = m.attach();
  let repaints = 0;
  m.subscribe(() => repaints++);
  return { m, state, calls, detach, advance: (ms: number) => (now += ms), now: () => now, repaints: () => repaints };
}

test('codes and countdowns read well, on screen and to a screen reader', () => {
  assert.equal(spokenCode('K7QF-4MZP'), 'K 7 Q F, 4 M Z P');
  assert.equal(spokenCode('ab12'), 'a b 1 2');
  assert.equal(secondsLeft(10_500, 10_000), 1);
  assert.equal(secondsLeft(10_000, 20_000), 0);
  assert.equal(countdownText(299), '4:59');
  assert.equal(countdownText(5), '0:05');
  assert.equal(countdownSpoken(299), '4 minutes 59 seconds');
  assert.equal(countdownSpoken(60), '1 minute');
  assert.equal(countdownSpoken(1), '1 second');
  assert.equal(countdownSpoken(0), '0 seconds');
});

test('the drawer entry: "Connect AI", or who is connected', () => {
  assert.deepEqual(connectAiEntry({ paired: false, agents: [] }), { text: 'Connect AI', label: 'Connect AI', connected: false });
  assert.deepEqual(connectAiEntry({ paired: true, agents: ['alice', 'an agent'] }), {
    text: 'AI connected · alice and an agent',
    label: 'AI connected to alice and an agent. Manage',
    connected: true,
  });
});

test('pair: _agent-pair → the code with its countdown and the instruction', async () => {
  const t = model({ '_agent-pair': async () => codeAnswer() });
  assert.deepEqual(t.m.view().buttons.map((b) => b.label), ['Get a pairing code', 'Close']);
  assert.equal(t.m.view().intro, PAIRING_TEXTS.intro);
  const promise = t.m.pair();
  assert.equal(t.m.phase.name, 'requesting');
  assert.equal(t.m.view().busy, PAIRING_TEXTS.requesting);
  const said = await promise;
  assert.deepEqual(t.calls, ['_agent-pair']);
  assert.equal(said, 'Pairing code K 7 Q F, 4 M Z P. Expires in 5 minutes. Ask your agent to pair with this code (mateu_pair_session)');
  const view = t.m.view();
  assert.equal(view.code, 'K7QF-4MZP');
  assert.equal(view.codeLabel, 'Pairing code K 7 Q F, 4 M Z P');
  assert.equal(view.countdown, '5:00');
  assert.equal(view.countdownLabel, 'Expires in 5 minutes');
  assert.equal(view.instruction, 'Ask your agent to pair with this code (mateu_pair_session)');
  assert.deepEqual(view.buttons.map((b) => b.id), ['newCode', 'close']);
  t.advance(1_000);
  assert.equal(t.m.tick(), '');
  assert.equal(t.m.view().countdown, '4:59');
});

test('the countdown warns at 30 s and the code expires at 0', async () => {
  const t = model({ '_agent-pair': async () => codeAnswer('AB-CD', 31) });
  await t.m.pair();
  t.advance(1_000);
  assert.equal(t.m.tick(), 'The pairing code expires in 30 seconds');
  t.advance(30_000);
  assert.equal(t.m.tick(), PAIRING_TEXTS.expired);
  const view = t.m.view();
  assert.equal(view.message, PAIRING_TEXTS.expired);
  assert.equal(view.code, undefined);
  assert.deepEqual(view.buttons.map((b) => b.label), ['Get a new code', 'Close']);
  assert.equal(t.m.tick(), ''); // nothing to count any more
});

test('the channel saying paired consumes the shown code: connected, with the agents and Disconnect', async () => {
  const t = model({ '_agent-pair': async () => codeAnswer(), '_agent-unpair': async () => ({ fragments: [{ data: { _agentPairing: null } }] }) });
  t.state.setStatus({ paired: false, agents: [] });
  await t.m.pair();
  t.state.setStatus({ paired: true, agents: ['alice'] });
  assert.equal(t.m.phase.name, 'idle');
  let view = t.m.view();
  assert.equal(view.connected, true);
  assert.equal(view.title, 'AI connected');
  assert.deepEqual(view.agents, ['alice']);
  assert.equal(view.agentsText, 'alice');
  assert.deepEqual(view.buttons.map((b) => b.label), ['Disconnect', 'Pair another agent', 'Close']);

  // a second agent: the code shown for it dies when it is used, not before
  await t.m.pair();
  t.state.setStatus({ paired: true, agents: ['alice'] }); // unchanged → still showing the code
  assert.equal(t.m.phase.name, 'code');
  t.state.setStatus({ paired: true, agents: ['alice', 'an agent'] });
  assert.equal(t.m.phase.name, 'idle');

  assert.equal(await t.m.unpair(), 'AI disconnected');
  assert.deepEqual(t.calls, ['_agent-pair', '_agent-pair', '_agent-unpair']);
  view = t.m.view();
  assert.equal(view.connected, false);
  assert.deepEqual(t.state.status, { paired: false, agents: [] });
  assert.equal(view.buttons[0].label, 'Get a pairing code');
});

test('errors: the server\'s text when it gives one, else a plain sentence', async () => {
  const t = model({
    '_agent-pair': async () => ({ messages: [{ variant: 'error', text: 'Live UI push is not enabled.' }] }),
    '_agent-unpair': async () => {
      throw new Error('HTTP 500');
    },
  });
  assert.equal(await t.m.pair(), 'Live UI push is not enabled.');
  assert.equal(t.m.view().message, 'Live UI push is not enabled.');
  assert.equal(await t.m.unpair(), 'Could not disconnect. HTTP 500');
  const silent = model({ '_agent-pair': async () => ({}) });
  assert.equal(await silent.m.pair(), PAIRING_TEXTS.failed);
});

test('a late answer after Close (or a newer request) is dropped', async () => {
  let release!: (v: unknown) => void;
  const t = model({ '_agent-pair': () => new Promise((r) => (release = r)) });
  const pending = t.m.pair();
  t.m.reset();
  release(codeAnswer());
  assert.equal(await pending, '');
  assert.equal(t.m.phase.name, 'idle');
});

test('detached, the model no longer follows the channel', async () => {
  const t = model({ '_agent-pair': async () => codeAnswer() });
  await t.m.pair();
  t.detach();
  t.state.setStatus({ paired: true, agents: ['bob'] });
  assert.equal(t.m.phase.name, 'code');
});

test('pairingView is a pure function of phase + status + now', () => {
  const view = pairingView({ name: 'code', code: 'XY-12', expiresAt: 61_000 }, { paired: true, agents: ['alice'] }, 0);
  assert.equal(view.countdown, '1:01');
  assert.equal(view.connected, true);
  assert.equal(pairingView({ name: 'disconnecting' }, { paired: true, agents: ['a'] }, 0).busy, 'Disconnecting…');
});

test('the component: a modal screen readers stop at, labelled controls, announcements, drawer entry', () => {
  const source = readFileSync(new URL('../renderer/AgentPush.tsx', import.meta.url), 'utf8');
  const modal = source.slice(source.indexOf('export function ConnectAiModal'));
  assert.ok(modal.includes('accessibilityViewIsModal'), 'the modal is modal for VoiceOver');
  assert.ok(modal.includes('modalA11y(view.title)'), 'and named');
  assert.ok(modal.includes('headingA11y(2)'), 'its title is a heading');
  assert.ok(modal.includes('accessibilityLabel={view.codeLabel}'), 'the code is read character by character');
  assert.ok(modal.includes('accessibilityLabel={view.countdownLabel}'), 'the countdown is read in words');
  assert.ok(modal.includes('buttonA11y({ label: b.label'), 'every button is a named button');
  assert.ok(modal.includes('accessibilityRole="alert"'), 'errors are alerts');
  assert.ok((modal.match(/announceLive\(/g) ?? []).length >= 3, 'code, countdown and disconnect are announced');
  assert.ok(source.includes('if (!meta.agentPush) return null;'), 'the entry shows only when push is on');
  assert.ok(source.includes('if (!meta.agentPush) return;'), 'the channel opens only when push is on');
  const shell = readFileSync(new URL('../renderer/AppRenderer.tsx', import.meta.url), 'utf8');
  assert.ok(shell.includes('<ConnectAiEntry meta={appMeta} />'), 'the drawer carries Connect AI');
  assert.ok(shell.includes('useAgentChannel(appMeta)'), 'the shell opens the channel');
});
