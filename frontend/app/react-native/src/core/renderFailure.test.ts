// GA-5.3: a render exception is kept to the piece that threw (ui/RenderBoundary.tsx)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import { failedStateOf, RENDER_FAILURE_LANGUAGES, renderFailureDetail, renderFailureTexts, shouldReset } from './renderFailure.ts';

test('the fallback speaks the six chrome languages, every text filled', () => {
  assert.deepEqual([...RENDER_FAILURE_LANGUAGES].sort(), [...CHROME_LANGUAGES].sort());
  for (const lang of CHROME_LANGUAGES) {
    const t = renderFailureTexts(lang);
    for (const v of Object.values(t)) assert.ok(v.trim().length > 0, lang);
  }
  assert.equal(renderFailureTexts('es-ES').retry, 'Reintentar');
  assert.equal(renderFailureTexts('xx').retry, 'Try again');
});

test('the developer detail names the error in one bounded line', () => {
  assert.equal(renderFailureDetail(new TypeError("Cannot read properties of undefined (reading 'map')")), "TypeError: Cannot read properties of undefined (reading 'map')");
  assert.equal(renderFailureDetail('x'.repeat(500)).length, 200);
  assert.deepEqual(failedStateOf('boom'), { failed: true, error: 'boom' });
});

test('a failed piece is drawn again when the user asks or when what it holds changes', () => {
  assert.equal(shouldReset({ attempt: 0, resetKey: 1 }, { attempt: 1, resetKey: 1 }), true);
  assert.equal(shouldReset({ attempt: 0, resetKey: 1 }, { attempt: 0, resetKey: 2 }), true);
  assert.equal(shouldReset({ attempt: 0, resetKey: 1 }, { attempt: 0, resetKey: 1 }), false);
});

test('the boundaries are where a bad component would otherwise take the app down', () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
  // every screen's content, every overlay, the app shell, each hub UI and the single-UI build
  assert.match(read('../renderer/MateuViewHost.tsx'), /<RenderBoundary[^>]*resetKey=\{view\.version\}[\s\S]*?<ComponentRenderer/);
  assert.match(read('../shell/SessionContent.tsx'), /<RenderBoundary[^>]*onClose=[\s\S]*?<OverlayLayer/);
  assert.match(read('../shell/SessionContent.tsx'), /<RenderBoundary where="app shell">\s*<MateuRoot/);
  assert.match(read('../hub/ui/UiSession.tsx'), /<RenderBoundary[^>]*>\s*<MateuAppProvider/);
  assert.match(read('../../App.tsx'), /<RenderBoundary[^>]*>\s*<MateuAppProvider/);
  assert.match(read('../ui/RenderBoundary.tsx'), /static getDerivedStateFromError/);
});

test('the boundary logs with a constant format string (CodeQL js/tainted-format-string)', () => {
  const source = readFileSync(new URL('../ui/RenderBoundary.tsx', import.meta.url), 'utf8');
  const warns = [...source.matchAll(/console\.warn\(([^,]+),/g)].map((m) => m[1].trim());
  assert.ok(warns.length > 0);
  for (const first of warns) assert.match(first, /^'[^'$`]*'$/, `format must be a plain literal: ${first}`);
});
