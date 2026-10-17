// The client-side rule engine (clientRules.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyClientRules } from './clientRules.ts';

type Json = Record<string, any>;
const run = (rules: Json[], state: Json = {}, attrs: Record<string, Json> = {}) => {
  const ran: string[] = [];
  const changed = applyClientRules(rules, { state }, state, attrs, (id) => ran.push(id));
  return { changed, state, attrs, ran };
};

test('SetStateValue writes every named field (or field.attribute) and reports the change', () => {
  const r = run([{ action: 'SetStateValue', fieldName: 'a,b', value: 1 }, { action: 'SetDataValue', fieldName: 'c', fieldAttribute: 'label', value: 'L' }]);
  assert.equal(r.changed, true);
  assert.deepEqual(r.state, { a: 1, b: 1, 'c.label': 'L' });
  // same values again: nothing changes
  assert.equal(applyClientRules([{ action: 'SetStateValue', fieldName: 'a', value: 1 }], {}, r.state, {}, () => {}), false);
});

test('the expression wins over the literal value; a failing expression falls back to it', () => {
  const r = run([{ action: 'SetStateValue', fieldName: 'total', expression: 'state.qty * 2', value: 0 }], { qty: 3 });
  assert.equal(r.state.total, 6);
  const f = run([{ action: 'SetStateValue', fieldName: 'x', fieldAttribute: 'none', expression: '@', value: 'fallback' }]);
  assert.equal(f.state.x, 'fallback');
});

test('filters gate rules; a filter that throws does not match', () => {
  const r = run([
    { filter: 'state.on', action: 'SetAttributeValue', fieldName: 'f', fieldAttribute: 'hidden', value: true },
    { filter: '@', action: 'SetStateValue', fieldName: 'g', value: 1 },
  ], { on: false });
  assert.equal(r.changed, false);
  assert.deepEqual(r.attrs, {});
  assert.equal('g' in r.state, false);
});

test('SetAttributeValue overrides field attributes, needs an attribute', () => {
  const r = run([
    { action: 'SetAttributeValue', fieldName: 'f,g', fieldAttribute: 'disabled', value: true },
    { action: 'SetAttributeValue', fieldName: 'h', fieldAttribute: 'none', value: true },
  ]);
  assert.equal(r.changed, true);
  assert.deepEqual(r.attrs, { f: { disabled: true }, g: { disabled: true } });
  const again = run([{ action: 'SetAttributeValue', fieldName: 'f', fieldAttribute: 'disabled', value: true }], {}, r.attrs);
  assert.equal(again.changed, false);
});

test('RunAction runs, an empty id does not; Stop ends the pass; unknown actions are ignored', () => {
  const r = run([
    { action: 'RunAction', actionId: '' },
    { action: 'RunJS', actionId: 'x' },
    { action: 'RunAction', actionId: 'refresh', result: 'Stop' },
    { action: 'SetStateValue', fieldName: 'late', value: 1 },
  ]);
  assert.deepEqual(r.ran, ['refresh']);
  assert.equal('late' in r.state, false);
  assert.equal(r.changed, false);
});
