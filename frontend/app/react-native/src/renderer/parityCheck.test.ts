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
/** A minimal ComponentRenderer switch around the given cases. */
const SW = (cases: string) => `switch (metaType) {\n    ${cases}\n    default: {\n      return <Text>Unsupported component: {metaType}</Text>;\n    }\n  }`;
const repo = join(here, '..', '..', '..', '..', '..');

test('every wire component type has a native case and a coverage entry', () => {
  const { produced: wireTypes, deprecated } = wireTypesOf(readFileSync(join(repo, 'backend/shared/uidl/wire-schema.json'), 'utf8'));
  assert.ok(wireTypes.length >= 114);
  // registered but produced by no server: not required (RN still draws them)
  assert.deepEqual([...deprecated].sort(), ['Result', 'Stepper']);
  const source = readFileSync(join(here, 'ComponentRenderer.tsx'), 'utf8');
  assert.deepEqual(coverageProblems({ wireTypes, deprecated, coverage: RN_COVERAGE, source, parity: null }), []);
});

test('a deprecated wire type is neither required nor a phantom', () => {
  assert.deepEqual(coverageProblems({ wireTypes: ['Grid'], deprecated: ['Old'], coverage: { Grid: { status: 'full' }, Old: { status: 'full' } }, source: SW("case 'Grid': return <Grid />;"), parity: null }), []);
  assert.deepEqual(coverageProblems({ wireTypes: ['Grid'], deprecated: ['Old'], coverage: { Grid: { status: 'full' } }, source: SW("case 'Grid': return <Grid />;"), parity: null }), []);
});

test('a wire type without a case is reported', () => {
  const problems = coverageProblems({ wireTypes: ['Grid', 'Nova'], coverage: { Grid: { status: 'full' }, Nova: { status: 'full' } }, source: SW("case 'Grid': return <Grid />;"), parity: null });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Nova has no case/);
});

test('a case outside the switch, or one that only renders a placeholder, is reported', () => {
  const coverage = { Grid: { status: 'full' }, Nova: { status: 'full' } };
  const outside = coverageProblems({ wireTypes: ['Grid', 'Nova'], coverage, source: "// case 'Nova': someday\n" + SW("case 'Grid': return <Grid />;"), parity: null });
  assert.equal(outside.length, 1);
  assert.match(outside[0], /Nova has no case/);
  const placeholder = coverageProblems({ wireTypes: ['Grid', 'Nova'], coverage, source: SW("case 'Grid': return <Grid />;\n    case 'Nova': return <Text>Unsupported component: Nova</Text>;"), parity: null });
  assert.equal(placeholder.length, 1);
  assert.match(placeholder[0], /Nova has a case .* only renders a placeholder/);
  const nul = coverageProblems({ wireTypes: ['Nova'], coverage: { Nova: { status: 'full' } }, source: SW("case 'Nova': return null;"), parity: null });
  assert.match(nul[0], /placeholder/);
  // stacked labels share the body that follows them
  assert.deepEqual(coverageProblems({ wireTypes: ['A', 'B'], coverage: { A: { status: 'full' }, B: { status: 'full' } }, source: SW("case 'A':\n    case 'B':\n      return <AB />;"), parity: null }), []);
});

test('an unclassified type, a phantom entry and a stale doc are reported', () => {
  const problems = coverageProblems({
    wireTypes: ['Grid'],
    coverage: { Ghost: { status: 'full' } },
    source: SW("case 'Grid': return <Grid />;"),
    parity: '<!-- rn-coverage:start -->\nold\n<!-- rn-coverage:end -->',
  });
  assert.equal(problems.length, 3);
});

test('the generated table lists every entry', () => {
  const table = coverageTable({ A: { status: 'full' }, B: { status: 'partial', note: 'n' } });
  assert.match(table, /\| `A` \| ✅ \|/);
  assert.match(table, /\| `B` \| 🟡 \| n \|/);
});
