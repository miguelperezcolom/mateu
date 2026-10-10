import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PollingScheduler, type PollTimer } from './polling.ts';

/** A manual clock: timers only fire when the test advances time. */
function fakeTimer() {
  let now = 0;
  let seq = 0;
  const pending = new Map<number, { at: number; fn: () => void }>();
  const timer: PollTimer = {
    set: (fn, ms) => {
      const id = ++seq;
      pending.set(id, { at: now + ms, fn });
      return id;
    },
    clear: (h) => {
      pending.delete(h as number);
    },
  };
  const advance = (ms: number) => {
    now += ms;
    for (const [id, t] of [...pending.entries()].sort((a, b) => a[1].at - b[1].at)) {
      if (t.at <= now && pending.has(id)) {
        pending.delete(id);
        t.fn();
      }
    }
  };
  return { timer, advance, pending };
}

const LOOP = [
  { type: 'OnLoad', actionId: 'refresh', timeoutMillis: 10000, background: true },
  { type: 'OnSuccess', actionId: 'refresh', calledActionId: 'refresh', timeoutMillis: 10000, background: true },
];

function setup(conditionHolds?: (c: string) => boolean) {
  const clock = fakeTimer();
  const ran: { actionId: string; background: boolean }[] = [];
  const s = new PollingScheduler((actionId, o) => ran.push({ actionId, background: o.background }), clock.timer, conditionHolds);
  return { clock, ran, s };
}

test('polling: a timed OnLoad is scheduled, not fired at once, and fires once after the delay', () => {
  const { clock, ran, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  assert.equal(ran.length, 0);
  assert.equal(clock.pending.size, 1);
  clock.advance(9999);
  assert.equal(ran.length, 0);
  clock.advance(1);
  assert.deepEqual(ran, [{ actionId: 'refresh', background: true }]);
  clock.advance(60000);
  assert.equal(ran.length, 1); // OnLoad is one-shot: the loop needs the OnSuccess
});

test('polling: success of the called action schedules the next round', () => {
  const { clock, ran, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  const gen = s.currentGeneration;
  clock.advance(10000);
  // the refresh answers a re-render of the SAME screen: must not re-arm the OnLoad
  s.enterScreen('Floors|floors', LOOP, false);
  assert.equal(clock.pending.size, 0);
  assert.equal(s.actionSucceeded(gen, 'refresh'), 1);
  assert.equal(clock.pending.size, 1);
  clock.advance(10000);
  assert.equal(ran.length, 2);
  s.actionSucceeded(gen, 'refresh');
  clock.advance(10000);
  assert.equal(ran.length, 3);
});

test('polling: success of another action does not schedule anything', () => {
  const { clock, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  clock.advance(10000);
  assert.equal(s.actionSucceeded(s.currentGeneration, 'save'), 0);
  assert.equal(clock.pending.size, 0);
});

test('polling: an action dispatched on another screen does not schedule anything', () => {
  const { clock, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  const old = s.currentGeneration;
  s.enterScreen('Orders|orders', [], false); // the user moved on
  assert.equal(s.actionSucceeded(old, 'refresh'), 0);
  assert.equal(clock.pending.size, 0);
});

test('polling: navigating away drops what was pending', () => {
  const { clock, ran, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  s.enterScreen('Orders|orders', [], false);
  clock.advance(60000);
  assert.equal(ran.length, 0);
});

test('polling: a fresh navigation to the same screen re-arms once (no duplicated loops)', () => {
  const { clock, ran, s } = setup();
  s.enterScreen('Floors|floors', LOOP, true);
  s.enterScreen('Floors|floors', LOOP, true);
  assert.equal(clock.pending.size, 1);
  clock.advance(10000);
  assert.equal(ran.length, 1);
});

test('polling: stop() (unmount) cancels; a timer that fires anyway is ignored', () => {
  const clock = fakeTimer();
  const ran: string[] = [];
  let leaked: (() => void) | null = null;
  const leaky: PollTimer = { set: (fn, ms) => { leaked = fn; return clock.timer.set(fn, ms); }, clear: () => {} };
  const s = new PollingScheduler((a) => ran.push(a), leaky);
  s.enterScreen('Floors|floors', LOOP, true);
  s.stop();
  leaked!();
  assert.equal(ran.length, 0);
});

test('polling: timeoutMillis <= 0 on OnSuccess runs at once; OnLoad without delay is left to the caller', () => {
  const { clock, ran, s } = setup();
  s.enterScreen('X|x', [
    { type: 'OnLoad', actionId: 'search' },
    { type: 'OnSuccess', actionId: 'audit', calledActionId: 'save' },
  ], true);
  assert.equal(clock.pending.size, 0);
  assert.equal(ran.length, 0);
  s.actionSucceeded(s.currentGeneration, 'save');
  assert.deepEqual(ran, [{ actionId: 'audit', background: false }]);
});

test('polling: the condition is evaluated at fire time', () => {
  let live = false;
  const { clock, ran, s } = setup(() => live);
  s.enterScreen('X|x', [{ type: 'OnLoad', actionId: 'refresh', timeoutMillis: 100, condition: 'state.auto' }], true);
  clock.advance(100);
  assert.equal(ran.length, 0);
  live = true;
  s.enterScreen('X|x', [{ type: 'OnLoad', actionId: 'refresh', timeoutMillis: 100, condition: 'state.auto' }], true);
  clock.advance(100);
  assert.equal(ran.length, 1);
});
