// DisplayRenderer's color/glyph choices (displayTones.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theme } from '../theme.ts';
import {
  calloutColors, comparisonDelta, displayIcon, meterModel, noticeLook, paletteColor, PALETTE,
  processDotColor, statTrend, stepLook, taskProgressBackground,
} from './displayTones.ts';

test('web icon tokens are not glyphs: only emoji/plain text show', () => {
  assert.equal(displayIcon('vaadin:chart'), '');
  assert.equal(displayIcon('📈'), '📈');
  assert.equal(displayIcon(undefined), '');
  assert.equal(displayIcon(''), '');
});

test('the badge palette: named colors, error and danger alike, unknown/absent → muted', () => {
  assert.equal(paletteColor('success'), theme.success);
  assert.equal(paletteColor('error'), theme.danger);
  assert.equal(paletteColor('danger'), theme.danger);
  assert.equal(paletteColor('contrast'), theme.ink);
  assert.equal(paletteColor(undefined), theme.muted);
  assert.equal(paletteColor('purple'), theme.muted);
  assert.equal(PALETTE.warning, theme.warning);
});

test('a stat trend: up by default, down red, flat faint with an arrow', () => {
  assert.deepEqual(statTrend(undefined), { color: theme.success, glyph: '▲' });
  assert.deepEqual(statTrend('down'), { color: theme.danger, glyph: '▼' });
  assert.deepEqual(statTrend('flat'), { color: theme.faint, glyph: '→' });
  // an unknown trend is colored like "up" but has the neutral arrow
  assert.deepEqual(statTrend('sideways'), { color: theme.success, glyph: '→' });
});

test('a comparison delta: flat by default, no mark', () => {
  assert.deepEqual(comparisonDelta(undefined), { color: theme.faint, background: 'rgba(0,0,0,.06)', mark: '' });
  assert.deepEqual(comparisonDelta('up'), { color: theme.success, background: 'rgba(18,183,106,.12)', mark: '▲' });
  assert.deepEqual(comparisonDelta('down'), { color: theme.danger, background: 'rgba(225,29,72,.12)', mark: '▼' });
});

test('callout colors per theme, anything else is info', () => {
  assert.deepEqual(calloutColors('success'), { accent: theme.success, background: theme.successBg });
  assert.deepEqual(calloutColors('warning'), { accent: theme.warning, background: theme.warningBg });
  assert.deepEqual(calloutColors('danger'), { accent: theme.danger, background: theme.dangerBg });
  assert.deepEqual(calloutColors(undefined), { accent: theme.primary, background: theme.infoBg });
  assert.deepEqual(calloutColors('error'), { accent: theme.primary, background: theme.infoBg });
});

test('a notice: unknown theme is info, the declared icon wins over the severity glyph', () => {
  const info = noticeLook('nope');
  assert.equal(info.theme, 'info');
  assert.equal(info.icon, 'ℹ');
  assert.deepEqual(info.colors, { bg: theme.infoBg, ink: theme.info, badge: theme.info });
  assert.equal(noticeLook('success').icon, '✓');
  assert.equal(noticeLook('warning').icon, '!');
  const danger = noticeLook('danger', '👥');
  assert.equal(danger.icon, '👥');
  assert.equal(danger.colors.bg, theme.dangerBg);
  assert.equal(noticeLook('danger', '').icon, '!');
});

test('a meter: clamped ratio, thresholds pick the fill, caption defaults to the percentage', () => {
  assert.deepEqual(meterModel({}), { value: 0, ratio: 0, fill: theme.primary, caption: '0%' });
  assert.deepEqual(meterModel({ value: 30, max: 40 }), { value: 30, ratio: 0.75, fill: theme.primary, caption: '75%' });
  assert.equal(meterModel({ value: 80, max: 40 }).ratio, 1);
  assert.equal(meterModel({ value: -5, max: 40 }).ratio, 0);
  assert.equal(meterModel({ value: 10, max: 100, warnAt: 50 }).fill, theme.success);
  assert.equal(meterModel({ value: 60, max: 100, warnAt: 50, dangerAt: 90 }).fill, theme.warning);
  assert.equal(meterModel({ value: 95, max: 100, warnAt: 50, dangerAt: 90 }).fill, theme.danger);
  assert.equal(meterModel({ value: 1, max: 100, dangerAt: 90 }).fill, theme.success);
  assert.equal(meterModel({ value: 1, max: 2, caption: 'half' }).caption, 'half');
});

test('process health dots and the task-progress tint', () => {
  assert.equal(processDotColor('error'), theme.danger);
  assert.equal(processDotColor('warning'), theme.warning);
  assert.equal(processDotColor(undefined), theme.success);
  assert.equal(taskProgressBackground(true), 'rgba(18,183,106,0.1)');
  assert.equal(taskProgressBackground(false), 'rgba(245,158,11,0.12)');
});

test('stepper steps: done ticks, current outlined, upcoming numbered and muted', () => {
  const done = stepLook('done', 0);
  assert.equal(done.glyph, '✓');
  assert.equal(done.dotColor, theme.primary);
  assert.equal(done.textColor, theme.white);
  assert.equal(done.lineColor, theme.primary);
  assert.equal(done.borderColor, 'transparent');
  assert.equal(done.muted, false);
  const current = stepLook('current', 1);
  assert.equal(current.glyph, '2');
  assert.equal(current.dotColor, theme.white);
  assert.equal(current.borderColor, theme.primary);
  assert.equal(current.textColor, theme.primary);
  assert.equal(current.lineColor, theme.border);
  const upcoming = stepLook(undefined, 2);
  assert.equal(upcoming.status, 'upcoming');
  assert.equal(upcoming.muted, true);
  assert.equal(upcoming.glyph, '3');
  assert.equal(upcoming.dotColor, theme.border);
  assert.equal(upcoming.textColor, theme.muted);
});
