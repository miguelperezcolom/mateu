import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { etaText, progressOf } from './taskCenter.ts';
import { CHROME_LANGUAGES, type ChromeLanguage } from './chromeLanguage.ts';

// How a running task's ETA reads (conformance/client/eta-format.json) — the same corpus the web,
// Redwood and IntelliJ suites run.

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/eta-format.json', import.meta.url)), 'utf8',
)) as { texts: Record<string, unknown>; cases: ({ etaSeconds: number | null } & Record<ChromeLanguage, string | null>)[] };

test('the corpus covers every language the app speaks', () => {
  assert.deepEqual(Object.keys(corpus.texts).sort(), [...CHROME_LANGUAGES].sort());
});

for (const c of corpus.cases) {
  test(`eta ${c.etaSeconds}`, () => {
    for (const lang of CHROME_LANGUAGES) assert.equal(etaText(c.etaSeconds, `${lang}-XX`), c[lang] ?? '', lang);
  });
}

test('the estimate travels on a running task only', () => {
  assert.equal(progressOf({ taskId: 't', state: 'running', etaSeconds: 90 })!.etaSeconds, 90);
  assert.equal(progressOf({ taskId: 't', state: 'done', etaSeconds: 90 })!.etaSeconds, null);
  assert.equal(progressOf({ taskId: 't', state: 'running' })!.etaSeconds, null);
});
