// LIGHT / DARK — the same contract as the Vaadin renderer: the user's choice is kept in
// localStorage['mateu-theme'] ('light' | 'dark') and wins; without one the OS preference
// (prefers-color-scheme) decides, and follows it while no choice is stored. @App(themeToggle)
// adds the switch to the global header.
//
// Redwood's dark is JET's OWN inverted colour scheme: JET 18 (the version loaded from the Oracle
// CDN) ships no separate dark theme, only `oj-color-invert`, which re-tokens every --oj-core-*
// colour (text, content surface, hover, borders, links) of its subtree. It goes on <html>, so the
// whole page (Spectra templates, Core Pack, classic components) is re-tokened; `oj-c-colorscheme-dark`
// is the Core Pack's own marker. Only the few surfaces the shell and app.css paint themselves are
// overridden, under `html.mateu-theme-dark` (app.css) — no Oracle file is copied.

export const THEME_KEY = 'mateu-theme'
const DARK_CLASSES = ['oj-color-invert', 'oj-c-colorscheme-dark', 'mateu-theme-dark']

/** The theme to start with: the stored choice, else the OS preference, else light. Pure. */
export function initialThemeOf(stored, prefersDark) {
  if (stored === 'dark' || stored === 'light') return stored
  return prefersDark ? 'dark' : 'light'
}

/** The other theme. */
export const nextThemeOf = (theme) => (theme === 'dark' ? 'light' : 'dark')

const defaultDoc = () => (typeof document !== 'undefined' ? document : null)
const defaultWin = () => (typeof window !== 'undefined' ? window : null)

/** Paints a theme on the page (the root element's classes and its `theme` attribute). */
export function applyTheme(theme, doc = defaultDoc()) {
  const t = theme === 'dark' ? 'dark' : 'light'
  if (!doc) return t
  const root = doc.documentElement
  for (const cls of DARK_CLASSES) root.classList.toggle(cls, t === 'dark')
  root.setAttribute('theme', t)
  return t
}

const storage = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null } catch (e) { return null } }

function storedTheme() {
  const s = storage()
  try { return s ? s.getItem(THEME_KEY) : null } catch (e) { return null }
}

const darkQuery = (win) => {
  try { return win && win.matchMedia ? win.matchMedia('(prefers-color-scheme: dark)') : null } catch (e) { return null }
}

let osListening = false

/**
 * At boot: the stored choice or the OS preference, painted. While no choice is stored, a change
 * of the OS preference repaints (registered once).
 */
export function applyInitialTheme(doc = defaultDoc(), win = defaultWin()) {
  const mq = darkQuery(win)
  const theme = applyTheme(initialThemeOf(storedTheme(), !!(mq && mq.matches)), doc)
  if (mq && !osListening) {
    osListening = true
    const onChange = (e) => {
      const stored = storedTheme()
      if (stored === 'dark' || stored === 'light') return
      applyTheme(e && e.matches ? 'dark' : 'light', doc)
    }
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
    else if (typeof mq.addListener === 'function') mq.addListener(onChange)
  }
  return theme
}

/** The theme on the page now. */
export const currentThemeOf = (doc = defaultDoc()) =>
  (doc && doc.documentElement.getAttribute('theme') === 'dark' ? 'dark' : 'light')

/** The header switch: flips, paints and remembers. Returns the new theme. */
export function toggleTheme(doc = defaultDoc()) {
  const next = applyTheme(nextThemeOf(currentThemeOf(doc)), doc)
  const s = storage()
  try { if (s) s.setItem(THEME_KEY, next) } catch (e) { /* private mode: not remembered */ }
  return next
}

/** For tests: forget the OS listener so applyInitialTheme registers again. */
export function resetThemeListenerForTests() { osListening = false }
