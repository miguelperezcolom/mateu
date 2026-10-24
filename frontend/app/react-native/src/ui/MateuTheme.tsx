/**
 * The renderer's look: Material Design 3 through React Native Paper (MIT), themed FROM the tokens in
 * src/theme.ts so a Paper control and a hand-drawn Mateu component always agree.
 *
 *  - Light / dark follows the device (`useColorScheme`) unless the app's theme toggle
 *    (`@App(themeToggle = true)`) overrides it for the session.
 *  - The primary colour is the app's accent (`AppDto.accentColor`, `@App(accentColor)`) when the
 *    wire carries a hex one, else a neutral blue (`accentFor` adjusts it until it reads).
 *
 * A change re-applies the tokens (`applyTheme`) and re-renders the whole tree from here: the
 * stylesheets built with `themed(...)` rebuild themselves lazily on that render.
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, type MD3Theme } from 'react-native-paper';
import { DarkTheme as NavDark, DefaultTheme as NavLight, type Theme as NavTheme } from '@react-navigation/native';
import { applyTheme, mix, theme, type Scheme } from '../theme';

interface ThemeControl {
  dark: boolean;
  /** The app's theme toggle: force a scheme for this session (null = follow the device). */
  setSchemeOverride: (scheme: Scheme | null) => void;
  /** The app's accent colour (`AppDto.accentColor`); null/invalid = the default blue. */
  setAccent: (accent: string | null | undefined) => void;
}

const ThemeControlContext = createContext<ThemeControl>({ dark: false, setSchemeOverride: () => {}, setAccent: () => {} });

export const useThemeControl = (): ThemeControl => useContext(ThemeControlContext);

/** The Paper (MD3) theme of the current tokens. */
export function paperTheme(): MD3Theme {
  const base = theme.scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const tint = (w: number) => mix(theme.surface, theme.primary, w);
  return {
    ...base,
    roundness: 4,
    colors: {
      ...base.colors,
      primary: theme.primary,
      onPrimary: theme.onPrimary,
      primaryContainer: theme.primaryContainer,
      onPrimaryContainer: theme.onPrimaryContainer,
      // secondary = the accent's container: active drawer item, tonal buttons, selected segments
      secondary: theme.muted,
      secondaryContainer: theme.primaryContainer,
      onSecondaryContainer: theme.onPrimaryContainer,
      background: theme.background,
      onBackground: theme.ink,
      surface: theme.surface,
      onSurface: theme.ink,
      surfaceVariant: theme.scheme === 'dark' ? '#2A2C31' : '#ECEEF2',
      onSurfaceVariant: theme.muted,
      outline: theme.scheme === 'dark' ? '#8D9199' : '#73777F',
      outlineVariant: theme.border,
      error: theme.danger,
      onError: theme.onFill,
      errorContainer: theme.dangerBg,
      onErrorContainer: theme.danger,
      elevation: {
        level0: 'transparent',
        level1: tint(0.05),
        level2: tint(0.08),
        level3: tint(0.11),
        level4: tint(0.12),
        level5: tint(0.14),
      },
    },
  };
}

/** React Navigation's theme of the current tokens (screen backgrounds, borders, native headers). */
export function navigationTheme(): NavTheme {
  const base = theme.scheme === 'dark' ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.ink,
      border: theme.divider,
      notification: theme.danger,
    },
  };
}

export function MateuThemeProvider({ children }: { children: () => React.ReactNode }) {
  const system = useColorScheme();
  const [override, setSchemeOverride] = useState<Scheme | null>(null);
  const [accent, setAccentState] = useState<string | null>(null);
  const scheme: Scheme = override ?? (system === 'dark' ? 'dark' : 'light');

  // applied DURING render, before any child reads a token: the whole subtree re-renders below
  const paper = useMemo(() => {
    applyTheme(scheme, accent);
    return paperTheme();
  }, [scheme, accent]);

  const control = useMemo<ThemeControl>(
    () => ({
      dark: scheme === 'dark',
      setSchemeOverride,
      setAccent: (a) => setAccentState(a && /^#[0-9a-f]{3,8}$/i.test(a.trim()) ? a.trim() : null),
    }),
    [scheme],
  );

  return (
    <ThemeControlContext.Provider value={control}>
      <PaperProvider theme={paper}>{children()}</PaperProvider>
    </ThemeControlContext.Provider>
  );
}
