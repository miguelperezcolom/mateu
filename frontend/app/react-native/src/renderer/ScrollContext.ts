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
