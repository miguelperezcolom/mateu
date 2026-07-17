// Design tokens extracted from the "[APP] Check in" Figma (RIU design system).
// Single source of truth for the renderer's colors, radii and spacing — components
// reference these instead of hardcoding hex values.
//
// The brand font is "Foco" (400/700). It is a licensed font, so it is NOT bundled here:
// load it via expo-font in the host app and set `theme.fontFamily` before rendering
// to have text pick it up; undefined falls back to the system font.

export const theme = {
  // brand
  primary: '#E4002B',
  onPrimary: '#FFFFFF',

  // neutrals (the Figma uses the Bootstrap gray ramp)
  ink: '#343A40', // primary text
  muted: '#6C757D', // secondary text
  faint: '#ADB5BD', // placeholders, disabled
  border: '#CED4DA',
  divider: '#E9ECEF',
  background: '#F4F4F5',
  white: '#FFFFFF',

  // semantic
  success: '#177A23',
  successBg: '#E8F2E9',
  warning: '#B85E04',
  warningBg: '#F8EFE6',
  danger: '#E4002B',
  dangerBg: '#FCE6EA',
  info: '#2763B1',
  infoBg: '#E9EFF7',

  // shape & rhythm
  radiusSm: 4, // inputs, buttons
  radiusMd: 8, // cards
  radiusPill: 100,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

  fontFamily: undefined as string | undefined,
};
