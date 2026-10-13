// LIGHT ONLY. Dark mode makes no sense in Redwood (the framework author's decision, 2026-10-13):
// the Redwood renderer ignores @App(themeToggle) — no header switch — and always paints light,
// whatever the OS prefers (prefers-color-scheme) and whatever a previous version stored in
// localStorage['mateu-theme'] (left untouched: the Vaadin renderer of the same app, on the same
// origin, still reads it). A page that came up dark — that old choice, or an embedding host page
// with JET's inverted scheme on <html> — is turned back to light at boot.

// the classes the old dark mode put on <html>: JET's inverted colour scheme (classic + Core Pack)
const DARK_CLASSES = ['oj-color-invert', 'oj-c-colorscheme-dark', 'mateu-theme-dark']

/** Paints the (only) light theme on the page: no dark class on the root, `theme="light"`. */
export function applyLightTheme(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return 'light'
  const root = doc.documentElement
  for (const cls of DARK_CLASSES) root.classList.toggle(cls, false)
  root.setAttribute('theme', 'light')
  return 'light'
}
