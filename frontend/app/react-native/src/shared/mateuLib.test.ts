import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isBundleManifest, parseBundleManifest, resolveLoad, toSyncPath } from './mateuLib.ts';

// The code this app shares with the web (libs/mateu) must stay loadable HERE: by node's type
// stripping (these tests) and by Metro. Importing it at all is the first check — a Lit/DOM import,
// an alias at runtime or a TS `enum` in the closure fails this file before any assertion.

test('the shared closure loads and expands a definition with no server', () => {
  const state = parseBundleManifest({
    routes: { routes: [{ route: 'about', definition: 'about.yaml' }] },
    definitions: { 'about.yaml': { type: 'VerticalLayout', content: [{ type: 'Text', text: 'hi' }] } },
  } as never);
  const inc = resolveLoad(state, 'about', '') as unknown as { fragments: { component: { type: string; metadata: { type: string } } }[] };
  assert.equal(inc.fragments[0].component.type, 'ClientSide');
  assert.equal(inc.fragments[0].component.metadata.type, 'VerticalLayout');
});

test('sync paths: the same corpus as the web and Redwood (conformance/client/route-params.json)', () => {
  const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../conformance/client/route-params.json', import.meta.url)), 'utf8',
  )) as { syncPaths: { route: string; expected: string }[] };
  assert.ok(corpus.syncPaths.length > 0);
  for (const s of corpus.syncPaths) assert.equal(toSyncPath(s.route), s.expected, s.route);
});

test('the bundle shape: entries, or definitions with a route registry', () => {
  assert.equal(isBundleManifest({ entries: [] }), true);
  assert.equal(isBundleManifest({ definitions: {}, routes: { routes: [] } }), true);
  for (const no of [null, [], 'x', {}, { entries: 'x' }, { definitions: {} }, { name: 'app', icons: [] }]) {
    assert.equal(isBundleManifest(no), false, JSON.stringify(no));
  }
});
