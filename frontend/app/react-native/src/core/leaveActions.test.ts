import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLeaveAction } from './leaveActions.ts';

test('the leave actions are the web rule: cancel, cancel-…, back, backToList — not a business cancelX', () => {
  for (const id of ['cancel', 'cancel-new', 'cancel-create', 'cancel-edit', 'cancel-view', 'back', 'backToList']) {
    assert.ok(isLeaveAction(id), id);
  }
  for (const id of ['cancelBooking', 'save', 'delete', '', undefined, null]) {
    assert.ok(!isLeaveAction(id as string), String(id));
  }
});

test("a wizard's back steps inside the screen (its owner advertises next); its cancel still leaves", () => {
  assert.ok(!isLeaveAction('back', ['next', 'back', 'cancel']));
  assert.ok(isLeaveAction('cancel', ['next', 'back', 'cancel']));
  assert.ok(isLeaveAction('back', ['save', 'back']));
});
