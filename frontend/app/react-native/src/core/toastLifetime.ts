/**
 * How long a toast stays, in ms; 0 = until the user dismisses it. An ERROR always stays — in every
 * renderer and backend (owner, 2026-10-12): read in four seconds and gone, the reason a save failed
 * was often never seen. Undoable toasts default to 10 s so the button can be pressed.
 */
export function toastLifetime(
  variant: string,
  options?: { duration?: number; undo?: unknown },
): number {
  if (variant === 'error') return 0;
  if (options?.duration && options.duration > 0) return options.duration;
  return options?.undo ? 10000 : 4000;
}
