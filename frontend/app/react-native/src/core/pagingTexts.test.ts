import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import { ALL_PAGING_TEXTS, pagingTexts } from './pagingTexts.ts';

test('every chrome language has the pager texts, and they are its own', () => {
  assert.deepEqual(Object.keys(ALL_PAGING_TEXTS).sort(), [...CHROME_LANGUAGES].sort());
  for (const lang of CHROME_LANGUAGES) {
    const t = ALL_PAGING_TEXTS[lang];
    assert.ok(t.previous.trim() && t.next.trim() && t.caption(1, 2, 3).trim(), lang);
    if (lang !== 'en') {
      assert.notEqual(t.caption(1, 2, 3), ALL_PAGING_TEXTS.en.caption(1, 2, 3), lang);
      assert.notEqual(t.next, ALL_PAGING_TEXTS.en.next, lang);
    }
  }
});

test('the caption counts one item and many', () => {
  assert.equal(pagingTexts('en').caption(1, 1, 1), 'Page 1 of 1 · 1 item');
  assert.equal(pagingTexts('de-AT').caption(2, 6, 57), 'Seite 2 von 6 · 57 Einträge');
  assert.equal(pagingTexts('ja').caption(1, 3, 40), 'Page 1 of 3 · 40 items');
});
