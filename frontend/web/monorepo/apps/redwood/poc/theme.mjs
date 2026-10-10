// LIGHT / DARK (@App(themeToggle)): the same contract as the web renderers — the user's choice is
// kept in localStorage['mateu-theme'] and wins; without one the OS preference (prefers-color-scheme)
// decides. Redwood's dark is JET's own inverted colour scheme: `oj-color-invert` on the page (the
// classic components' palette) plus `oj-c-colorscheme-dark` (the Core Pack / preact theme) — no
// palette is redrawn here.

export const THEME_KEY = 'mateu-theme'
const DARK_CLASSES = ['oj-color-invert', 'oj-c-colorscheme-dark', 'mateu-theme-dark']

/** The theme to start with: the stored choice, else the OS preference, else light. Pure. */
export function initialThemeOf(stored, prefersDark) {
  if (stored === 'dark' || stored === 'light') return stored
  return prefersDark ? 'dark' : 'light'
}

/** The other theme. */
export const nextThemeOf = (theme) => (theme === 'dark' ? 'light' : 'dark')

/** Paints a theme on the page (the root element's classes and its `theme` attribute). */
export function applyTheme(theme, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return theme
  const root = doc.documentElement
  for (const cls of DARK_CLASSES) root.classList.toggle(cls, theme === 'dark')
  root.setAttribute('theme', theme === 'dark' ? 'dark' : 'light')
  return theme
}

const storage = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null } catch (e) { return null } }

/** At boot: the stored choice or the OS preference, painted. */
export function applyInitialTheme(doc = typeof document !== 'undefined' ? document : null, win = typeof window !== 'undefined' ? window : null) {
  const s = storage()
  let stored = null
  try { stored = s ? s.getItem(THEME_KEY) : null } catch (e) { stored = null }
  const prefersDark = !!(win && win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches)
  return applyTheme(initialThemeOf(stored, prefersDark), doc)
}

/** The header switch: flips, paints and remembers. Returns the new theme. */
export function toggleTheme(doc = typeof document !== 'undefined' ? document : null) {
  const current = doc && doc.documentElement.getAttribute('theme') === 'dark' ? 'dark' : 'light'
  const next = applyTheme(nextThemeOf(current), doc)
  const s = storage()
  try { if (s) s.setItem(THEME_KEY, next) } catch (e) { /* private mode: not remembered */ }
  return next
}
