/**
 * The hub link corpus (conformance/client/hub-links.json): what every renderer with a hub — this app
 * and the IntelliJ desktop app — accepts, refuses and makes of an address or a link, with the same
 * sentences. This parser is the reference: `HUB_LINKS_WRITE=true` rewrites the expectations from it
 * (review the diff), otherwise they must match. IntelliJ runs the same file (HubLinksConformanceTest).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { addLink, base64UrlEncode, encodeImportPayload, exportLink, normalizeBaseUrl, parseHubLink, sanitizeRoute, type ParseOptions } from './links.ts';

const CORPUS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../conformance/client/hub-links.json');

const dev: ParseOptions = { allowInsecure: true };

const addresses: [string, ParseOptions?][] = [
  ['acme.com'], ['  https://Acme.COM/crm/  '], ['https://acme.com/crm?x=1#y'], ['https://acme.com:443/a'],
  ['https://acme.com:8443'], ['localhost:8080', dev], ['http://acme.com'], ['http://localhost:8080/', dev],
  ['http://acme.com:80/x', dev], ['javascript:alert(1)'], ['data:text/html,<script>1</script>'], ['file:///etc/passwd'],
  ['mailto:a@b.com'], ['ftp://acme.com'], ['https://bank.com@evil.com'], ['https://user:pass@acme.com'],
  ['https://аcme.com'], ['https://acme.com/‮moc.live'], ['https://acme .com'], ['https://acme.com/\u0000'],
  ['https://acme.com:99999'], ['https://acme.com:0'], ['https://'], ['https://-acme.com'], ['https://acme.com/../admin'],
  ['https://acme.com/./a'], ['https://acme.com\\@evil.com'], [''], ['   '], ['x'.repeat(3000)], ['https://[::1]:8080'],
  ['https://xn--80ak6aa92e.com'], ['https://acme.com.'], ['https://acme.com:8080/'], ['acme.com:443'],
  ['https://a_b.com'], ['https://acme.com/a\\b'], ['https://acme.com/​x'], ['https://acme.com/crm/orders/7'],
];

const routes: (string | null)[] = [
  'orders/12', '/orders?x=1', '//evil.com', 'https://evil.com', 'javascript:alert(1)', '/a/../../b', '/a b', '', null,
  '  /x  ', '/a#b', '/a\\b', `/${'r'.repeat(600)}`, '/ok/..x',
];

const links: [string, ParseOptions?][] = [
  ['https://mateu.io/add?u=https%3A%2F%2Facme.com%2Fcrm&r=%2Forders%2F7'], ['https://www.mateu.io/add/?u=acme.com'],
  ['mateu://add?u=https://acme.com'], ['MATEU:///add?u=acme.com'], ['mateu://add?u=acme.com&r=https://evil.com'],
  ['mateu://add?u=acme.com&r=a&r=b'], [''], ['hello'], ['WIFI:S:home;T:WPA;P:secret;;'], ['https://evil.com/add?u=acme.com'],
  ['https://mateu.io/other?u=acme.com'], ['http://mateu.io/add?u=acme.com'], ['http://mateu.io/add?u=acme.com', dev],
  ['mateu://delete?u=acme.com'], ['mateu://add'], ['mateu://add?u=javascript:alert(1)'], ['mateu://add?u=https://bank.com@evil.com'],
  ['mateu://add?u=%E0%A4%A'], ['otpauth://totp/x?secret=abc'], ['mateu://add?u=a+b.com'],
  ['http://localhost:19010/add?u=http%3A%2F%2Flocalhost%3A8080', { allowInsecure: true, extraLinkHosts: ['localhost:19010'] }],
  ['http://localhost:19010/?u=x', { allowInsecure: true, extraLinkHosts: ['localhost:19010'] }],
  ['https://mateu.io/add?u=acme.com&u=https%3A%2F%2Facme.com%2F&u=javascript:x&u=b.io'],
  [exportLink(['https://acme.com/crm', 'https://demo.mateu.io/counter'])],
  [`mateu://import?d=${encodeImportPayload(['https://acme.com/crm', 'https://b.io'])}`],
  [`mateu://import?d=${encodeImportPayload(['https://héllo.com', 'b.io'])}`],
  [`mateu://import?d=${encodeImportPayload(Array.from({ length: 80 }, (_, i) => `https://h${i}.com`))}`],
  ['mateu://import?d=!!!'], ['mateu://import?d=a'], [`mateu://import?d=${base64UrlEncode('not json')}`],
  [`mateu://import?d=${base64UrlEncode('{"v":2,"u":["a.com"]}')}`], [`mateu://import?d=${base64UrlEncode('{"v":1,"u":"a.com"}')}`],
  [`mateu://import?d=${base64UrlEncode('{"v":1,"u":[1,2]}')}`], [`mateu://import?d=${base64UrlEncode('{"v":1,"u":["javascript:x"]}')}`],
  ['mateu://import'], ['https://mateu.io/import?d=' + encodeImportPayload(['a.com'])], ['mateu://add?d=' + encodeImportPayload(['a.com'])],
  [addLink('https://acme.com/crm', '/orders')], [`https://mateu.io/add?u=${'x'.repeat(9000)}`],
];

function expectations() {
  return {
    $comment:
      'Generated from frontend/app/react-native/src/hub/links.ts (the reference) by links.conformance.test.ts with HUB_LINKS_WRITE=true. Run by the React Native app and the IntelliJ desktop app (HubLinksConformanceTest).',
    addresses: addresses.map(([input, options]) => ({ input, ...(options ? { options } : {}), result: normalizeBaseUrl(input, options) })),
    routes: routes.map((input) => ({ input, result: sanitizeRoute(input) ?? null })),
    links: links.map(([input, options]) => ({ input, ...(options ? { options } : {}), result: parseHubLink(input, options) })),
    addLinks: [
      { baseUrl: 'https://acme.com/crm', route: 'orders', result: addLink('https://acme.com/crm', 'orders') },
      { baseUrl: 'https://acme.com', route: null, result: addLink('https://acme.com') },
      { baseUrl: 'https://acme.com', route: '//evil', result: addLink('https://acme.com', '//evil') },
    ],
  };
}

test('the hub link corpus matches the reference parser', () => {
  const expected = expectations();
  if (process.env.HUB_LINKS_WRITE === 'true') writeFileSync(CORPUS, `${JSON.stringify(expected, null, 2)}\n`);
  const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
  assert.deepEqual(corpus, JSON.parse(JSON.stringify(expected)));
});
