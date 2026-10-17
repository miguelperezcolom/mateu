// What a screen-reader user hears (a11y.ts): the props each control gets and what is spoken.
// react-native is replaced; the AccessibilityInfo fake records the announcements.
import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native']);

const platform = { OS: 'ios' };
const spoken: any[] = [];
const info: Record<string, any> = {
  announceForAccessibility: (m: string) => spoken.push(m),
  isScreenReaderEnabled: async () => true,
};
mock.module('react-native', { namedExports: { Platform: platform, AccessibilityInfo: info } });

const a11y = await import('./a11y.ts');

beforeEach(() => {
  spoken.length = 0;
  platform.OS = 'ios';
  delete info.announceForAccessibilityWithOptions;
});

test('announce speaks trimmed text and stays silent on empty messages', () => {
  a11y.announce('  Saved  ');
  a11y.announce('   ');
  a11y.announce(undefined as unknown as string);
  assert.deepEqual(spoken, ['Saved']);
});

test('announceLive: polite queues, assertive interrupts; falls back to a plain announcement', () => {
  info.announceForAccessibilityWithOptions = (m: string, o: any) => spoken.push({ m, o });
  a11y.announceLive('3 results', false);
  a11y.announceLive('Error', true);
  a11y.announceLive('', true);
  assert.deepEqual(spoken, [{ m: '3 results', o: { queue: true } }, { m: 'Error', o: { queue: false } }]);
  delete info.announceForAccessibilityWithOptions;
  a11y.announceLive('Plain', true);
  assert.equal(spoken.at(-1), 'Plain');
});

test('isScreenReaderEnabled asks the platform', async () => {
  assert.equal(await a11y.isScreenReaderEnabled(), true);
});

test('a tappable is announced as a button by default, with its state mirrored in the ARIA aliases', () => {
  assert.deepEqual(a11y.buttonA11y(), { accessible: true, accessibilityRole: 'button' });
  assert.deepEqual(a11y.buttonA11y({ label: 'Close', hint: 'Closes the panel', role: 'tab', selected: true, expanded: false, disabled: true }), {
    accessible: true,
    accessibilityRole: 'tab',
    accessibilityLabel: 'Close',
    accessibilityHint: 'Closes the panel',
    accessibilityState: { disabled: true, selected: true, expanded: false },
    'aria-selected': true,
    'aria-expanded': false,
    'aria-disabled': true,
  });
});

test('a field is named "<label>, required, invalid: <error>" — the error in the NAME, the help as the hint', () => {
  assert.deepEqual(a11y.fieldA11y({ label: 'Email', required: true, error: 'must contain @', description: 'Work address', editable: false }), {
    accessible: true,
    accessibilityLabel: 'Email, required, invalid: must contain @',
    accessibilityHint: 'Work address',
    accessibilityState: { disabled: true },
  });
  assert.deepEqual(a11y.fieldA11y(), { accessible: true });
  assert.deepEqual(a11y.fieldA11y({ label: 'Name', editable: true }), { accessible: true, accessibilityLabel: 'Name' });
});

test('an overlay traps the reader: accessibilityViewIsModal on iOS only, important-for-accessibility everywhere', () => {
  assert.deepEqual(a11y.modalA11y('Edit contact'), {
    accessibilityViewIsModal: true,
    accessibilityRole: 'none',
    accessibilityLabel: 'Edit contact',
    importantForAccessibility: 'yes',
  });
  platform.OS = 'android';
  assert.deepEqual(a11y.modalA11y(), { accessibilityRole: 'none', importantForAccessibility: 'yes' });
});

test('headings carry the header role and their level', () => {
  assert.deepEqual(a11y.headingA11y(2), { accessibilityRole: 'header', 'aria-level': 2 });
  assert.deepEqual(a11y.headingA11y(), { accessibilityRole: 'header' });
});
