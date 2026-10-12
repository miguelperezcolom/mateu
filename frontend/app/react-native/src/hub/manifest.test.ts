import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchManifest, parseManifest, resolveIcon, versionGate } from './manifest.ts';

const BASE = 'https://acme.com/crm';

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
