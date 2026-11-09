import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TaskCenter, progressOf } from './taskCenter.ts';
import { LOST_TEXT, MAX_RESUME_ATTEMPTS, TaskReattach, type ReattachHost, type TaskApi } from './taskReattach.ts';
import type { RunActionParams } from '../api/MateuApiClient.ts';

type Json = Record<string, unknown>;
const running = (taskId: string, over: Json = {}) => ({ type: 'Progress', data: { taskId, title: 'Import', state: 'running', fraction: 0.4, ...over } });
const tick = () => new Promise((r) => setTimeout(r, 0));

function fakeApi(answer: (rq: RunActionParams) => unknown, stream: (rq: RunActionParams, on: (i: unknown) => void) => Promise<void> = async () => undefined) {
  const calls: RunActionParams[] = [];
  const api: TaskApi = {
    baseUrl: 'https://a.example',
    runAction: async (rq) => { calls.push(rq); return answer(rq); },
    runActionStream: async (rq, on) => { calls.push(rq); await stream(rq, on); },
  };
  return { api, calls };
}

function hostOf(tasks: TaskCenter) {
  const applied: Json[] = [];
  const navigated: string[] = [];
  const host: ReattachHost = { tasks, appState: { hotel: 'h1' }, applyPageLevel: (i) => applied.push(i), navigate: (r) => navigated.push(r) };
  return { host, applied, navigated };
}

test('a broken stream: _progress-tasks asks for the orphaned ids, the running ones resume and finish', async () => {
  const tasks = new TaskCenter();
  tasks.upsert(progressOf(running('t1').data)!);
  const { api, calls } = fakeApi(
    () => ({ commands: [running('t1', { text: 'Row 40', etaSeconds: 30 })] }),
    async (_rq, on) => {
      on({ commands: [running('t1', { text: 'Row 41' })], fragments: [{ ignored: true }] });
      on({ commands: [{ type: 'Progress', data: { taskId: 't1', title: 'Import', state: 'done', resultActions: [{ label: 'Open', route: '/r/1' }, { label: 'Run', actionId: 'x' }] } }] });
    },
  );
  const reattach = new TaskReattach();
  reattach.remember('t1', { api, route: '/orders', serverSideType: 'app.Orders' });
  const { host, applied, navigated } = hostOf(tasks);
  await reattach.reattach(host);
  await tick();
  assert.equal(calls[0].actionId, '_progress-tasks');
  assert.deepEqual(calls[0].parameters, { taskIds: ['t1'] });
  assert.equal(calls[0].route, '/orders');
  assert.equal(calls[0].serverSideType, 'app.Orders');
  assert.deepEqual(calls[0].appState, { hotel: 'h1' });
  assert.equal(calls[1].actionId, '_progress-resume');
  assert.deepEqual(calls[1].parameters, { taskId: 't1' });
  const task = tasks.get('t1')!;
  assert.equal(task.state, 'done');
  assert.equal(applied.length, 2, 'every increment hands its page-level parts to the session');
  assert.equal(reattach.has('t1'), false, 'a finished task is forgotten');
  // the task center already knew the task: its actions stay as the server sent them
  task.origin.runAction?.({ route: '/r/1' });
  assert.deepEqual(navigated, ['/r/1']);
});

test('a reattached task this device did not know offers only its route actions, and Cancel goes to its backend', async () => {
  const tasks = new TaskCenter();
  const { api, calls } = fakeApi((rq) => rq.actionId === '_progress-cancel'
    ? { commands: [{ type: 'Progress', data: { taskId: 't9', title: 'Import', state: 'cancelled' } }] }
    : { commands: [running('t9', { cancellable: true, resultActions: [{ label: 'Open', route: '/r' }, { label: 'Run', actionId: 'x' }] })] },
  async () => new Promise(() => undefined));
  const reattach = new TaskReattach();
  reattach.remember('t9', { api, route: '', serverSideType: null });
  await reattach.reattach(hostOf(tasks).host);
  const task = tasks.get('t9')!;
  assert.deepEqual(task.resultActions.map((a) => a.label), ['Open']);
  assert.equal(task.origin.retry, undefined, 'no screen to re-run it on');
  task.origin.cancel!();
  await tick();
  assert.ok(calls.some((c) => c.actionId === '_progress-cancel' && (c.parameters as Json).taskId === 't9'));
  assert.equal(tasks.get('t9')!.state, 'cancelled');
});

test('an id the server does not answer (expired, foreign) is forgotten and its task ends failed', async () => {
  const tasks = new TaskCenter();
  tasks.upsert(progressOf(running('gone').data)!);
  const { api, calls } = fakeApi(() => ({ commands: [] }));
  const reattach = new TaskReattach();
  reattach.remember('gone', { api, route: '', serverSideType: null });
  await reattach.reattach(hostOf(tasks).host);
  assert.equal(tasks.get('gone')!.state, 'failed');
  assert.equal(tasks.get('gone')!.error, LOST_TEXT);
  assert.equal(reattach.has('gone'), false);
  assert.equal(calls.filter((c) => c.actionId === '_progress-resume').length, 0);
});

test('offline: nothing is decided — the task stays running and is asked about at the next foreground', async () => {
  const tasks = new TaskCenter();
  tasks.upsert(progressOf(running('t1').data)!);
  let online = false;
  const { api, calls } = fakeApi(() => {
    if (!online) throw new Error('Network request failed');
    return { commands: [running('t1')] };
  }, async () => new Promise(() => undefined));
  const reattach = new TaskReattach();
  reattach.remember('t1', { api, route: '', serverSideType: null });
  const { host } = hostOf(tasks);
  await reattach.reattach(host);
  assert.equal(tasks.get('t1')!.state, 'running');
  assert.equal(reattach.has('t1'), true);
  online = true;
  await reattach.foreground(host);
  assert.equal(calls.filter((c) => c.actionId === '_progress-resume').length, 1);
});

test('a task a stream is still reading is not asked about; a resume that keeps breaking stops after a bound', async () => {
  const tasks = new TaskCenter();
  tasks.upsert(progressOf(running('t1').data)!);
  const { api, calls } = fakeApi(() => ({ commands: [running('t1')] }));
  const reattach = new TaskReattach();
  reattach.remember('t1', { api, route: '', serverSideType: null });
  reattach.streamStarted('t1');
  const { host } = hostOf(tasks);
  await reattach.reattach(host);
  assert.equal(calls.length, 0, 'its own stream is reading it');
  reattach.streamEnded('t1');
  await reattach.reattach(host);
  for (let i = 0; i < 10; i++) await tick();
  assert.equal(calls.filter((c) => c.actionId === '_progress-resume').length, MAX_RESUME_ATTEMPTS);
  assert.equal(tasks.get('t1')!.state, 'running', 'left for the foreground, not failed');
});

test('many tasks are asked about in batches of 50, per backend', async () => {
  const tasks = new TaskCenter();
  const { api, calls } = fakeApi(() => ({ commands: [] }));
  const other = fakeApi(() => ({ commands: [] }));
  const reattach = new TaskReattach();
  for (let i = 0; i < 60; i++) reattach.remember(`t${i}`, { api, route: '', serverSideType: null });
  reattach.remember('o1', { api: other.api, route: '', serverSideType: null });
  await reattach.reattach(hostOf(tasks).host);
  assert.deepEqual(calls.map((c) => ((c.parameters as Json).taskIds as string[]).length), [50, 10]);
  assert.deepEqual(other.calls.map((c) => (c.parameters as Json).taskIds), [['o1']]);
});
