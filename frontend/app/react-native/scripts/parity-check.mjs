// CI: the React Native renderer renders EVERY wire component type, and parity.md says so.
// Usage: node scripts/parity-check.mjs           → check (exit ≠ 0 on any problem)
//        node scripts/parity-check.mjs --write   → regenerate the RN section of parity.md
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RN_COVERAGE, coverageTable } from './coverage.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..', '..');
const wireFile = join(repo, 'backend/shared/dtos/src/main/java/io/mateu/dtos/ComponentMetadataDto.java');
const rendererFile = join(here, '..', 'src/renderer/ComponentRenderer.tsx');
const parityFile = join(repo, 'doc/src/content/docs/reference/parity.md');
const START = '<!-- rn-coverage:start -->';
const END = '<!-- rn-coverage:end -->';

/** The wire's component type names (@JsonSubTypes.Type(..., name = "X")). */
export const wireTypesOf = (java) => [...new Set([...java.matchAll(/name\s*=\s*"([A-Za-z]+)"/g)].map((m) => m[1]))];

/** Coverage problems (pure: unit-tested by parityCheck.test.ts). */
export function coverageProblems({ wireTypes, coverage, source, parity }) {
  const problems = [];
  for (const t of wireTypes) {
    if (!source.includes(`case '${t}':`)) problems.push(`wire type ${t} has no case in ComponentRenderer.tsx — it would render as "Unsupported component"`);
    if (!coverage[t]) problems.push(`wire type ${t} is not classified in scripts/coverage.mjs`);
  }
  for (const t of Object.keys(coverage)) if (!wireTypes.includes(t)) problems.push(`coverage.mjs lists ${t}, which the wire does not have`);
  if (parity != null) {
    const a = parity.indexOf(START);
    const b = parity.indexOf(END);
    if (a < 0 || b < 0) problems.push(`parity.md has no ${START} … ${END} section`);
    else if (parity.slice(a + START.length, b).trim() !== coverageTable(coverage).trim()) {
      problems.push('the React Native coverage section of parity.md is stale — run node scripts/parity-check.mjs --write');
    }
  }
  return problems;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const wireTypes = wireTypesOf(readFileSync(wireFile, 'utf8'));
  const source = readFileSync(rendererFile, 'utf8');
  let parity = readFileSync(parityFile, 'utf8');
  if (process.argv.includes('--write')) {
    const a = parity.indexOf(START);
    const b = parity.indexOf(END);
    if (a < 0 || b < 0) {
      console.error(`parity.md needs the ${START} … ${END} markers`);
      process.exit(2);
    }
    parity = parity.slice(0, a + START.length) + '\n' + coverageTable() + '\n' + parity.slice(b);
    writeFileSync(parityFile, parity);
    console.log('parity.md: React Native coverage section regenerated');
  }
  const problems = coverageProblems({ wireTypes, coverage: RN_COVERAGE, source, parity });
  if (problems.length) {
    console.error(problems.map((p) => '  ✗ ' + p).join('\n'));
    process.exit(1);
  }
  console.log(`React Native coverage OK (${wireTypes.length} wire types, all rendered; parity.md in sync)`);
}
