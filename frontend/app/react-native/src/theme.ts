// Design tokens of the React Native renderer — the single source of truth for its colors, radii,
// spacing and touch sizes; components reference these instead of hardcoding values.
//
// The look is Material Design 3, drawn by React Native Paper (src/ui/MateuTheme.tsx builds the
// Paper theme FROM these tokens, so a Paper button and a hand-drawn chip agree). Two schemes —
// light and dark — chosen by `applyTheme`: dark follows the device unless the app's theme toggle
// overrides it, and the accent (primary) is the app's `@App(accentColor)` when the wire carries
// one, else a neutral system-like blue. Red is reserved for errors and destructive actions, it is
// never the primary accent (an accent that looks like an error makes every primary button read as
// a warning).
//
// `theme` is MUTATED in place by `applyTheme`: everything that reads `theme.x` while rendering (and
// every stylesheet built through `themed(...)`, which is rebuilt lazily when the scheme changes)
// picks the new values up on the next render.
//
// Every TEXT token is checked against the surfaces it is drawn on by `theme.test.ts`: WCAG 2.2 AA
// asks 4.5:1 for normal text, and secondary text ("faint") is text too — hierarchy comes from
// size and weight, not from greys too light to read.
//
// `fontFamily`: set it (after loading the font with expo-font) to have text pick it up; undefined
// falls back to the system font, which is the platform-native choice.

export type Scheme = 'light' | 'dark';

const DEFAULT_ACCENT = '#2563EB';

interface Palette {
  primary: string;
  onPrimary: string;
  /** Tinted container of the accent (selected rows, active drawer item, tonal buttons). */
  primaryContainer: string;
  onPrimaryContainer: string;
  /** Text/glyphs drawn ON a saturated semantic fill (success/danger/info/ink badges, dots). */
  onFill: string;
  ink: string;
  muted: string;
  faint: string;
  border: string;
  divider: string;
  background: string;
  /** The surface cards, sheets and inputs sit on — historically called `white`. */
  white: string;
  surface: string;
  disabled: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;
}

const LIGHT: Omit<Palette, 'primary' | 'onPrimary' | 'primaryContainer' | 'onPrimaryContainer'> = {
  onFill: '#FFFFFF',
  ink: '#1B1C1F', // primary text
  muted: '#4F5560', // secondary text
  faint: '#5F6670', // tertiary text, placeholders, captions — still ≥ 4.5:1 on every light surface
  border: '#C4C8CF', // decorative only (never text)
  divider: '#E6E8EC',
  background: '#F5F6F8',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  disabled: '#ADB5BD', // disabled controls (exempt from contrast minimums, WCAG 1.4.3)
  success: '#177A23',
  successBg: '#E3F1E5',
  warning: '#8F4C00',
  warningBg: '#FBEEDD',
  danger: '#B3261E',
  dangerBg: '#FBE4E2',
  info: '#2763B1',
  infoBg: '#E6EEF8',
};

// Dark: semantic colours turn into LIGHT tones (text on dark surfaces), so whatever is drawn on a
// semantic fill turns dark (`onFill`) — the Material 3 dark idiom.
const DARK: Omit<Palette, 'primary' | 'onPrimary' | 'primaryContainer' | 'onPrimaryContainer'> = {
  onFill: '#16171A',
  ink: '#E4E5E9',
  muted: '#C3C6CE',
  faint: '#A6AAB3',
  border: '#4A4D55',
  divider: '#2E3036',
  background: '#111215',
  white: '#1C1D21',
  surface: '#1C1D21',
  disabled: '#5D6066',
  success: '#86D493',
  successBg: '#1D3622',
  warning: '#F2BE6E',
  warningBg: '#3A2B12',
  danger: '#F2B8B5',
  dangerBg: '#4A1F1C',
  info: '#A8C7FA',
  infoBg: '#1C2C47',
};

export const theme = {
  primary: DEFAULT_ACCENT, // 5.2:1 under white text
  onPrimary: '#FFFFFF',
  primaryContainer: '#DCE6FB',
  onPrimaryContainer: '#0B2A6B',
  ...LIGHT,

  /** The scheme currently applied. */
  scheme: 'light' as Scheme,

  // shape & rhythm (Material 3: 4 small, 12 medium (cards), 28 extra-large (sheets), full = pill)
  radiusSm: 4, // inputs, buttons
  radiusMd: 12, // cards
  radiusLg: 28, // bottom sheets, dialogs
  radiusPill: 100,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

  // touch: Apple HIG asks 44pt and Material 48dp for a tappable target; 44 is the floor used
  // for buttons, and `hitSlop` extends smaller glyph controls (✕, checkboxes) up to it.
  minTouch: 44,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },

  fontFamily: undefined as string | undefined,
};

// ─── colour maths (WCAG relative luminance) ──────────────────────────────────

type RGB = [number, number, number];

/** `#rgb`/`#rrggbb` (alpha ignored) → [r,g,b] 0..255; anything else → null. */
export function parseHex(color: string | null | undefined): RGB | null {
  const c = (color ?? '').trim();
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

const toHex = (rgb: RGB): string =>
  '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** `a` mixed with `b`: weight 0 → a, 1 → b. */
export function mix(a: string, b: string, weight: number): string {
  const x = parseHex(a) ?? [0, 0, 0];
  const y = parseHex(b) ?? [0, 0, 0];
  return toHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * weight) as RGB);
}

export function luminance(color: string): number {
  const rgb = parseHex(color) ?? [0, 0, 0];
  const [r, g, b] = rgb.map((v) => v / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `color` pushed towards `towards` in small steps until it reaches `ratio` against `against`. */
function untilContrast(color: string, against: string, ratio: number, towards: string): string {
  let c = color;
  for (let i = 1; i <= 20 && contrast(c, against) < ratio; i++) c = mix(color, towards, i / 20);
  return c;
}

/**
 * The accent of a scheme: the app's accent (any `#hex`; other CSS colours are ignored), adjusted so
 * it still reads — darkened in light mode until white text reaches AA on it, lightened in dark mode
 * until it reaches AA as text on the dark surface (Material 3's light-primary-in-dark idiom).
 */
export function accentFor(scheme: Scheme, accent?: string | null): { primary: string; onPrimary: string; primaryContainer: string; onPrimaryContainer: string } {
  const base = parseHex(accent) ? toHex(parseHex(accent)!) : DEFAULT_ACCENT;
  if (scheme === 'dark') {
    const primary = untilContrast(base, DARK.surface, 4.5, '#FFFFFF');
    return {
      primary,
      onPrimary: contrast('#FFFFFF', primary) >= 4.5 ? '#FFFFFF' : '#16171A',
      primaryContainer: mix(primary, DARK.surface, 0.72),
      onPrimaryContainer: mix(primary, '#FFFFFF', 0.6),
    };
  }
  const primary = untilContrast(base, '#FFFFFF', 4.5, '#000000');
  return {
    primary,
    onPrimary: '#FFFFFF',
    primaryContainer: mix(primary, '#FFFFFF', 0.86),
    onPrimaryContainer: mix(primary, '#000000', 0.55),
  };
}

// ─── applying a scheme ───────────────────────────────────────────────────────

let version = 0;

/** Bumped by every `applyTheme`: what `themed(...)` caches against. */
export const themeVersion = (): number => version;

/** Switches every token to `scheme` with `accent` as the primary (null/invalid → default blue). */
export function applyTheme(scheme: Scheme, accent?: string | null): void {
  Object.assign(theme, scheme === 'dark' ? DARK : LIGHT, accentFor(scheme, accent), { scheme });
  version++;
}

/**
 * A value derived from the tokens — typically a `StyleSheet.create({...})` object — rebuilt lazily
 * after the scheme changes. Use it instead of a module-level constant that captures colours at
 * import time: `const styles = themed(() => StyleSheet.create({ … }))`, read exactly as before.
 */
export function themed<T extends object>(factory: () => T): T {
  let cached: T | null = null;
  let at = -1;
  const current = (): T => {
    if (at !== version || cached === null) {
      cached = factory();
      at = version;
    }
    return cached;
  };
  return new Proxy({} as T, {
    get: (_, key) => (current() as Record<string | symbol, unknown>)[key],
    has: (_, key) => key in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_, key) => {
      const d = Object.getOwnPropertyDescriptor(current(), key);
      return d ? { ...d, configurable: true } : undefined;
    },
  });
}
