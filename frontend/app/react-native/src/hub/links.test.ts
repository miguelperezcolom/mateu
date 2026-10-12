import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addLink,
  base64UrlDecode,
  base64UrlEncode,
  domainOf,
  encodeImportPayload,
  exportLink,
  normalizeBaseUrl,
  parseHubLink,
  sanitizeRoute,
} from './links.ts';

const ok = (input: string, opts = {}) => {
  const r = normalizeBaseUrl(input, opts);
  assert.ok(r.ok, `${input} should be accepted: ${!r.ok ? r.reason : ''}`);
  return r.ok ? r.baseUrl : '';
};
const refused = (input: string, opts = {}) => {
  const r = normalizeBaseUrl(input, opts);
  assert.equal(r.ok, false, `${input} should be refused`);
};

// ── typed addresses ──────────────────────────────────────────────────────────

test('a bare domain becomes https, trailing slashes and query/fragment are dropped', () => {
  assert.equal(ok('acme.com'), 'https://acme.com');
  assert.equal(ok('  https://Acme.COM/crm/  '), 'https://acme.com/crm');
  assert.equal(ok('https://acme.com/crm?x=1#y'), 'https://acme.com/crm');
  assert.equal(ok('https://acme.com:443/a'), 'https://acme.com/a');
  assert.equal(ok('https://acme.com:8443'), 'https://acme.com:8443');
  assert.equal(ok('localhost:8080', { allowInsecure: true }), 'https://localhost:8080');
});

test('plain http is refused unless the dev flag allows it', () => {
  refused('http://acme.com');
  assert.equal(ok('http://localhost:8080/', { allowInsecure: true }), 'http://localhost:8080');
});

test('hostile addresses are refused', () => {
  refused('javascript:alert(1)');
  refused('data:text/html,<script>1</script>');
  refused('file:///etc/passwd');
  refused('mailto:a@b.com');
  refused('ftp://acme.com');
  refused('https://bank.com@evil.com'); // userinfo makes a domain read as another
  refused('https://user:pass@acme.com');
  refused('https://аcme.com'); // Cyrillic "а": homograph
  refused('https://acme.com/‮moc.live'); // right-to-left override
  refused('https://acme .com');
  refused('https://acme.com/\u0000');
  refused('https://acme.com:99999');
  refused('https://acme.com:0');
  refused('https://');
  refused('https://-acme.com');
  refused('https://acme.com/../admin');
  refused('https://acme.com\\@evil.com');
  refused('');
  refused('x'.repeat(3000));
  refused(undefined as unknown as string);
});

test('IPv6 literals and punycode domains are fine', () => {
  assert.equal(ok('https://[::1]:8080'), 'https://[::1]:8080');
  assert.equal(ok('https://xn--80ak6aa92e.com'), 'https://xn--80ak6aa92e.com');
});

test('domainOf shows host:port', () => {
  assert.equal(domainOf('https://acme.com:8443/crm'), 'acme.com:8443');
  assert.equal(domainOf('https://demo.mateu.io/counter'), 'demo.mateu.io');
});

// ── routes ───────────────────────────────────────────────────────────────────

test('routes stay relative to the mount', () => {
  assert.equal(sanitizeRoute('orders/12'), '/orders/12');
  assert.equal(sanitizeRoute('/orders?x=1'), '/orders?x=1');
  assert.equal(sanitizeRoute('//evil.com'), undefined);
  assert.equal(sanitizeRoute('https://evil.com'), undefined);
  assert.equal(sanitizeRoute('javascript:alert(1)'), undefined);
  assert.equal(sanitizeRoute('/a/../../b'), undefined);
  assert.equal(sanitizeRoute('/a b'), undefined);
  assert.equal(sanitizeRoute(''), undefined);
  assert.equal(sanitizeRoute(undefined), undefined);
});

// ── links ────────────────────────────────────────────────────────────────────

test('the universal link adds one UI, with an optional route', () => {
  assert.deepEqual(parseHubLink('https://mateu.io/add?u=https%3A%2F%2Facme.com%2Fcrm&r=%2Forders%2F7'), {
    kind: 'add',
    baseUrl: 'https://acme.com/crm',
    route: '/orders/7',
  });
  assert.deepEqual(parseHubLink('https://www.mateu.io/add/?u=acme.com'), { kind: 'add', baseUrl: 'https://acme.com' });
});

test('the custom scheme is accepted in both spellings', () => {
  assert.deepEqual(parseHubLink('mateu://add?u=https://acme.com'), { kind: 'add', baseUrl: 'https://acme.com' });
  assert.deepEqual(parseHubLink('MATEU:///add?u=acme.com'), { kind: 'add', baseUrl: 'https://acme.com' });
});

test('a hostile route is dropped, not the whole link', () => {
  assert.deepEqual(parseHubLink('mateu://add?u=acme.com&r=https://evil.com'), { kind: 'add', baseUrl: 'https://acme.com' });
});

test('links for somewhere else are invalid with a readable reason', () => {
  for (const raw of [
    '',
    'hello',
    'WIFI:S:home;T:WPA;P:secret;;',
    'https://evil.com/add?u=acme.com', // not our domain
    'https://mateu.io/other?u=acme.com',
    'http://mateu.io/add?u=acme.com', // our domain over http
    'mateu://delete?u=acme.com',
    'mateu://add', // no u
    'mateu://add?u=javascript:alert(1)',
    'mateu://add?u=https://bank.com@evil.com',
    'mateu://add?u=%E0%A4%A', // malformed escape
    'otpauth://totp/x?secret=abc',
  ]) {
    const r = parseHubLink(raw);
    assert.equal(r.kind, 'invalid', raw);
    if (r.kind === 'invalid') assert.ok(r.reason.length > 0);
  }
});

test('extra link hosts (the web build origin) are accepted, only on /add', () => {
  const opts = { allowInsecure: true, extraLinkHosts: ['localhost:19010'] };
  assert.deepEqual(parseHubLink('http://localhost:19010/add?u=http%3A%2F%2Flocalhost%3A8080', opts), {
    kind: 'add',
    baseUrl: 'http://localhost:8080',
  });
  assert.equal(parseHubLink('http://localhost:19010/?u=x', opts).kind, 'invalid');
});

// ── import / export ──────────────────────────────────────────────────────────

test('repeated u parameters are an import, deduplicated, bad ones counted', () => {
  const r = parseHubLink('https://mateu.io/add?u=acme.com&u=https%3A%2F%2Facme.com%2F&u=javascript:x&u=b.io');
  assert.deepEqual(r, { kind: 'import', baseUrls: ['https://acme.com', 'https://b.io'], rejected: 1 });
});

test('the export link round-trips through the parser', () => {
  const urls = ['https://acme.com/crm', 'https://demo.mateu.io/counter'];
  const link = exportLink(urls);
  assert.ok(link.startsWith('https://mateu.io/add?u='));
  assert.ok(!/token|secret/i.test(link));
  assert.deepEqual(parseHubLink(link), { kind: 'import', baseUrls: urls, rejected: 0 });
});

test('the compact import form round-trips, including unicode', () => {
  const urls = ['https://acme.com/crm', 'https://b.io'];
  assert.deepEqual(parseHubLink(`mateu://import?d=${encodeImportPayload(urls)}`), { kind: 'import', baseUrls: urls, rejected: 0 });
  for (const s of ['', 'a', 'ab', 'abc', 'héllo € 😀', JSON.stringify({ v: 1 })]) {
    assert.equal(base64UrlDecode(base64UrlEncode(s)), s);
  }
});

test('a damaged import payload is invalid', () => {
  for (const d of ['!!!', 'a', base64UrlEncode('not json'), base64UrlEncode('{"v":2,"u":["a.com"]}'), base64UrlEncode('{"v":1,"u":"a.com"}'), base64UrlEncode('{"v":1,"u":[1,2]}')]) {
    assert.equal(parseHubLink(`mateu://import?d=${d}`).kind, 'invalid', d);
  }
  assert.equal(parseHubLink('mateu://import').kind, 'invalid');
});

test('an import is capped', () => {
  const many = Array.from({ length: 80 }, (_, i) => `https://h${i}.com`);
  const r = parseHubLink(`mateu://import?d=${encodeImportPayload(many)}`);
  assert.equal(r.kind, 'import');
  if (r.kind === 'import') {
    assert.equal(r.baseUrls.length, 50);
    assert.equal(r.rejected, 30);
  }
});

test('addLink encodes base url and route', () => {
  assert.equal(addLink('https://acme.com/crm', 'orders'), 'https://mateu.io/add?u=https%3A%2F%2Facme.com%2Fcrm&r=%2Forders');
  assert.deepEqual(parseHubLink(addLink('https://acme.com/crm', '/orders')), { kind: 'add', baseUrl: 'https://acme.com/crm', route: '/orders' });
});
