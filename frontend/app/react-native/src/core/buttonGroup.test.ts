import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonGroupMembers, splitButtonParts } from './buttonGroup.ts';

test('a Button carrying children and no action is a group: its members render instead', () => {
  const members = buttonGroupMembers({
    type: 'Button', label: 'More',
    children: [{ type: 'Button', label: 'Export', actionId: 'export' }, { type: 'Button', label: 'Archive', actionId: 'archive' }],
  });
  assert.deepEqual(members?.map((m) => m['actionId']), ['export', 'archive']);
});

test('an ordinary button is not a group', () => {
  assert.equal(buttonGroupMembers({ type: 'Button', label: 'Save', actionId: 'save' }), null);
  assert.equal(buttonGroupMembers({ type: 'Button', label: 'Save', actionId: 'save', children: [] }), null);
  assert.equal(buttonGroupMembers({ type: 'Button', label: 'Odd', actionId: 'odd', children: [{ type: 'Button' }] }), null);
});

test('a split button is its primary plus the rest; anything else is not one', () => {
  const parts = splitButtonParts({
    type: 'Button', label: 'Save', actionId: 'save', buttonStyle: 'primary', split: true,
    children: [{ type: 'Button', label: 'Save as draft', actionId: 'saveDraft' }, null],
  });
  assert.ok(parts);
  assert.equal(parts.primary['actionId'], 'save');
  assert.equal(parts.primary['buttonStyle'], 'primary');
  assert.deepEqual(parts.primary['children'], []);
  assert.deepEqual(parts.more.map((m) => m['actionId']), ['saveDraft']);
  assert.equal(splitButtonParts({ type: 'Button', label: 'More', children: [{ type: 'Button', actionId: 'x' }] }), null);
  assert.equal(splitButtonParts({ type: 'Button', label: 'Save', actionId: 'save', split: true, children: [] }), null);
  // a split button is NOT a dropdown group: it has an action of its own
  assert.equal(buttonGroupMembers({ type: 'Button', label: 'Save', actionId: 'save', split: true, children: [{ type: 'Button', actionId: 'x' }] }), null);
});
