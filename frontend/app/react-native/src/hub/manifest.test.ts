import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchManifest, parseManifest, resolveIcon, resolveMount, versionGate } from './manifest.ts';

const BASE = 'https://acme.com/crm';

test('the manifest keeps the Mateu release serving the UI — only a release', () => {
  assert.equal(parseManifest({ name: 'x', mateuVersion: '3.0-beta.33' }, BASE).mateuVersion, '3.0-beta.33');
  assert.equal(parseManifest({ name: 'x', mateuVersion: '3.0.0b33' }, BASE).mateuVersion, '3.0.0b33');
  assert.equal(parseManifest({ name: 'x', mateuVersion: '0.0.1-MATEU' }, BASE).mateuVersion, undefined);
  assert.equal(parseManifest({ name: 'x', mateuVersion: '<script>' }, BASE).mateuVersion, undefined);
  assert.equal(parseManifest({ name: 'x', mateuVersion: 3 }, BASE).mateuVersion, undefined);
});

test('a full manifest is parsed', () => {
  const m = parseManifest(
    {
      name: 'Acme CRM',
      shortName: 'CRM',
      icon: 'https://cdn.acme.com/icon.png?v=2',
      themeColor: '#1F6FEB',
      wireVersion: '3',
      minAppVersion: '1.0.0',
      auth: { type: 'oidc', issuer: 'https://auth.acme.com/realms/acme/', clientId: 'mateu-mobile', scopes: ['openid', 'profile'] },
    },
    BASE,
  );
  assert.equal(m.name, 'Acme CRM');
  assert.equal(m.shortName, 'CRM');
  assert.equal(m.icon, 'https://cdn.acme.com/icon.png?v=2');
  assert.equal(m.themeColor, '#1f6feb');
  assert.equal(m.wireVersion, '3');
  assert.equal(m.minAppVersion, '1.0.0');
  assert.deepEqual(m.auth?.scopes, ['openid', 'profile']);
  assert.equal(m.auth?.issuer, 'https://auth.acme.com/realms/acme');
});

test('junk fields are dropped and the name falls back to the domain', () => {
  const m = parseManifest(
    {
      name: '  ',
      icon: 'javascript:alert(1)',
      themeColor: 'red; background:url(x)',
      minAppVersion: 'latest',
      auth: { type: 'saml', issuer: 'x' },
    },
    BASE,
  );
  assert.deepEqual(m, { name: 'acme.com' });
  assert.deepEqual(parseManifest(null, BASE), { name: 'acme.com' });
  assert.deepEqual(parseManifest([1, 2], BASE), { name: 'acme.com' });
});

test('names are cleaned of control/bidi characters and capped', () => {
  const m = parseManifest({ name: 'Bank‮\u0000 of   things'.padEnd(200, 'x') }, BASE);
  assert.ok(!/[\u0000‮]/.test(m.name));
  assert.ok(m.name.startsWith('Bank of things'));
  assert.equal(m.name.length, 60);
});

test('an http identity provider is refused (passwords go there) unless dev', () => {
  const raw = { name: 'X', auth: { type: 'oidc', issuer: 'http://id.acme.com', clientId: 'c' } };
  assert.equal(parseManifest(raw, BASE).auth, undefined);
  assert.equal(parseManifest(raw, BASE, true).auth?.issuer, 'http://id.acme.com');
});

test('icons: relative resolved against the base, raster data URIs ok, svg/script/credentials refused', () => {
  assert.equal(resolveIcon('/static/i.png', BASE), 'https://acme.com/static/i.png');
  assert.equal(resolveIcon('i.png', BASE), 'https://acme.com/crm/i.png');
  assert.equal(resolveIcon('data:image/png;base64,iVBORw0KGgo=', BASE), 'data:image/png;base64,iVBORw0KGgo=');
  assert.equal(resolveIcon('data:image/svg+xml;base64,PHN2Zz4=', BASE), undefined);
  assert.equal(resolveIcon('data:text/html,<script>', BASE), undefined);
  assert.equal(resolveIcon('//evil.com/i.png', BASE), undefined);
  assert.equal(resolveIcon('https://u:p@evil.com/i.png', BASE), undefined);
  assert.equal(resolveIcon('http://cdn.acme.com/i.png', BASE), undefined);
  assert.equal(resolveIcon('http://cdn.acme.com/i.png', BASE, true), 'http://cdn.acme.com/i.png');
  assert.equal(resolveIcon(42, BASE), undefined);
});

test('version gate: wire major and minAppVersion', () => {
  assert.deepEqual(versionGate({ name: 'x' }, '1.0.0'), { ok: true });
  assert.deepEqual(versionGate({ name: 'x', wireVersion: '3', minAppVersion: '1.0' }, '1.0.0'), { ok: true });
  assert.deepEqual(versionGate({ name: 'x', wireVersion: '3.4' }, '1.0.0'), { ok: true });
  assert.equal(versionGate({ name: 'x', wireVersion: '4' }, '1.0.0').ok, false);
  assert.equal(versionGate({ name: 'x', wireVersion: '2' }, '1.0.0').ok, false);
  const g = versionGate({ name: 'x', minAppVersion: '1.2.0' }, '1.0.9');
  assert.equal(g.ok, false);
  if (!g.ok) assert.match(g.reason, /1\.2\.0/);
  assert.deepEqual(versionGate({ name: 'x', minAppVersion: '1.2.0' }, '1.10.0'), { ok: true });
});

const respond = (status: number, body: unknown, json = true) => async (url: string) => {
  respond.lastUrl = url;
  return { ok: status >= 200 && status < 300, status, json: async () => (json ? body : JSON.parse('{x')) };
};
respond.lastUrl = '';

test('fetchManifest: ok, missing (older server), error, not JSON, offline', async () => {
  const ok = await fetchManifest(BASE, respond(200, { name: 'Acme' }));
  assert.equal(respond.lastUrl, 'https://acme.com/crm/mateu/v3/manifest');
  assert.deepEqual(ok, { ok: true, manifest: { name: 'Acme' } });
  const missing = await fetchManifest(BASE, respond(404, null));
  assert.deepEqual(missing, { ok: true, manifest: { name: 'acme.com' }, missing: true });
  const err = await fetchManifest(BASE, respond(500, null));
  assert.equal(err.ok, false);
  const notJson = await fetchManifest(BASE, respond(200, null, false));
  assert.equal(notJson.ok, false);
  const offline = await fetchManifest(BASE, async () => {
    throw new TypeError('Network request failed');
  });
  assert.deepEqual(offline.ok ? null : offline.offline, true);
});

// ── static UIs (no server): a mateu-bundle bundle on any static host ──

const STATIC = 'http://192.168.1.5:3000';
const bundleJson = JSON.stringify({
  entries: [{
    route: '/', syncPath: '_no_route', ok: true,
    json: JSON.stringify({ fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', title: 'Shop', accentColor: '#0a7', homeRoute: '/home' } } }] }),
  }],
  routes: { routes: [{ route: '' }] },
});
/** A static host: the files it has, everything else its SPA fallback (index.html, 200). */
const staticHost = (files: Record<string, string>) => async (url: string) => {
  const path = url.slice(STATIC.length);
  const body = files[path] ?? '<!doctype html><html><body>app</body></html>';
  return { ok: true, status: 200, json: async () => JSON.parse(body), text: async () => body };
};

test('a static UI publishing its manifest file: it names the bundle it runs from', async () => {
  const r = await fetchManifest(STATIC, staticHost({
    '/mateu/v3/manifest': JSON.stringify({ name: 'Shop', themeColor: '#00aa77', wireVersion: '3.0', bundle: 'manifest.json' }),
  }) as never, { allowInsecure: true });
  assert.equal(r.ok && r.manifest.name, 'Shop');
  assert.equal(r.ok && r.manifest.bundle, 'manifest.json');
});

test('an older bundle (no manifest file, the SPA fallback answers): recognised by its manifest.json, named from its shell', async () => {
  const r = await fetchManifest(STATIC, staticHost({ '/manifest.json': bundleJson }) as never, { allowInsecure: true });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.manifest.name, 'Shop');
  assert.equal(r.manifest.themeColor, '#0a7');
  assert.equal(r.manifest.bundle, 'manifest.json');
  assert.ok('bundle' in r && r.bundle, 'the bundle fetched while recognising it is handed over');
  assert.equal('missing' in r, false);
});

test('a site that is neither a Mateu server nor a bundle is still refused', async () => {
  const r = await fetchManifest(STATIC, staticHost({}) as never, { allowInsecure: true });
  assert.equal(r.ok, false);
});

test('a manifest cannot point the app at another host through `bundle`', () => {
  for (const bundle of ['https://evil.example/manifest.json', '//evil.example/m.json', '../manifest.json', 'manifest.js', 42]) {
    assert.equal(parseManifest({ name: 'X', bundle }, STATIC, true).bundle, undefined, String(bundle));
  }
  assert.equal(parseManifest({ name: 'X' }, STATIC, true).bundle, undefined); // a server: no bundle
});

// ── a PAGE url (a browser's "QR code for this page"): the mount is found by asking upwards ──

test('resolveMount: a page url finds the UI it belongs to and keeps the screen as the route', async () => {
  const asked: string[] = [];
  const server = (mount: string) => async (url: string) => {
    asked.push(url);
    const isManifest = url === `${mount}/mateu/v3/manifest`;
    // any other path: the SPA fallback answers the index page (200, not JSON)
    return isManifest
      ? { ok: true, status: 200, json: async () => ({ name: 'Star Wars' }) }
      : { ok: true, status: 200, json: async () => JSON.parse('<html>'), text: async () => '<html>' };
  };
  const root = await resolveMount('https://starwars.example.com/people/1', server('https://starwars.example.com'));
  assert.equal(root.baseUrl, 'https://starwars.example.com');
  assert.equal(root.route, 'people/1');
  assert.deepEqual(root.fetched, { ok: true, manifest: { name: 'Star Wars' } });
  assert.equal(asked[0], 'https://starwars.example.com/people/1/mateu/v3/manifest');

  const mounted = await resolveMount('https://acme.com/crm/orders', server('https://acme.com/crm'));
  assert.equal(mounted.baseUrl, 'https://acme.com/crm');
  assert.equal(mounted.route, 'orders');

  const bare = await resolveMount('https://acme.com/crm', server('https://acme.com/crm'));
  assert.deepEqual([bare.baseUrl, bare.route], ['https://acme.com/crm', undefined]);
});

test('resolveMount: nothing answers → the url itself; a failed deep try does not stop the walk', async () => {
  const none = await resolveMount('https://example.com/a/b', respond(404, null));
  assert.equal(none.baseUrl, 'https://example.com/a/b');
  assert.equal(none.fetched.ok && 'missing' in none.fetched, true);
  let tries = 0;
  const down = await resolveMount('https://down.example.com/a/b/c', async () => {
    tries++;
    throw new TypeError('Network request failed');
  });
  assert.equal(tries, 4);
  assert.equal(down.fetched.ok, false);
  // the web build: the deep path is the static host's index page WITHOUT CORS (a fetch TypeError),
  // the root answers the manifest
  const corsy = await resolveMount('https://rw.example.com/films', async (url: string) => {
    if (url !== 'https://rw.example.com/mateu/v3/manifest') throw new TypeError('Failed to fetch');
    return { ok: true, status: 200, json: async () => ({ name: 'Star Wars' }) };
  });
  assert.deepEqual([corsy.baseUrl, corsy.route], ['https://rw.example.com', 'films']);
});
