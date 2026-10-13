import { test } from 'node:test';
import assert from 'node:assert/strict';
import { factAction, FACT_ACTION_GLYPH } from './factAction.ts';

test('a fact with an action runs it with its parameters, named by its own label', () => {
  assert.deepEqual(
    factAction({ label: 'EMPRESA', actionId: 'changeCompany', icon: 'vaadin:pencil', actionLabel: 'Cambiar empresa', parameters: { stayId: 'S-1' } }),
    { actionId: 'changeCompany', parameters: { stayId: 'S-1' }, label: 'Cambiar empresa', glyph: FACT_ACTION_GLYPH },
  );
});

test('without a label of its own it is named after the fact; an emoji icon is drawn as is', () => {
  assert.deepEqual(factAction({ label: 'EMPRESA', actionId: 'go', icon: '🏢' }), {
    actionId: 'go', parameters: undefined, label: 'EMPRESA', glyph: '🏢',
  });
});

test('a display-only fact has no button', () => {
  assert.equal(factAction({ label: 'TOTAL', icon: 'vaadin:pencil' }), null);
});
