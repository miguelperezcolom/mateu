// Design tokens of the React Native renderer — the single source of truth for its colors, radii,
// spacing and touch sizes; components reference these instead of hardcoding values.
//
// The palette is deliberately NEUTRAL (no brand identity): a Mateu app should look like a
// well-made app of the platform, so the accent is a system-like blue and the semantic colors
// follow Material 3 / Apple HIG meanings — red is reserved for errors and destructive actions, it
// is never the primary accent (an accent that looks like an error makes every primary button
// read as a warning). A host app that needs its brand overrides these values before rendering.
//
// Every TEXT token is checked against the surfaces it is drawn on by `theme.test.ts`: WCAG 2.2 AA
// asks 4.5:1 for normal text, and secondary text ("faint") is text too — hierarchy comes from
// size and weight, not from greys too light to read.
//
// `fontFamily`: set it (after loading the font with expo-font) to have text pick it up; undefined
// falls back to the system font, which is the platform-native choice.

export const theme = {
  // accent
  primary: '#2563EB', // 5.2:1 under white text
  onPrimary: '#FFFFFF',

  // neutrals
  ink: '#343A40', // primary text
  muted: '#5F6670', // secondary text
  faint: '#646B73', // tertiary text, placeholders, captions — still ≥ 4.5:1 on every light surface
  border: '#CED4DA', // decorative only (never text)
  divider: '#E9ECEF',
  background: '#F4F4F5',
  white: '#FFFFFF',
  disabled: '#ADB5BD', // disabled controls (exempt from contrast minimums, WCAG 1.4.3)

  // semantic
  success: '#177A23',
  successBg: '#E8F2E9',
  warning: '#9A5200',
  warningBg: '#F8EFE6',
  danger: '#B3261E',
  dangerBg: '#FCE6EA',
  info: '#2763B1',
  infoBg: '#E9EFF7',

  // shape & rhythm
  radiusSm: 4, // inputs, buttons
  radiusMd: 8, // cards
  radiusPill: 100,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

  // touch: Apple HIG asks 44pt and Material 48dp for a tappable target; 44 is the floor used
  // for buttons, and `hitSlop` extends smaller glyph controls (✕, checkboxes) up to it.
  minTouch: 44,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },

  fontFamily: undefined as string | undefined,
};
