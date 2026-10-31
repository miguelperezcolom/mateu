import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvedPreviewOf, withoutResolvedMicroFrontends } from './resolvedMicroFrontends.ts';
import { snapshotOf } from './screenSnapshots.ts';

const answer = { fragments: [{ targetComponentId: 'mfe_x', component: { type: 'ClientSide', metadata: { type: 'Text', text: 'hi' } } }] };

test('a micro frontend the host resolved is painted from its answer, against its own route and type', () => {
  const preview = resolvedPreviewOf({ type: 'MicroFrontend', baseUrl: 'https://r', route: '/w', consumedRoute: '', serverSideType: 'R.W', resolved: answer });
  assert.deepEqual(preview, { increment: answer, route: '/w', consumedRoute: '', serverSideType: 'R.W' });
});

test('one without an answer loads as always', () => {
  assert.equal(resolvedPreviewOf({ type: 'MicroFrontend', baseUrl: 'https://r', route: '/w' }), undefined);
});

test('the device never keeps a remote answer the host embedded', () => {
  const host = {
    fragments: [{ targetComponentId: 'page', component: { type: 'ClientSide', children: [
      { type: 'ClientSide', metadata: { type: 'MicroFrontend', baseUrl: 'https://r', route: '/w', resolved: answer } },
    ] } }],
  };
  const snapshot = snapshotOf(host) as any;
  assert.deepEqual(snapshot.fragments[0].component.children[0].metadata, { type: 'MicroFrontend', baseUrl: 'https://r', route: '/w' });
  assert.ok('resolved' in (host.fragments[0].component.children[0].metadata as any), 'the answer itself is not touched');
  const plain = { a: [{ type: 'Text' }] };
  assert.equal(withoutResolvedMicroFrontends(plain), plain);
});
