// CI: the React Native renderer renders EVERY wire component type, and parity.md says so.
// Usage: node scripts/parity-check.mjs           → check (exit ≠ 0 on any problem)
//        node scripts/parity-check.mjs --write   → regenerate the RN section of parity.md
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RN_COVERAGE, coverageTable } from './coverage.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..', '..');
const wireFile = join(repo, 'backend/shared/uidl/wire-schema.json');
const rendererFile = join(here, '..', 'src/renderer/ComponentRenderer.tsx');
const parityFile = join(repo, 'doc/src/content/docs/reference/parity.md');
const START = '<!-- rn-coverage:start -->';
const END = '<!-- rn-coverage:end -->';

/**
 * The wire's component types, from the generated wire-schema.json: the `type` discriminators of
 * ComponentMetadataDto, split into those a server produces and the deprecated ones (registered,
 * produced by nobody — a renderer need not draw them).
 */
export function wireTypesOf(schemaJson) {
  const defs = JSON.parse(schemaJson).$defs;
  const produced = [];
  const deprecated = [];
  for (const { $ref } of defs.ComponentMetadataDto.oneOf) {
    const def = defs[$ref.split('/').pop()];
    (def.deprecated ? deprecated : produced).push(def.properties.type.const);
  }
  return { produced, deprecated };
}

/**
 * The body each `case 'X':` of ComponentRenderer's `switch (metaType)` falls into — parsed from the
 * switch, not searched anywhere in the file, so a `case 'X':` in a comment or in another switch does
 * not count. Labels stacked on one body (`case 'A': case 'B': return …`) share it.
 */
export function caseBodiesOf(source) {
  const start = source.indexOf('switch (metaType) {');
  if (start < 0) return new Map();
  const end = source.indexOf('\n    default:', start);
  const block = source.slice(start, end < 0 ? undefined : end);
  const bodies = new Map();
  const re = /case '([A-Za-z]+)':/g;
  const hits = [...block.matchAll(re)];
  let pending = [];
  hits.forEach((m, i) => {
    pending.push(m[1]);
    const bodyEnd = i + 1 < hits.length ? hits[i + 1].index : block.length;
    const body = block.slice(m.index + m[0].length, bodyEnd).trim();
    if (body) {
      for (const t of pending) bodies.set(t, body);
      pending = [];
    }
  });
  return bodies;
}

/** A case body that only shows the placeholder (or nothing) is not a rendering. */
const isPlaceholder = (body) => /Unsupported component/.test(body) || /^return\s+(null|undefined|<><\/>)\s*;?\s*$/.test(body);

/** Coverage problems (pure: unit-tested by parityCheck.test.ts). */
export function coverageProblems({ wireTypes, deprecated = [], coverage, source, parity }) {
  const problems = [];
  const bodies = caseBodiesOf(source);
  for (const t of wireTypes) {
    const body = bodies.get(t);
    if (body == null) problems.push(`wire type ${t} has no case in ComponentRenderer.tsx — it would render as "Unsupported component"`);
    else if (isPlaceholder(body)) problems.push(`wire type ${t} has a case in ComponentRenderer.tsx that only renders a placeholder`);
    if (!coverage[t]) problems.push(`wire type ${t} is not classified in scripts/coverage.mjs`);
  }
  for (const t of Object.keys(coverage)) if (!wireTypes.includes(t) && !deprecated.includes(t)) problems.push(`coverage.mjs lists ${t}, which the wire does not have`);
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
  const { produced: wireTypes, deprecated } = wireTypesOf(readFileSync(wireFile, 'utf8'));
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
  const problems = coverageProblems({ wireTypes, deprecated, coverage: RN_COVERAGE, source, parity });
  if (problems.length) {
    console.error(problems.map((p) => '  ✗ ' + p).join('\n'));
    process.exit(1);
  }
  console.log(`React Native coverage OK (${wireTypes.length} produced wire types + ${deprecated.length} deprecated, all rendered; parity.md in sync)`);
}
