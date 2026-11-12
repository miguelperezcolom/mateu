import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHROME_LANGUAGES, chromeLanguageOf } from './chromeLanguage.ts';

test('the primary subtag picks the language; anything else is English', () => {
  assert.equal(chromeLanguageOf('es-ES'), 'es');
  assert.equal(chromeLanguageOf('es_419'), 'es');
  assert.equal(chromeLanguageOf('fr-CA'), 'fr');
  assert.equal(chromeLanguageOf('de-AT'), 'de');
  assert.equal(chromeLanguageOf('pt-BR'), 'pt');
  assert.equal(chromeLanguageOf('pt-PT'), 'pt');
  assert.equal(chromeLanguageOf('IT-it'), 'it');
  assert.equal(chromeLanguageOf('en-GB'), 'en');
  assert.equal(chromeLanguageOf('nl'), 'en');
  assert.equal(chromeLanguageOf('ja-JP'), 'en');
  assert.equal(chromeLanguageOf(''), 'en');
  assert.equal(chromeLanguageOf(undefined), 'en');
  assert.deepEqual([...CHROME_LANGUAGES].sort(), ['de', 'en', 'es', 'fr', 'it', 'pt']);
});
