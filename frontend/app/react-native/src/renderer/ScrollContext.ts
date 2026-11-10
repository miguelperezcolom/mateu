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
 * The page's @Toc sections registry: a section card registers its title, whether it is pinned, and
 * a way to scroll the page to it; the page draws the index from what registered. Null outside a
 * page that keeps one.
 */
export interface SectionEntry { key: string; title: string; sticky: boolean; ref: { current: unknown } }
export interface SectionRegistry { register: (entry: SectionEntry) => () => void }
export const SectionIndex = createContext<SectionRegistry | null>(null);
export const useSectionIndex = (): SectionRegistry | null => useContext(SectionIndex);
