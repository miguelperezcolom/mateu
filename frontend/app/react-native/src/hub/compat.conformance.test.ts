import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appCompatibility, compareMateuReleases, compatMessage, HUB_TEXTS, hubLang, type AppSide, type UiSide } from './compat.ts';
import { CHROME_LANGUAGES } from '../core/chromeLanguage.ts';

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

test('every reason has a sentence in every language naming the UI', () => {
  const app: AppSide = { wire: '3.0', mateuVersion: '3.0-beta.33', appVersion: '1.0.0' };
  const ui = { name: 'Acme', wireVersion: '4.0', minAppVersion: '2.0.0', mateuVersion: '3.0-beta.34' };
  for (const reason of ['newerWire', 'olderWire', 'minAppVersion', 'newerMinor', 'newerMateu'] as const) {
    for (const lang of CHROME_LANGUAGES) {
      const text = compatMessage(reason, ui, app, lang);
      assert.match(text, /Acme/, `${reason} ${lang}`);
    }
  }
  assert.equal(hubLang('es-ES'), 'es');
  assert.equal(hubLang('en-GB'), 'en');
  // '' (not undefined: that means "the device's", which is the machine running the test)
  assert.equal(hubLang(''), 'en');
  assert.equal(hubLang('pt-BR'), 'pt');
  assert.equal(hubLang('de-AT'), 'de');
  assert.equal(hubLang('nl'), 'en');
  for (const lang of CHROME_LANGUAGES) {
    assert.ok(HUB_TEXTS[lang].updateTheApp && HUB_TEXTS[lang].checkAgain && HUB_TEXTS[lang].notNow, lang);
  }
});
