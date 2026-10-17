import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonPressOf, resolvedButtonRoute } from './buttonRoute.ts';

test('a button route resolves when every expression has a value', () => {
  assert.equal(resolvedButtonRoute('/p/${state.id}', { state: { id: 7 } }), '/p/7');
  assert.equal(resolvedButtonRoute('/p/${state.id}', { state: { id: 0 } }), '/p/0');
  assert.equal(resolvedButtonRoute('/p/${data.code}', { state: {}, data: { code: 'A1' } }), '/p/A1');
  assert.equal(resolvedButtonRoute('/plain', { state: {} }), '/plain');
});

test('a button route with a missing or blank value is not a route', () => {
  assert.equal(resolvedButtonRoute('/p/${state.id}', { state: {} }), undefined);
  assert.equal(resolvedButtonRoute('/p/${state.id}', { state: { id: '' } }), undefined);
  assert.equal(resolvedButtonRoute('/p/${state.id}', { state: { id: '  ' } }), undefined);
  assert.equal(resolvedButtonRoute('/p/${state.id}/x/${state.other}', { state: { id: 1 } }), undefined);
});

test('pressing a routed button navigates; an unresolved one does nothing; no route runs the action', () => {
  assert.deepEqual(buttonPressOf({ actionId: 'open', route: '/p/${state.id}' }, { state: { id: 3 } }), { kind: 'route', route: '/p/3' });
  assert.deepEqual(buttonPressOf({ actionId: 'open', route: '/p/${state.id}' }, { state: {} }), { kind: 'unresolvedRoute', template: '/p/${state.id}' });
  assert.deepEqual(buttonPressOf({ actionId: 'save' }, { state: {} }), { kind: 'action' });
  assert.deepEqual(buttonPressOf({ actionId: 'save', route: '' }, { state: {} }), { kind: 'action' });
});
