import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appCompatibility, compareMateuReleases, compatMessage, hubLang, type AppSide, type UiSide } from './compat.ts';

// The shared rule: conformance/client/app-compat.json (IntelliJ runs it too, AppCompatConformanceTest).
const corpus = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../../../conformance/client/app-compat.json'), 'utf8'),
) as { cases: { name: string; app: AppSide; ui: UiSide; expect: { status: string; reason: string | null } }[] };

test('app-compat corpus', () => {
  assert.ok(corpus.cases.length >= 20);
  for (const c of corpus.cases) {
    assert.deepEqual(appCompatibility(c.ui, c.app), c.expect, c.name);
  }
});

test('one release spelled by three ports compares equal; a dev build compares to nothing', () => {
  assert.equal(compareMateuReleases('3.0-beta.33', '3.0.0-beta.33'), 0);
  assert.equal(compareMateuReleases('3.0.0b33', '3.0-beta.33'), 0);
  assert.equal(compareMateuReleases('3.0.0.dev0', '3.0-beta.33'), null);
});

test('every reason has a sentence in English and Spanish naming the UI', () => {
  const app: AppSide = { wire: '3.0', mateuVersion: '3.0-beta.33', appVersion: '1.0.0' };
  const ui = { name: 'Acme', wireVersion: '4.0', minAppVersion: '2.0.0', mateuVersion: '3.0-beta.34' };
  for (const reason of ['newerWire', 'olderWire', 'minAppVersion', 'newerMinor', 'newerMateu'] as const) {
    for (const lang of ['en', 'es'] as const) {
      const text = compatMessage(reason, ui, app, lang);
      assert.match(text, /Acme/, `${reason} ${lang}`);
    }
  }
  assert.equal(hubLang('es-ES'), 'es');
  assert.equal(hubLang('en-GB'), 'en');
  assert.equal(hubLang(undefined), 'en');
});
