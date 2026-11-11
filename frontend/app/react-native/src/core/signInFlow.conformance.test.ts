import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { signInModeOf, signInProvidersFrom, type ClientPlatform } from './signInProviders.ts';

// The sign-in flow corpus (conformance/client/sign-in-flow.json) — the same file the IntelliJ/desktop
// plugin runs (SignInFlowConformanceTest). Native platforms only here; a `web` case belongs to the web
// renderers.

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/sign-in-flow.json', import.meta.url)), 'utf8',
)) as { cases: { name: string; auth: unknown; platform: ClientPlatform; expect: { providers: string[]; mode: string } }[] };

test('the corpus has mobile cases', () => {
  assert.ok(corpus.cases.filter((c) => c.platform === 'mobile').length >= 3);
});

for (const c of corpus.cases.filter((k) => k.platform !== 'web')) {
  test(`sign-in flow: ${c.name}`, () => {
    const providers = signInProvidersFrom(c.auth, c.platform);
    assert.deepEqual(providers.map((p) => p.id), c.expect.providers);
    assert.equal(signInModeOf(providers), c.expect.mode);
  });
}
