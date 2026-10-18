import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellText } from './cellText.ts';
import { setAppLocale } from '../core/money.ts';

test('a money cell reads formatted in the app locale; an Amount in its own; other cells unchanged', () => {
  setAppLocale('en');
  try {
    assert.equal(cellText(89.5, null, { dataType: 'number', stereotype: 'money' }), '89.50');
    assert.equal(cellText({ value: 10, currency: 'EUR', locale: 'de-DE' }, null, { dataType: 'money' }).replace(/\s/g, ' '), '10,00 €');
    assert.equal(cellText(89.5, null, { dataType: 'number' }), '89.5');
    assert.equal(cellText(null, null, { stereotype: 'money' }), '');
  } finally {
    setAppLocale(undefined);
  }
});
