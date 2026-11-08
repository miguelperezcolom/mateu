import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedText, finishedAnnouncement, progressA11yValue, progressOf, RECENT_FINISHED, stepCountText, stripLabel, TaskCenter } from './taskCenter.ts';

const progress = (over: Record<string, unknown> = {}) =>
  progressOf({ taskId: 't1', title: 'Import', text: 'Starting...', state: 'running', blocking: true, fraction: null, ...over })!;

test('a Progress command is read whole; a command without taskId is none', () => {
  const p = progressOf({ taskId: 'a', title: 'T', fraction: 1.7, done: 3, total: 10, state: 'done', cancellable: true, resultActions: [{ label: 'Open', route: '/r' }, null] });
  assert.equal(p!.fraction, 1, 'clamped');
  assert.equal(p!.state, 'done');
  assert.equal(p!.cancellable, true);
  assert.deepEqual(p!.resultActions, [{ label: 'Open', route: '/r' }]);
  assert.equal(progressOf({ title: 'x' }), null);
  assert.equal(progressOf(null), null);
  assert.equal(progressOf({ taskId: 'b', state: 'weird' })!.state, 'running');
});

test('upsert by taskId: started once, then updates, then finished once', () => {
  const center = new TaskCenter(() => 1000);
  assert.equal(center.upsert(progress())?.kind, 'started');
  assert.equal(center.upsert(progress({ text: 'Row 1', fraction: 0.5 })), null);
  assert.equal(center.list().length, 1, 'one task, not two');
  assert.equal(center.get('t1')!.text, 'Row 1');
  assert.equal(center.upsert(progress({ state: 'done', text: 'All done' }))?.kind, 'finished');
  assert.equal(center.upsert(progress({ state: 'done' })), null, 'a repeated end says nothing');
  // a late running step does not bring a finished task back
  assert.equal(center.upsert(progress({ state: 'running', text: 'late' })), null);
  assert.equal(center.get('t1')!.state, 'done');
});

test('several tasks at once, counted', () => {
  const center = new TaskCenter();
  center.upsert(progress({ taskId: 'a', blocking: false }));
  center.upsert(progress({ taskId: 'b', blocking: false }));
  center.upsert(progress({ taskId: 'c', blocking: false, state: 'failed' }));
  assert.deepEqual(center.counts(), { running: 2, finished: 1, failed: 1 });
  assert.equal(stripLabel(center.counts()), '2 tasks running');
  assert.equal(stripLabel({ running: 1, finished: 0 }), '1 task running');
  assert.equal(stripLabel({ running: 0, finished: 3 }), '3 tasks finished');
});

test('a blocking task is the modal until sent to the background — only when it allows it', () => {
  const center = new TaskCenter();
  center.upsert(progress({ taskId: 'bg', blocking: false }));
  center.upsert(progress({ taskId: 'm', blocking: true, backgroundable: false }));
  assert.equal(center.blocking()!.taskId, 'm');
  assert.equal(center.moveToBackground('m'), false, 'not backgroundable while running');
  center.upsert(progress({ taskId: 'm', blocking: true, state: 'done' }));
  assert.equal(center.blocking()!.taskId, 'm', 'its outcome stays on screen');
  assert.equal(center.moveToBackground('m'), true, 'closed once finished');
  assert.equal(center.blocking(), undefined);
  center.upsert(progress({ taskId: 'n', blocking: true, backgroundable: true }));
  assert.equal(center.moveToBackground('n'), true);
  center.upsert(progress({ taskId: 'n', blocking: true, backgroundable: true, text: 'next' }));
  assert.equal(center.blocking(), undefined, 'a step does not bring it back to the modal');
});

test('only the most recent finished tasks are kept; running ones never go', () => {
  let clock = 0;
  const center = new TaskCenter(() => ++clock);
  center.upsert(progress({ taskId: 'live', blocking: false }));
  for (let i = 0; i < RECENT_FINISHED + 3; i++) center.upsert(progress({ taskId: `f${i}`, state: 'done' }));
  const finished = center.list().filter((t) => t.state !== 'running');
  assert.equal(finished.length, RECENT_FINISHED);
  assert.ok(!center.get('f0') && center.get(`f${RECENT_FINISHED + 2}`));
  assert.ok(center.get('live'));
  center.dismiss('live');
  assert.ok(center.get('live'), 'a running task cannot be dismissed');
  center.clearFinished();
  assert.equal(center.list().length, 1);
});

test('a stream that ended without saying so leaves its running tasks failed', () => {
  const center = new TaskCenter();
  center.upsert(progress({ taskId: 'x' }));
  center.upsert(progress({ taskId: 'y', state: 'done' }));
  const events = center.failRunning(['x', 'y', 'unknown'], 'Connection lost');
  assert.equal(events.length, 1);
  assert.equal(center.get('x')!.state, 'failed');
  assert.equal(center.get('x')!.error, 'Connection lost');
  assert.equal(center.get('y')!.state, 'done');
});

test('origin closures (cancel / retry) survive the updates that do not carry them', () => {
  const center = new TaskCenter();
  let cancelled = 0;
  center.upsert(progress(), { cancel: () => cancelled++ });
  center.upsert(progress({ text: 'step' }));
  center.get('t1')!.origin.cancel!();
  assert.equal(cancelled, 1);
});

test('texts: count, elapsed, announcement, accessible value', () => {
  assert.equal(stepCountText({ done: 12, total: 300 }), '12 of 300');
  assert.equal(stepCountText({ done: null, total: null }), '');
  assert.equal(elapsedText(0, 45_000), '45 s');
  assert.equal(elapsedText(0, 185_000), '3 min 05 s');
  assert.equal(elapsedText(0, 3_720_000), '1 h 02 min');
  assert.equal(finishedAnnouncement({ title: 'Import', state: 'failed', text: '', error: 'Bad row' }), 'Import failed: Bad row');
  assert.equal(finishedAnnouncement({ title: 'Import', state: 'done', text: '3 rows', error: null }), 'Import finished: 3 rows');
  assert.deepEqual(progressA11yValue({ fraction: 0.42, done: null, total: null, text: '' }), { min: 0, max: 100, now: 42 });
  assert.deepEqual(progressA11yValue({ fraction: null, done: null, total: null, text: 'Working' }), { text: 'Working' });
  assert.deepEqual(progressA11yValue({ fraction: 0.5, done: 1, total: 2, text: '' }), { min: 0, max: 100, now: 50, text: '1 of 2' });
});
