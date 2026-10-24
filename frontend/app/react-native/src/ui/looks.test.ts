import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonLook, toneColors, toneOf } from './looks.ts';
import { applyTheme, contrast } from '../theme.ts';

test('wire button styles map to Material emphasis', () => {
  assert.deepEqual(buttonLook('primary'), { mode: 'contained', danger: false });
  assert.deepEqual(buttonLook('SECONDARY'), { mode: 'contained-tonal', danger: false });
  assert.deepEqual(buttonLook('tertiary'), { mode: 'text', danger: false });
  assert.deepEqual(buttonLook(undefined), { mode: 'outlined', danger: false });
  assert.deepEqual(buttonLook('', 'error'), { mode: 'outlined', danger: true });
  assert.deepEqual(buttonLook('primary', 'error'), { mode: 'contained', danger: true });
});

test('tone names off the wire', () => {
  assert.equal(toneOf('SUCCESS'), 'success');
  assert.equal(toneOf('error'), 'danger');
  assert.equal(toneOf('warning'), 'warning');
  assert.equal(toneOf('info'), 'info');
  assert.equal(toneOf('neutral'), 'neutral');
  assert.equal(toneOf(undefined), 'neutral');
});

test('every chip tone reads (AA) in both schemes', () => {
  for (const scheme of ['light', 'dark'] as const) {
    applyTheme(scheme);
    for (const tone of ['success', 'warning', 'danger', 'info', 'neutral'] as const) {
      const { background, ink } = toneColors(tone);
      assert.ok(contrast(ink, background) >= 4.5, `${scheme} ${tone}: ${contrast(ink, background).toFixed(2)}`);
    }
  }
  applyTheme('light');
});
