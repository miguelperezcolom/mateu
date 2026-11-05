import { createContext, useContext } from 'react';

/**
 * Whether a screen's own vertical ScrollView already holds this component. A list inside one must
 * not scroll by itself: Android gives the gesture to the outer one, so the inner never moves, and
 * React Native warns that its windowing breaks.
 */
export const InsideVerticalScroll = createContext(false);
export const useInsideVerticalScroll = (): boolean => useContext(InsideVerticalScroll);
