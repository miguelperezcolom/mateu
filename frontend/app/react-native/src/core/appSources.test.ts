import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contextOptionsOf, markReadVars, notificationsOf, runAppSource, searchHitsOf } from './appSources.ts';
import { RestSourceCatalogue } from './restFetch.ts';

const catalogue = () => {
  const c = new RestSourceCatalogue();
  c.register([
    { name: 'inbox', source: { url: 'https://x/inbox', itemsPath: 'content' }, fields: { text: 'missionName', when: 'dueDate' } },
    { name: 'find', source: { url: 'https://x/s?q=${state.searchText}', itemsPath: 'content' }, fields: { label: 'name', description: 'subtitle', category: 'kind' } },
    { name: 'hidden', source: { url: 'https://x/h', proxy: true } },
    { name: 'opts', source: { url: 'https://x/o', valuePath: 'id', labelPath: 'name' } },
  ]);
  return c;
};

test('an inbox entry reads each field through the source\'s field map; no `unread` means unread', () => {
  const [n] = notificationsOf({ content: [{ id: 7, title: 'T', missionName: 'Apollo', dueDate: '2026-01-01', route: 'tasks/7' }] }, { ref: 'inbox' }, catalogue());
  assert.deepEqual(n, { id: '7', title: 'T', text: 'Apollo', route: 'tasks/7', unread: true, when: '2026-01-01' });
});

test('a search hit with nowhere to go is dropped', () => {
  const hits = searchHitsOf({ content: [{ name: 'Apollo 11', subtitle: 's', kind: 'Mission', route: 'missions/1' }, { name: 'none' }] }, { ref: 'find' }, catalogue());
  assert.deepEqual(hits, [{ label: 'Apollo 11', description: 's', route: 'missions/1', category: 'Mission' }]);
});

test('a picker\'s options read its value and label paths', () => {
  assert.deepEqual(contextOptionsOf([{ id: 1, name: 'A' }], { ref: 'opts' }, catalogue()), [{ value: '1', label: 'A' }]);
});

test('a proxied source goes through _appsource naming the role, never a url', async () => {
  let sent: Record<string, unknown> | undefined;
  const api = { runAction: async (rq: Record<string, unknown>) => { sent = rq; return { appData: { _restfetch: [1] } }; } };
  const out = await runAppSource({ api, sources: catalogue(), appState: {} }, 'notifications', { ref: 'hidden' }, { a: 1 });
  assert.deepEqual(out, [1]);
  assert.equal(sent?.['actionId'], '_appsource');
  assert.deepEqual(sent?.['parameters'], { a: 1, _appSource: 'notifications' });
});

test('a refused proxied source is an error, not an empty answer', async () => {
  const api = { runAction: async () => ({ appData: { _restfetchError: { message: 'nope' } } }) };
  await assert.rejects(runAppSource({ api, sources: catalogue(), appState: {} }, 'notifications', { ref: 'hidden' }, {}), /nope/);
});

test('a direct source interpolates its url with the variables', async () => {
  const seen: string[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (u: string) => { seen.push(String(u)); return { ok: true, status: 200, text: async () => '{"content":[]}', json: async () => ({ content: [] }) }; }) as never;
  try {
    await runAppSource({ api: { runAction: async () => ({}) }, sources: catalogue(), appState: {} }, 'globalSearch', { ref: 'find' }, { searchText: 'a b' });
  } finally { globalThis.fetch = original; }
  assert.equal(seen[0], 'https://x/s?q=a%20b');
});

test('mark as read variables', () => {
  assert.deepEqual(markReadVars(['1', '2'], false), { ids: '1,2', id: '1', all: false });
});
