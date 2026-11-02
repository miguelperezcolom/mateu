import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { interpolateUrl } from './expressions.ts';

/**
 * The source-template corpus (conformance/client/source-templates.json) on the phone: a REST
 * source url interpolated against the state gives the SAME url as the browser and the server's
 * proxy — Java SourceTemplateCorpusTest, libs/mateu and Redwood run the same file.
 */
interface Case { name: string; template: string; state: Record<string, unknown>; expected: string }
const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/source-templates.json', import.meta.url)), 'utf8',
)) as { cases: Case[] };

for (const c of corpus.cases) {
  test(`source templates corpus — ${c.name}`, () => {
    assert.equal(interpolateUrl(c.template, { state: c.state }), c.expected);
  });
}

test('a money value lands as its amount, not [object Object]', () => {
  assert.equal(
    interpolateUrl('https://h/x?v=${state.v}', { state: { v: { value: 12.5, currency: 'EUR' } } }),
    'https://h/x?v=12.5',
  );
});

test('encodeURIComponent(x) is encoded once, not twice', () => {
  assert.equal(
    interpolateUrl('https://h/x?q=${encodeURIComponent(state.q)}', { state: { q: 'a,b' } }),
    'https://h/x?q=a%2Cb',
  );
});

test('String(x) and string methods evaluate instead of sending nothing', () => {
  assert.equal(
    interpolateUrl("https://h/x?k=${String(state.y) + '-' + state.c.toLowerCase()}", { state: { y: 2026, c: 'AB' } }),
    'https://h/x?k=2026-ab',
  );
});
