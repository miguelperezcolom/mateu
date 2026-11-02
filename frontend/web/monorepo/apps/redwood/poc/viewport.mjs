// The phone breakpoint of JET's drawer layout. Below it, oj-drawer-layout (and so Spectra's
// oj-sp-data-management-page) stops docking a drawer beside the content and turns it into a
// FULL-SCREEN overlay in its z-order container. Two consequences on a DataManagement page:
//   - a bottom panel open on load covers the listing on a phone (the page looks empty);
//   - a panel still open when the window grows past the breakpoint is reflowed IN the z-order
//     container (body level, normal flow) instead of back in the page — a band as tall as the
//     panel pushes the whole shell down (measured: 438 px on /loans, 390 → 1600 px).
// So the shell keeps the docked panels (end and bottom) closed while the viewport is narrow
// (mateuNarrow, bound in main-start-page.html) and docks them again once it is wide: closing them
// BEFORE the breakpoint is crossed is what leaves JET nothing to strand. The same flag folds a
// MENU_ON_TOP / TABS shell's menu strip into the hamburger's navigator (shell-page.html).

export const NARROW_VIEWPORT_QUERY = '(max-width: 599px)'

/** Whether a window (default: the global one) is at phone width. false without matchMedia. */
export function isNarrowViewport(win = typeof window !== 'undefined' ? window : undefined) {
  return !!(win && typeof win.matchMedia === 'function' && win.matchMedia(NARROW_VIEWPORT_QUERY).matches)
}

/**
 * Calls `listener(narrow)` now and on every crossing of the breakpoint. Returns the unsubscribe.
 * A window without matchMedia (tests, an old embedder) is wide and never changes.
 */
export function watchNarrowViewport(listener, win = typeof window !== 'undefined' ? window : undefined) {
  const mq = win && typeof win.matchMedia === 'function' ? win.matchMedia(NARROW_VIEWPORT_QUERY) : null
  listener(!!(mq && mq.matches))
  if (!mq) return () => {}
  const onChange = (e) => listener(!!e.matches)
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
  else if (typeof mq.addListener === 'function') mq.addListener(onChange)
  return () => {
    if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange)
    else if (typeof mq.removeListener === 'function') mq.removeListener(onChange)
  }
}
