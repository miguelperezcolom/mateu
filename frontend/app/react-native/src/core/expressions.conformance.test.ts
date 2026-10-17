import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evaluateExpression } from './expressions.ts';

// The client conformance corpus (conformance/client/expressions.json) — the same file the web,
// Redwood and IntelliJ suites run. `expected` is the web reference; `overrides.rn` is a divergence
// the corpus states with its reason.

interface Case {
  name: string;
  expr: string;
  context?: Record<string, unknown>;
  expected: unknown;
  overrides?: Record<string, { expected: unknown; why: string }>;
}
const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/expressions.json', import.meta.url)), 'utf8',
)) as { context: Record<string, unknown>; cases: Case[] };

const isMarker = (v: unknown, key: string): boolean =>
  !!v && typeof v === 'object' && (v as Record<string, unknown>)[key] === true;

for (const c of corpus.cases) {
  test(`expression corpus: ${c.name} — ${c.expr}`, () => {
    const expected = c.overrides?.rn ? c.overrides.rn.expected : c.expected;
    const run = () => evaluateExpression(c.expr, c.context ?? corpus.context);
    if (isMarker(expected, '$error')) assert.throws(run);
    else if (isMarker(expected, '$undefined')) assert.equal(run(), undefined);
    else assert.deepEqual(run(), expected);
  });
}
