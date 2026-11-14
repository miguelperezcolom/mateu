// GA review 2 findings on 3.0-rc.1 (React Native). B2 is fixed for rc.2; a finding still open is pinned
// as `todo`: it reports, it does not fail the suite. Drop `todo` once fixed and the assertion holds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import { renderFailureTexts } from './renderFailure.ts';

// Native B2: the overlay fallback's Close button is English only (RenderBoundary: closeLabel ?? 'Close',
// SessionContent passes no label, renderFailure.ts has no `close` text).
test('GA r2 native B2: the render-failure texts carry a Close label in the six languages', () => {
  for (const lang of CHROME_LANGUAGES) {
    const close = (renderFailureTexts(lang) as unknown as Record<string, unknown>)['close'];
    assert.ok(typeof close === 'string' && close.trim().length > 0, lang);
  }
  assert.notEqual((renderFailureTexts('es') as unknown as Record<string, unknown>)['close'], 'Close');
});

// Explorer N2: a route clicked inside a page embedded from ANOTHER mount is that mount's (libs/mateu
// `embeddingMountOf`, Redwood `surfaceMountPathOf`). React Native has no equivalent rule, so
// /distributed/mounts/several-mounts → "Go to /yaml-mount/second" ends on the host's "Page not found".
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return sources(p);
    return /\.(ts|tsx)$/.test(n) && !/\.test\.ts$/.test(n) ? [p] : [];
  });
}
test('GA r2 Explorer N2: RN resolves a route inside another mount\'s embedded page against that mount', { todo: 'open on rc.1' }, () => {
  const src = new URL('..', import.meta.url).pathname;
  const text = sources(src).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.match(text, /embeddingMountOf|mountOfIsland|surfaceMountPath/);
});
