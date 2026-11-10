import { test } from 'node:test';
import assert from 'node:assert/strict';
import { againstBase } from './backendUrl.ts';
import { hrefIntent } from './linkTarget.ts';
import { MateuSession, islandSession } from './MateuSession.ts';

test('a root-relative url the server sent goes to the backend, never to the app origin', () => {
  assert.equal(againstBase('/explorer/bay.svg', 'http://localhost:8650'), 'http://localhost:8650/explorer/bay.svg');
  assert.equal(againstBase('/explorer-api/planets?page=0', 'https://h.io/apps/x'), 'https://h.io/explorer-api/planets?page=0');
  assert.equal(againstBase('planets', 'https://h.io/apps/x/'), 'https://h.io/apps/x/planets');
  // absolute, data: and protocol-relative urls are left alone
  assert.equal(againstBase('https://cdn.io/a.png', 'http://localhost:8650'), 'https://cdn.io/a.png');
  assert.equal(againstBase('data:image/png;base64,xx', 'http://localhost:8650'), 'data:image/png;base64,xx');
  assert.equal(againstBase('//cdn.io/a.png', 'http://localhost:8650'), '//cdn.io/a.png');
  assert.equal(againstBase('', 'http://localhost:8650'), '');
  assert.equal(againstBase('/a', undefined), '/a');
});

test('a live session resolves relative REST sources against its backend (a static bundle re-points it)', () => {
  const session = new MateuSession('http://localhost:8650', 'sid', {}, null);
  assert.equal(session.sources.absolute('/explorer-api/planets'), 'http://localhost:8650/explorer-api/planets');
  session.openStaticBundle({ baseUrl: 'https://cdn.io/site', sources: [], actions: [], mockSources: false } as never);
  assert.equal(session.sources.absolute('/data/x.json'), 'https://cdn.io/data/x.json');
});

test('an embedded app mounted on the same server (`/apps/rooms`) runs against the host backend', () => {
  const host = new MateuSession('http://localhost:8650', 'sid', {}, null);
  const island = islandSession(host, '/apps/app-context');
  assert.equal(island.api.baseUrl, 'http://localhost:8650/apps/app-context');
  // its toasts and overlays are the app's
  const notes: string[] = [];
  host.notify = (_t, text) => notes.push(text);
  island.notify(null, 'held', 'info');
  assert.deepEqual(notes, ['held']);
  assert.equal(islandSession(host, ''), host);
});

test('a relative link opens in the app (target _blank or not); an absolute one leaves it', () => {
  assert.deepEqual(hrefIntent('/apps/app-context'), { kind: 'inApp', route: '/apps/app-context' });
  assert.deepEqual(hrefIntent('/x/behaviour/route-params/web/palma?nights=3'), { kind: 'inApp', route: '/x/behaviour/route-params/web/palma?nights=3' });
  assert.deepEqual(hrefIntent('https://mateu.io/x'), { kind: 'external', url: 'https://mateu.io/x' });
  assert.deepEqual(hrefIntent('//mateu.io/x'), { kind: 'external', url: 'https://mateu.io/x' });
  assert.deepEqual(hrefIntent('#top'), { kind: 'none' });
  assert.deepEqual(hrefIntent(''), { kind: 'none' });
});
