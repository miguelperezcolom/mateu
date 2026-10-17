// Custom components (customComponents.ts): the registry an app fills to render its own wire types.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerCustomComponent, resolveCustomComponent } from './customComponents.ts';

test('an unregistered custom type resolves to nothing (the dispatch shows its placeholder)', () => {
  assert.equal(resolveCustomComponent('acme-unknown'), undefined);
});

test('a registered renderer is found by name and receives the props and children', () => {
  registerCustomComponent('acme-gauge', (props, children) => ({ props, children }));
  const r = resolveCustomComponent('acme-gauge')!;
  assert.deepEqual(r({ value: 3 }, 'kids'), { props: { value: 3 }, children: 'kids' });
});

test('a later registration replaces an earlier one', () => {
  registerCustomComponent('acme-x', () => 'first');
  registerCustomComponent('acme-x', () => 'second');
  assert.equal(resolveCustomComponent('acme-x')!({}, null), 'second');
});
