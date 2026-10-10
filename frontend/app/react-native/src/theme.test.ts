import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theme } from './theme.ts';

/** WCAG 2.x relative luminance / contrast ratio. */
const luminance = (hex: string): number => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const AA = 4.5;
const surfaces = { white: theme.white, background: theme.background, divider: theme.divider };

test('text tokens reach WCAG AA (4.5:1) on every light surface they are drawn on', () => {
  for (const [name, color] of Object.entries({ ink: theme.ink, muted: theme.muted, faint: theme.faint })) {
    for (const [surfaceName, surface] of Object.entries(surfaces)) {
      const ratio = contrast(color, surface);
      assert.ok(ratio >= AA, `${name} on ${surfaceName}: ${ratio.toFixed(2)}:1`);
    }
  }
});

test('semantic text reaches AA on its own tinted background (banners, chips)', () => {
  const pairs: [string, string, string][] = [
    ['success', theme.success, theme.successBg],
    ['warning', theme.warning, theme.warningBg],
    ['danger', theme.danger, theme.dangerBg],
    ['info', theme.info, theme.infoBg],
  ];
  for (const [name, fg, bg] of pairs) {
    assert.ok(contrast(fg, bg) >= AA, `${name}: ${contrast(fg, bg).toFixed(2)}:1`);
    // secondary text inside a tinted banner is drawn in `faint`/`muted`
    assert.ok(contrast(theme.faint, bg) >= AA, `faint on ${name}Bg: ${contrast(theme.faint, bg).toFixed(2)}:1`);
  }
});

test('button labels reach AA on their fills', () => {
  assert.ok(contrast(theme.onPrimary, theme.primary) >= AA);
  assert.ok(contrast(theme.white, theme.danger) >= AA);
  assert.ok(contrast(theme.ink, theme.background) >= AA);
});

test('the accent is not the error colour (an accent that reads as an error makes every primary action look destructive)', () => {
  assert.notEqual(theme.primary.toLowerCase(), theme.danger.toLowerCase());
});

test('touch targets follow the platform minimum (HIG 44pt)', () => {
  assert.ok(theme.minTouch >= 44);
});
