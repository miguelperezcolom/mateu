import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badgeLook, buttonColor, buttonLook, buttonSize, toneColors, toneOf } from './looks.ts';
import { applyTheme, contrast, theme } from '../theme.ts';

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

test('badges: normal is the primary tint, contrast the ink one, primary is filled, pill and small are kept', () => {
  applyTheme('light');
  assert.equal(badgeLook({ color: 'normal' }).background, toneColors('info').background);
  assert.notEqual(badgeLook({ color: 'contrast' }).background, badgeLook({ color: 'normal' }).background);
  assert.equal(badgeLook({ color: 'success' }).ink, toneColors('success').ink);
  const vip = badgeLook({ color: 'success', primary: true, pill: true });
  assert.equal(vip.background, toneColors('success').ink);
  assert.equal(vip.pill, true);
  assert.equal(badgeLook({ small: true }).small, true);
});

test('a wire button colour paints it with the theme (normal/absent = the accent)', () => {
  applyTheme('light');
  assert.deepEqual(buttonColor('ERROR'), { fill: theme.danger, onFill: theme.onFill });
  assert.deepEqual(buttonColor('danger'), { fill: theme.danger, onFill: theme.onFill });
  assert.deepEqual(buttonColor('success'), { fill: theme.success, onFill: theme.onFill });
  assert.deepEqual(buttonColor('warning'), { fill: theme.warning, onFill: theme.onFill });
  assert.deepEqual(buttonColor('contrast'), { fill: theme.ink, onFill: theme.surface });
  assert.equal(buttonColor('normal'), null);
  assert.equal(buttonColor(undefined), null);
});

test('a wire button size: small, large, else normal', () => {
  assert.equal(buttonSize('SMALL'), 'small');
  assert.equal(buttonSize('large'), 'large');
  assert.equal(buttonSize('medium'), 'normal');
  assert.equal(buttonSize(null), 'normal');
});
