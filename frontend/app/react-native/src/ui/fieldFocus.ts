import { createContext } from 'react';

/**
 * How an input tells the field around it how to focus it: the view's controller moves the focus to
 * the FIRST field a rejected save marked invalid (the web's focusFirstInvalidField) — the fields were
 * marked, but the focus stayed where it was and a screen-reader user did not know where to go.
 */
export const FieldFocusRegistrar = createContext<((focus: () => void) => void) | null>(null);
