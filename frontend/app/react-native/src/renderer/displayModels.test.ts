// DisplayRenderer's small models (displayModels.ts): amounts, hero height, the add-on picker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addOnTotal, fmtAmount, heroHeight, ledgerAmount, toggleAddOn } from './displayModels.ts';

test('amounts: two decimals, dot thousands, comma decimals, sign first', () => {
  assert.equal(fmtAmount(1234.5), '1.234,50');
  assert.equal(fmtAmount(1234567.891), '1.234.567,89');
  assert.equal(fmtAmount(0), '0,00');
  assert.equal(fmtAmount(-99.999), '-100,00');
  assert.equal(ledgerAmount(-12, 'EUR'), '-EUR 12,00');
  assert.equal(ledgerAmount(1500, ''), '1.500,00');
});

test('the hero height accepts px and rem/em (16px), else the 180pt default', () => {
  assert.equal(heroHeight(), 180);
  assert.equal(heroHeight('240px'), 240);
  assert.equal(heroHeight('20rem'), 320);
  assert.equal(heroHeight('2.5em'), 40);
  assert.equal(heroHeight('tall'), 180);
});

test('toggling an add-on sends the item, its new state and the new total', () => {
  const items = [{ id: 'spa', price: 30 }, { id: 'late', price: 15.5 }, { id: 'free' }];
  const first = toggleAddOn(items, new Set(), 'spa');
  assert.deepEqual(first.parameters, { _item: 'spa', _added: true, _total: 30 });
  const second = toggleAddOn(items, first.next, 'late');
  assert.equal(second.parameters._total, 45.5);
  const removed = toggleAddOn(items, second.next, 'spa');
  assert.deepEqual(removed.parameters, { _item: 'spa', _added: false, _total: 15.5 });
  assert.equal(removed.nowAdded, false);
  assert.ok(second.next.has('spa'), 'the previous selection is not mutated');
  assert.equal(addOnTotal(items, new Set(['free', 'unknown'])), 0);
});

test('the add-on toggle says what it adds or removes (an icon-only "+" told a screen reader nothing)', async () => {
  const { addOnToggleA11y } = await import('./displayModels.ts');
  assert.deepEqual(addOnToggleA11y({ title: 'Spa' }, false), { label: 'Add Spa', selected: false });
  assert.deepEqual(addOnToggleA11y({ title: 'Spa' }, true), { label: 'Remove Spa', selected: true });
  assert.deepEqual(addOnToggleA11y({ id: 'late' }, false), { label: 'Add late', selected: false });
});
