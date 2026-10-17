import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confirmationOf } from './actionConfirmation.ts';

// Same contract as libs/mateu's confirmationTexts (and e2e bulk-action-buttons.spec.ts).
test('an action without confirmationRequired runs straight away', () => {
  assert.equal(confirmationOf({ id: 'save' }), null);
  assert.equal(confirmationOf({ id: 'save', confirmationRequired: false, confirmationTexts: { title: 'x' } }), null);
});

test('the declared texts are what the dialog shows', () => {
  assert.deepEqual(
    confirmationOf({
      id: 'nested-form-action-target-cancel',
      confirmationRequired: true,
      confirmationTexts: { title: 'Cancel processes', message: 'Cancelling stops every selected process. This cannot be undone.', confirmationText: 'Cancel them', denialText: 'Keep running' },
    }),
    { header: 'Cancel processes', message: 'Cancelling stops every selected process. This cannot be undone.', confirmationText: 'Cancel them', denialText: 'Keep running', destructive: false },
  );
});

test('each missing text falls back on its own; a delete names its outcome', () => {
  const t = confirmationOf({ id: 'retry', confirmationRequired: true, confirmationTexts: { message: 'Retry them?', title: ' ' } })!;
  assert.equal(t.header, 'One moment, please');
  assert.equal(t.message, 'Retry them?');
  assert.equal(t.confirmationText, 'Yes');
  const d = confirmationOf({ id: 'delete', confirmationRequired: true, confirmationTexts: null })!;
  assert.deepEqual([d.header, d.confirmationText, d.denialText, d.destructive], ['Delete the selected items?', 'Delete', 'Cancel', true]);
});
