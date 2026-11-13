import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_ACTIONS, DelayedBusy, HANDOVER_MS, SHOW_AFTER_MS, ServerActivity, isBackgroundRequest, type BusyTimer } from './serverActivity.ts';

/** A fake clock: timers fire only when advanced. */
function fakeTimer() {
  let now = 0;
  let next = 1;
  const pending = new Map<number, { at: number; fn: () => void }>();
  const timer: BusyTimer & { advance(ms: number): void } = {
    set: (fn, ms) => {
      const id = next++;
      pending.set(id, { at: now + ms, fn });
      return id;
    },
    clear: (h) => void pending.delete(h as number),
    now: () => now,
    advance(ms: number) {
      const until = now + ms;
      for (;;) {
        const due = [...pending.entries()].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        pending.delete(due[0]);
        now = due[1].at;
        due[1].fn();
      }
      now = until;
    },
  };
  return timer;
}

test('counts requests in flight and tells only the busy/idle transitions', () => {
  const activity = new ServerActivity();
  const heard: boolean[] = [];
  activity.subscribe((b) => heard.push(b));
  const a = activity.begin();
  const b = activity.begin();
  assert.equal(activity.inFlight, 2);
  assert.equal(activity.busy, true);
  a();
  assert.equal(activity.busy, true);
  b();
  assert.equal(activity.busy, false);
  assert.deepEqual(heard, [true, false]);
});

test('ending a request twice never drives the count negative', () => {
  const activity = new ServerActivity();
  const end = activity.begin();
  end();
  end();
  assert.equal(activity.inFlight, 0);
  const again = activity.begin();
  assert.equal(activity.busy, true);
  again();
  assert.equal(activity.busy, false);
});

test('track always uncounts its call: an answer, a failure', async () => {
  const activity = new ServerActivity();
  assert.equal(await activity.track(async () => 42), 42);
  assert.equal(activity.inFlight, 0);
  await assert.rejects(activity.track(async () => { throw new Error('HTTP 500'); }), /HTTP 500/);
  assert.equal(activity.inFlight, 0);
  let seenBusy = false;
  await activity.track(async () => { seenBusy = activity.busy; });
  assert.equal(seenBusy, true, 'busy while the call runs');
});

test('a throwing listener does not break the request it counts', async () => {
  const activity = new ServerActivity();
  activity.subscribe(() => { throw new Error('boom'); });
  assert.equal(await activity.track(async () => 'ok'), 'ok');
  assert.equal(activity.busy, false);
});

test('the long-lived background traffic is excluded by action id, or by its own flag', () => {
  for (const id of ['_live-updates', '_agent-channel', '_presence', '_push-register', '_push-unregister', '_keep-alive', '_progress-resume', '_progress-tasks']) {
    assert.ok(BACKGROUND_ACTIONS.has(id), id);
    assert.equal(isBackgroundRequest(id), true, id);
  }
  assert.equal(isBackgroundRequest('', false), false, 'a route load counts');
  assert.equal(isBackgroundRequest('save'), false);
  assert.equal(isBackgroundRequest('search'), false);
  assert.equal(isBackgroundRequest('_agent-pair'), false, 'the user asked for a pairing code');
  assert.equal(isBackgroundRequest('refresh', true), true, 'a polling refresh flags itself');
  assert.equal(isBackgroundRequest(undefined), false);
});

test('the indicator shows only after continuous busy, and goes the moment the server is idle', () => {
  const activity = new ServerActivity();
  const timer = fakeTimer();
  const busy = new DelayedBusy(activity, timer);
  const seen: boolean[] = [];
  busy.subscribe((v) => seen.push(v));

  // a fast answer: nothing shows
  const fast = activity.begin();
  timer.advance(SHOW_AFTER_MS - 1);
  fast();
  timer.advance(10_000);
  assert.deepEqual(seen, []);

  // a slow one: shows at 500 ms, hides at once when it answers
  const slow = activity.begin();
  timer.advance(SHOW_AFTER_MS - 1);
  assert.equal(busy.visible, false);
  timer.advance(1);
  assert.equal(busy.visible, true);
  slow();
  assert.equal(busy.visible, false);
  assert.deepEqual(seen, [true, false]);
});

test('overlapping requests are one busy period: one show, one announcement', () => {
  const activity = new ServerActivity();
  const timer = fakeTimer();
  const busy = new DelayedBusy(activity, timer);
  let announced = 0;
  busy.onShown(() => announced++);
  const a = activity.begin();
  timer.advance(300);
  const b = activity.begin(); // joins the same wait: the delay is not restarted
  timer.advance(200);
  assert.equal(busy.visible, true);
  a();
  timer.advance(5_000);
  assert.equal(busy.visible, true, 'still waiting for b');
  b();
  assert.equal(busy.visible, false);
  assert.equal(announced, 1, 'announced once, never repeated while waiting');
});

test('a call handed over right after the bar went comes straight back, not announced again', () => {
  const activity = new ServerActivity();
  const timer = fakeTimer();
  const busy = new DelayedBusy(activity, timer);
  let announced = 0;
  busy.onShown(() => announced++);
  const load = activity.begin();
  timer.advance(SHOW_AFTER_MS);
  load();
  timer.advance(HANDOVER_MS - 50);
  const search = activity.begin(); // the screen's OnLoad search
  assert.equal(busy.visible, true, 'no hide/show flicker between chained calls');
  search();
  assert.equal(announced, 1);
  // a NEW wait later on starts over: delay and announcement
  timer.advance(10_000);
  const later = activity.begin();
  assert.equal(busy.visible, false);
  timer.advance(SHOW_AFTER_MS);
  assert.equal(busy.visible, true);
  later();
  assert.equal(announced, 2);
});

test('a fast call right after a hidden fast call shows nothing (no handover without a shown bar)', () => {
  const activity = new ServerActivity();
  const timer = fakeTimer();
  const busy = new DelayedBusy(activity, timer);
  activity.begin()();
  activity.begin();
  assert.equal(busy.visible, false);
});

test('dispose stops listening and clears a pending show', () => {
  const activity = new ServerActivity();
  const timer = fakeTimer();
  const busy = new DelayedBusy(activity, timer);
  activity.begin();
  busy.dispose();
  timer.advance(SHOW_AFTER_MS * 2);
  assert.equal(busy.visible, false);
});
