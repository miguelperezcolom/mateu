import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { etaText, progressOf } from './taskCenter.ts';

// How a running task's ETA reads (conformance/client/eta-format.json) — the same corpus the web,
// Redwood and IntelliJ suites run.

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/eta-format.json', import.meta.url)), 'utf8',
)) as { cases: { etaSeconds: number | null; en: string | null; es: string | null }[] };

for (const c of corpus.cases) {
  test(`eta ${c.etaSeconds}`, () => {
    assert.equal(etaText(c.etaSeconds, 'en-GB'), c.en ?? '');
    assert.equal(etaText(c.etaSeconds, 'es-ES'), c.es ?? '');
  });
}

test('the estimate travels on a running task only', () => {
  assert.equal(progressOf({ taskId: 't', state: 'running', etaSeconds: 90 })!.etaSeconds, 90);
  assert.equal(progressOf({ taskId: 't', state: 'done', etaSeconds: 90 })!.etaSeconds, null);
  assert.equal(progressOf({ taskId: 't', state: 'running' })!.etaSeconds, null);
});
