import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BuildSkew,
  backendKeyOf,
  buildSkew,
  isMateuForbidden,
  isStaleScreenError,
  rendererHeaderValue,
  setRendererVersion,
  skewTexts,
} from './buildSkew.ts';
import { toastLifetime } from './toastLifetime.ts';
import { MateuApiClient } from '../api/MateuApiClient.ts';

test('renderer header: name, app version and the wire this build speaks', () => {
  assert.equal(rendererHeaderValue('1.2.3', '3.0'), 'react-native/1.2.3 wire/3.0');
  setRendererVersion('');
  assert.equal(rendererHeaderValue(), 'react-native/unknown wire/3.0');
  setRendererVersion(' 1.0.0 ');
  assert.equal(rendererHeaderValue(), 'react-native/1.0.0 wire/3.0');
});

test('backend key: the url up to the /mateu/ segment', () => {
  assert.equal(backendKeyOf('https://a.com/app/mateu/v3/sync/orders'), 'https://a.com/app');
  assert.equal(backendKeyOf('http://x/mateu/v3/sse/_no_route'), 'http://x');
});

test('skew: first build is the baseline, a changed one on success is told ONCE', () => {
  const skew = new BuildSkew();
  assert.equal(skew.observe('k', { build: 'b1', ok: true }), 'none');
  assert.equal(skew.observe('k', { build: 'b1', ok: true }), 'none');
  assert.equal(skew.observe('k', { build: 'b2', ok: true }), 'updated');
  assert.equal(skew.observe('k', { build: 'b2', ok: true }), 'none');
  assert.equal(skew.observe('k', { build: 'b3', ok: true }), 'none');
  // another backend has its own baseline
  assert.equal(skew.observe('other', { build: 'z', ok: true }), 'none');
});

test('skew: no header → nothing; a failure that is not a Mateu 403 → nothing', () => {
  const skew = new BuildSkew();
  assert.equal(skew.observe('k', { build: null, ok: true }), 'none');
  assert.equal(skew.observe('k', { build: 'b1', ok: true }), 'none');
  assert.equal(skew.observe('k', { build: undefined, ok: true }), 'none');
  assert.equal(skew.observe('k', { build: 'b2', ok: false }), 'none');
  // ... and the "updated" notice is still due
  assert.equal(skew.observe('k', { build: 'b2', ok: true }), 'updated');
});

test('skew: a Mateu 403 from another build is a stale screen (and suppresses the updated notice)', () => {
  const skew = new BuildSkew();
  skew.observe('k', { build: 'b1', ok: true });
  assert.equal(skew.observe('k', { build: 'b2', ok: false, mateuForbidden: true }), 'stale');
  assert.equal(skew.observe('k', { build: 'b2', ok: true }), 'none');
  // same build (or no baseline yet) → a real refusal: unchanged behaviour
  const fresh = new BuildSkew();
  assert.equal(fresh.observe('k', { build: 'b1', ok: false, mateuForbidden: true }), 'none');
  assert.equal(fresh.observe('k', { build: 'b1', ok: false, mateuForbidden: true }), 'none');
});

test("Mateu's 403: Java's text, the ports' increment with messages; nothing else", () => {
  assert.equal(isMateuForbidden(403, 'Forbidden'), true);
  assert.equal(isMateuForbidden(403, '{"messages":[{"text":"Forbidden"}]}'), true);
  assert.equal(isMateuForbidden(403, '<html>proxy</html>'), false);
  assert.equal(isMateuForbidden(403, '{"messages":[]}'), false);
  assert.equal(isMateuForbidden(500, 'Forbidden'), false);
});

test('texts: en / es with the Reload action', () => {
  assert.equal(skewTexts('en-GB').updated, 'This app has been updated. Reload to use the latest version.');
  assert.equal(skewTexts('es-ES').stale, 'Esta pantalla ha cambiado desde que la abriste. Recarga para continuar.');
  assert.equal(skewTexts('es').reload, 'Recargar');
  assert.equal(skewTexts(undefined).reload, 'Reload');
});

test('a sticky notice stays until dismissed', () => {
  assert.equal(toastLifetime('warning', { sticky: true, undo: {} }), 0);
});

const okResponse = (build: string | null, status = 200, body = '{}') =>
  new Response(body, { status, headers: build ? { 'X-Mateu-Build': build } : {} });

test('client: sync calls carry X-Mateu-Renderer and report a redeploy once, a stale 403 instead of forbidden', async () => {
  buildSkew.clear();
  const original = globalThis.fetch;
  const sent: Record<string, string>[] = [];
  const answers = [okResponse('b1'), okResponse('b2'), okResponse('b2'), okResponse('b3', 403, 'Forbidden')];
  globalThis.fetch = (async (_url: string, init: { headers: Record<string, string> }) => {
    sent.push(init.headers);
    return answers.shift()!;
  }) as unknown as typeof fetch;
  const notices: string[] = [];
  try {
    const api = new MateuApiClient('http://skew-host/app', 's');
    api.onBuildNotice = (k) => notices.push(k);
    await api.initialLoad('/', {});
    await api.initialLoad('/', {});
    await api.initialLoad('/', {});
    await assert.rejects(api.initialLoad('/', {}), (e) => isStaleScreenError(e));
  } finally {
    globalThis.fetch = original;
  }
  assert.match(sent[0]['X-Mateu-Renderer'] ?? '', /^react-native\/\S+ wire\/3\.0$/);
  assert.deepEqual(notices, ['updated', 'stale']);
});

test('third-party REST sources never get X-Mateu-Renderer', async () => {
  const { readFileSync } = await import('node:fs');
  for (const file of ['./restFetch.ts', './restListing.ts']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /X-Mateu-Renderer|RENDERER_HEADER|rendererHeaderValue/);
  }
});
