// The legacy validation-condition matcher (legacyCondition.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalCondition, isTruthy, toNumber } from './legacyCondition.ts';

test('numeric comparisons on a state field, every operator', () => {
  const s = { age: '18', n: 5 };
  assert.equal(evalCondition("state['age'] >= 18", s), true);
  assert.equal(evalCondition("state['age'] > 18", s), false);
  assert.equal(evalCondition("state['n'] <= 5", s), true);
  assert.equal(evalCondition("state['n'] < 5", s), false);
  assert.equal(evalCondition("state['n'] == 5", s), true);
  assert.equal(evalCondition("state['n'] != 5", s), false);
  assert.equal(evalCondition("state['x'] > -1.5", {}), true); // missing → 0
});

test('a bare field reference is truthiness; anything unrecognised passes', () => {
  assert.equal(evalCondition("  state['name']  ", { name: ' ' }), false);
  assert.equal(evalCondition("state['name'] && true", { name: 'Ana' }), true);
  assert.equal(evalCondition('whatever()', {}), true);
});

test('truthiness and numbers', () => {
  assert.equal(isTruthy(null), false);
  assert.equal(isTruthy(undefined), false);
  assert.equal(isTruthy(''), false);
  assert.equal(isTruthy('x'), true);
  assert.equal(isTruthy(0), false);
  assert.equal(isTruthy(3), true);
  assert.equal(isTruthy(false), false);
  assert.equal(isTruthy(true), true);
  assert.equal(isTruthy([]), false);
  assert.equal(isTruthy([1]), true);
  assert.equal(isTruthy({}), true);
  assert.equal(toNumber('2.5'), 2.5);
  assert.equal(toNumber('abc'), 0);
  assert.equal(toNumber(undefined), 0);
  assert.equal(toNumber(7), 7);
});
