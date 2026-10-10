import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// @ts-ignore — plain ESM script shared with CI
import { coverageProblems, wireTypesOf } from '../../scripts/parity-check.mjs';
// @ts-ignore
import { RN_COVERAGE, coverageTable } from '../../scripts/coverage.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..', '..', '..');

test('every wire component type has a native case and a coverage entry', () => {
  const wireTypes = wireTypesOf(readFileSync(join(repo, 'backend/shared/dtos/src/main/java/io/mateu/dtos/ComponentMetadataDto.java'), 'utf8'));
  assert.ok(wireTypes.length >= 115);
  const source = readFileSync(join(here, 'ComponentRenderer.tsx'), 'utf8');
  assert.deepEqual(coverageProblems({ wireTypes, coverage: RN_COVERAGE, source, parity: null }), []);
});

test('a wire type without a case is reported', () => {
  const problems = coverageProblems({ wireTypes: ['Grid', 'Nova'], coverage: { Grid: { status: 'full' }, Nova: { status: 'full' } }, source: "case 'Grid':", parity: null });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Nova has no case/);
});

test('an unclassified type, a phantom entry and a stale doc are reported', () => {
  const problems = coverageProblems({
    wireTypes: ['Grid'],
    coverage: { Ghost: { status: 'full' } },
    source: "case 'Grid':",
    parity: '<!-- rn-coverage:start -->\nold\n<!-- rn-coverage:end -->',
  });
  assert.equal(problems.length, 3);
});

test('the generated table lists every entry', () => {
  const table = coverageTable({ A: { status: 'full' }, B: { status: 'partial', note: 'n' } });
  assert.match(table, /\| `A` \| ✅ \|/);
  assert.match(table, /\| `B` \| 🟡 \| n \|/);
});
