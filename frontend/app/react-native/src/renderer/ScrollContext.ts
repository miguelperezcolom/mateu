import { createContext, useContext } from 'react';

/**
 * Whether a screen's own vertical ScrollView already holds this component. A list inside one must
 * not scroll by itself: Android gives the gesture to the outer one, so the inner never moves, and
 * React Native warns that its windowing breaks.
 */
export const InsideVerticalScroll = createContext(false);
export const useInsideVerticalScroll = (): boolean => useContext(InsideVerticalScroll);

/**
 * Inside a dialog, a screen is as tall as what it holds. Everywhere else its root fills the space it
 * is given (`flex: 1`), which in a box with no height of its own would collapse to nothing.
 */
export const FitsContent = createContext(false);
export const FIT_CONTENT = { flexGrow: 0, flexShrink: 1 } as const;
export const useFitsContent = (): boolean => useContext(FitsContent);

/**
 * A routed listing shows its toolbar in its PAGE's header: when the page around it already shows
 * one, the listing's copy stands down (the web's mateu-table-crud rule) — else every button twice.
 */
export const PageShowsToolbar = createContext(false);
export const usePageShowsToolbar = (): boolean => useContext(PageShowsToolbar);

/**
 * Whether the screen was pushed over another one, so a back arrow (in the shell's bar or the
 * screen's own) and Android's system Back already lead back (RN-26).
 */
export const ScreenHasBack = createContext(false);
export const useScreenHasBack = (): boolean => useContext(ScreenHasBack);

/**
 * What the shell's top app bar says right now (RN-22: the screen's title), or null when the screen
 * has no bar of its own above it (tabs, the hub's bar): a page header repeating it drops its title.
 */
export const BarTitle = createContext<string | null>(null);
export const useBarTitle = (): string | null => useContext(BarTitle);

/**
 * The chrome of the embedded micro frontend whose OWN page this is (MicroFrontend.chrome): NONE draws
 * no page header, COMPACT only its actions, PAGE all of it (no breadcrumb of its own). Undefined: a
 * page of its own (or an island, which draws its header as it is). The web's embeddedChrome.ts.
 */
export type EmbeddedChromeMode = 'NONE' | 'COMPACT' | 'PAGE';
export const EmbeddedChrome = createContext<EmbeddedChromeMode | undefined>(undefined);
export const useEmbeddedChrome = (): EmbeddedChromeMode | undefined => useContext(EmbeddedChrome);

/** A wire chrome value, or undefined for anything else. */
export function chromeOf(value: unknown): EmbeddedChromeMode | undefined {
  const v = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return v === 'NONE' || v === 'COMPACT' || v === 'PAGE' ? v : undefined;
}

/** What of its page header an embedded micro frontend draws: its texts (title, subtitle, badges…)
 *  and its actions. NONE neither, COMPACT the actions only, PAGE / not embedded both. */
export function headerPartsOf(chrome: EmbeddedChromeMode | undefined): { texts: boolean; actions: boolean } {
  return { texts: chrome !== 'NONE' && chrome !== 'COMPACT', actions: chrome !== 'NONE' };
}
