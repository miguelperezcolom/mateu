import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { foldoutOpenStates, type FoldoutFitOptions, type FoldoutFitPanel } from './foldoutFit.ts';

// The foldout auto-open corpus (conformance/client/foldout-auto.json) — the same file the web,
// Redwood and IntelliJ suites run.

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/foldout-auto.json', import.meta.url)), 'utf8',
)) as {
  defaults: FoldoutFitOptions;
  cases: { name: string; available: number | null; options?: FoldoutFitOptions; panels: FoldoutFitPanel[]; expected: boolean[] }[];
};

for (const c of corpus.cases) {
  test(`foldout auto-open: ${c.name}`, () => {
    assert.deepEqual(foldoutOpenStates(c.panels, c.available, { ...corpus.defaults, ...c.options }), c.expected);
  });
}
