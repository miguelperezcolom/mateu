/**
 * Pure width → presentation-mode decision for adaptable tab layouts (mateu-adaptive-tabs).
 * Kept free of DOM/Lit so it can be unit-tested in node.
 */

export type AdaptiveTabsMode = 'tabs' | 'accordion'

/** Container width (px) below which an adaptable tab layout degrades to an accordion. */
export const ADAPTIVE_TABS_BREAKPOINT = 640

export const modeForWidth = (width: number): AdaptiveTabsMode =>
    width > 0 && width < ADAPTIVE_TABS_BREAKPOINT ? 'accordion' : 'tabs'
