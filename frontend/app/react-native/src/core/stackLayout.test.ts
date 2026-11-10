import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stackLayout, SPACING, MIN_ROW_GAP } from './stackLayout.ts';

const kid = (style?: string) => ({ type: 'ClientSide', metadata: { type: 'Text' }, style });

test('a row keeps its children at their natural size — never equal stretched cells', () => {
  const l = stackLayout('row', { spacing: true, wrap: true }, [kid(), kid(), kid()]);
  assert.equal(l.container.gap, SPACING);
  assert.equal(l.container.flexWrap, 'wrap');
  for (const item of l.items) {
    assert.equal(item.flexGrow, undefined);
    assert.equal(item.flex, undefined);
    assert.equal(item.minWidth, undefined);
  }
});

test('vertical alignment, BASELINE included, and justification', () => {
  assert.equal(stackLayout('row', { verticalAlignment: 'BASELINE' }, []).container.alignItems, 'baseline');
  assert.equal(stackLayout('row', { verticalAlignment: 'CENTER', justification: 'END' }, []).container.justifyContent, 'flex-end');
  assert.equal(stackLayout('column', { horizontalAlignment: 'END' }, []).container.alignItems, 'flex-end');
});

test('flexGrows (or a child`s own flex-grow) share the row in proportion, on one line', () => {
  const l = stackLayout('row', { flexGrows: [2, 1] }, [kid(), kid()]);
  assert.equal(l.container.flexWrap, 'nowrap');
  assert.deepEqual(l.items.map((i) => i.flexGrow), [2, 1]);
  assert.deepEqual(l.items.map((i) => i.flexBasis), [0, 0]);
  const own = stackLayout('row', {}, [kid('padding: 1rem; flex-grow: 2;'), kid('flex-grow: 1')]);
  assert.deepEqual(own.items.map((i) => i.flexGrow), [2, 1]);
});

test('spacing off still leaves a small gap between controls; padding/margin are the box`s', () => {
  const l = stackLayout('row', { spacing: false, padding: true }, [kid()]);
  assert.equal(l.container.gap, MIN_ROW_GAP);
  assert.equal(l.container.padding, SPACING);
  assert.equal(stackLayout('column', { spacing: false }, []).container.gap, undefined);
});

test('a zone column keeps its phone wrap point', () => {
  const l = stackLayout('row', {}, [kid('flex: 1 1 calc(64% - 1rem); min-width: min(20rem, 100%);')]);
  assert.equal(l.items[0].minWidth, 300);
  assert.equal(l.items[0].flexGrow, 1);
});
