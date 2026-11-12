/** The shortest time a toast with an action (Undo, Retry…) stays, in ms — WCAG 2.2.1, like the web's
 *  ACTIONABLE_TOAST_MIN_MS: a declared shorter duration would take the action away before it is reached. */
export const ACTIONABLE_TOAST_MIN_MS = 10000;

/**
 * How long a toast stays, in ms; 0 = until the user dismisses it. An ERROR always stays — in every
 * renderer and backend (owner, 2026-10-12): read in four seconds and gone, the reason a save failed
 * was often never seen. Toasts with an action stay at least ACTIONABLE_TOAST_MIN_MS, and while a
 * screen reader is on they stay until dismissed (WCAG 2.2.1: a native snackbar cannot be "hovered",
 * and swiping to the action takes a screen-reader user longer than any fixed clock).
 */
export function toastLifetime(
  variant: string,
  options?: { duration?: number; undo?: unknown; sticky?: boolean; screenReader?: boolean },
): number {
  if (variant === 'error' || options?.sticky) return 0;
  const actionable = !!options?.undo;
  if (actionable && options?.screenReader) return 0;
  const declared = options?.duration && options.duration > 0 ? options.duration : 0;
  if (actionable) return Math.max(declared, ACTIONABLE_TOAST_MIN_MS);
  return declared || 4000;
}
