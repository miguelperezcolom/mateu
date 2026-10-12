import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression as ev, interpolate, interpolateUrl } from './expressions.ts';

const ctx = {
  state: { total: 10, name: 'Ana', 'a-b': 'dash', flag: false, nil: null, items: [1, 2, 3], nested: { x: { y: 7 } } },
  data: { rows: [{ id: 'r1' }, { id: 'r2' }] },
  appState: { hotel: 'H1' },
};

test('literals: numbers, strings (all three quotes, escapes), booleans, null/undefined', () => {
  assert.equal(ev('42', ctx), 42);
  assert.equal(ev('.5', ctx), 0.5);
  assert.equal(ev("'it\\'s'", ctx), "it's");
  assert.equal(ev('"x"', ctx), 'x');
  assert.equal(ev('`t`', ctx), 't');
  assert.equal(ev('true', ctx), true);
  assert.equal(ev('false', ctx), false);
  assert.equal(ev('null', ctx), null);
  assert.equal(ev('undefined', ctx), undefined);
});

test('paths: dotted, bracketed (non-identifier keys), array length and index, null-safe walk', () => {
  assert.equal(ev('state.total', ctx), 10);
  assert.equal(ev("state['a-b']", ctx), 'dash');
  assert.equal(ev('state.items.length', ctx), 3);
  assert.equal(ev('state.items[1]', ctx), 2);
  assert.equal(ev('data.rows[0].id', ctx), 'r1');
  assert.equal(ev('state.nested.x.y', ctx), 7);
  // walking through a missing value yields undefined instead of throwing
  assert.equal(ev('state.missing.deep', ctx), undefined);
  assert.equal(ev('state.nil[0]', ctx), undefined);
  assert.equal(ev('nobody', ctx), undefined);
});

test('arithmetic and precedence, unary operators, parentheses', () => {
  assert.equal(ev('1 + 2 * 3', ctx), 7);
  assert.equal(ev('(1 + 2) * 3', ctx), 9);
  assert.equal(ev('state.total / 4', ctx), 2.5);
  assert.equal(ev('state.total % 3', ctx), 1);
  assert.equal(ev('state.total - 11', ctx), -1);
  assert.equal(ev('-state.total', ctx), -10);
  assert.equal(ev('!state.flag', ctx), true);
  assert.equal(ev('!!state.name', ctx), true);
  assert.equal(ev("'a' + state.name", ctx), 'aAna');
});

test('comparisons and loose vs strict equality, like the web evaluator', () => {
  assert.equal(ev('state.total > 5', ctx), true);
  assert.equal(ev('state.total < 5', ctx), false);
  assert.equal(ev('state.total >= 10', ctx), true);
  assert.equal(ev('state.total <= 9', ctx), false);
  assert.equal(ev("state.total == '10'", ctx), true);
  assert.equal(ev("state.total === '10'", ctx), false);
  assert.equal(ev("state.total != '10'", ctx), false);
  assert.equal(ev("state.total !== '10'", ctx), true);
  assert.equal(ev('state.nil == undefined', ctx), true);
});

test('logic: && / || return operands, ?? only falls back on null/undefined, ternary nests', () => {
  assert.equal(ev("state.flag || 'fallback'", ctx), 'fallback');
  assert.equal(ev("state.name && 'yes'", ctx), 'yes');
  assert.equal(ev("state.flag ?? 'x'", ctx), false);
  assert.equal(ev("state.nil ?? 'x'", ctx), 'x');
  assert.equal(ev("state.total > 5 ? 'big' : 'small'", ctx), 'big');
  assert.equal(ev("state.total > 50 ? 'big' : state.total > 5 ? 'mid' : 'small'", ctx), 'mid');
});

test('unsupported syntax throws so callers can fall back', () => {
  assert.throws(() => ev('state.total = 1', ctx));
  assert.throws(() => ev('1 +', ctx));
  assert.throws(() => ev('(1', ctx));
  assert.throws(() => ev('1 2', ctx), /trailing/);
  assert.throws(() => ev('a ? b', ctx));
  assert.throws(() => ev('#', ctx), /unexpected character/);
});

test('sandbox: identifiers resolve ONLY own properties of the context (no Object.prototype)', () => {
  assert.equal(ev('constructor', ctx), undefined);
  assert.equal(ev('toString', ctx), undefined);
  assert.equal(ev('hasOwnProperty', ctx), undefined);
  assert.equal(interpolate('${constructor}', ctx), '');
  assert.equal(interpolate('${toString}', ctx), '');
});

test('sandbox: the routes back to Function are blocked, like the web evaluator', () => {
  for (const expr of [
    'state.constructor',
    "state['constructor']",
    'state.name.constructor',
    'state.__proto__',
    "state['__proto__']",
    'state.items.constructor.prototype',
    'state.__defineGetter__',
    'state.__lookupGetter__',
  ]) {
    assert.throws(() => ev(expr, ctx), /not allowed/, expr);
    assert.equal(interpolate('${' + expr + '}', ctx), '', expr);
  }
  // a data field literally named like a function property is still readable
  assert.equal(ev('state.call', { state: { call: 'c' } }), 'c');
});

test('interpolate: replaces every placeholder, null → empty, failures → empty, no placeholder → as is', () => {
  assert.equal(interpolate('Hello ${state.name}, ${state.total} items', ctx), 'Hello Ana, 10 items');
  assert.equal(interpolate('x${state.nil}y', ctx), 'xy');
  assert.equal(interpolate('x${1 +}y', ctx), 'xy');
  assert.equal(interpolate('plain', ctx), 'plain');
  assert.equal(interpolate('', ctx), '');
  assert.equal(interpolate('${ state.name }', ctx), 'Ana');
});

test('interpolate: an unresolved ${i18n.key} shows its key, never a blank', () => {
  assert.equal(interpolate('${i18n.orders.title}', ctx), 'orders.title');
  assert.equal(interpolate('Go: ${ i18n.save }!', ctx), 'Go: save!');
});

test('interpolateUrl: values percent-encoded by position; refused values fall back', () => {
  const c = { state: { id: 'a b/c', q: 'x&y=1', dot: '..' } };
  assert.equal(interpolateUrl('https://api.x/items/${state.id}', c), 'https://api.x/items/a%20b%2Fc');
  assert.equal(interpolateUrl('https://api.x/items?q=${state.q}', c), 'https://api.x/items?q=x%26y%3D1');
  assert.throws(() => interpolateUrl('https://api.x/items/${state.dot}', c), /dot segment/);
  assert.throws(() => interpolateUrl('${state.id}/x', c), /origin/);
  // an expression that fails to evaluate becomes '' (not the raw syntax)
  assert.equal(interpolateUrl('https://api.x/items?q=${1 +}', c), 'https://api.x/items?q=');
  assert.equal(interpolateUrl('https://api.x/plain', c), 'https://api.x/plain');
});
