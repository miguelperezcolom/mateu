import { test } from 'node:test';
import assert from 'node:assert/strict';
import { i18nKeyOf } from './i18nKeys.ts';

test('an i18n expression body yields its key', () => {
  assert.equal(i18nKeyOf('i18n.orders.title'), 'orders.title');
  assert.equal(i18nKeyOf(' i18n.save '), 'save');
});

test('anything else is not an i18n reference', () => {
  assert.equal(i18nKeyOf('state.name'), undefined);
  assert.equal(i18nKeyOf('i18n'), undefined);
  assert.equal(i18nKeyOf("i18n.a + 'x'"), undefined);
});
