import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import { ALL_LOADING_TEXTS, loadingTexts } from './loadingTexts.ts';

test('every chrome language has both texts, and they are its own', () => {
  assert.deepEqual(Object.keys(ALL_LOADING_TEXTS).sort(), [...CHROME_LANGUAGES].sort());
  for (const lang of CHROME_LANGUAGES) {
    const t = ALL_LOADING_TEXTS[lang];
    assert.ok(t.loading.trim() && t.imageFailed.trim(), lang);
    if (lang !== 'en') {
      assert.notEqual(t.loading, ALL_LOADING_TEXTS.en.loading, lang);
      assert.notEqual(t.imageFailed, ALL_LOADING_TEXTS.en.imageFailed, lang);
    }
  }
});

test('the locale picks the language, English otherwise', () => {
  assert.equal(loadingTexts('es-ES').loading, 'Cargando…');
  assert.equal(loadingTexts('pt-PT').imageFailed, 'Não foi possível carregar a imagem');
  assert.equal(loadingTexts('ja').loading, 'Loading…');
});
