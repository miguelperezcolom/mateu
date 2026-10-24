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

test('dark scheme: text tokens reach AA on the dark surfaces, semantic text on its tinted background', async () => {
  const { applyTheme } = await import('./theme.ts');
  applyTheme('dark');
  try {
    for (const color of [theme.ink, theme.muted, theme.faint]) {
      for (const surface of [theme.surface, theme.background]) {
        assert.ok(contrast(color, surface) >= AA, `${color} on ${surface}: ${contrast(color, surface).toFixed(2)}`);
      }
    }
    for (const [fg, bg] of [[theme.success, theme.successBg], [theme.warning, theme.warningBg], [theme.danger, theme.dangerBg], [theme.info, theme.infoBg]]) {
      assert.ok(contrast(fg, bg) >= AA, `${fg} on ${bg}`);
      assert.ok(contrast(theme.onFill, fg) >= AA, `onFill on ${fg}`);
    }
    assert.ok(contrast(theme.primary, theme.surface) >= AA, 'the dark primary reads as text on the surface');
    assert.ok(contrast(theme.onPrimary, theme.primary) >= AA);
  } finally {
    applyTheme('light');
  }
});

test('the app accent becomes the primary, adjusted until it reads; anything that is not hex is ignored', async () => {
  const { accentFor } = await import('./theme.ts');
  const light = accentFor('light', '#FFD400'); // a yellow brand: darkened until white text reads on it
  assert.ok(contrast('#FFFFFF', light.primary) >= AA, light.primary);
  const kept = accentFor('light', '#0B6E4F'); // already dark enough: kept as is
  assert.equal(kept.primary, '#0B6E4F');
  assert.equal(accentFor('light', 'rebeccapurple').primary, accentFor('light', null).primary);
  const dark = accentFor('dark', '#0B6E4F'); // lightened until it reads on the dark surface
  assert.ok(contrast(dark.primary, '#1C1D21') >= AA, dark.primary);
});

test('a themed stylesheet is rebuilt when the scheme changes', async () => {
  const { applyTheme, themed } = await import('./theme.ts');
  const styles = themed(() => ({ box: { backgroundColor: theme.surface } }));
  applyTheme('light');
  const light = styles.box.backgroundColor;
  applyTheme('dark');
  assert.notEqual(styles.box.backgroundColor, light);
  applyTheme('light');
  assert.equal(styles.box.backgroundColor, light);
});
