import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonGroupMembers } from './buttonGroup.ts';

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
