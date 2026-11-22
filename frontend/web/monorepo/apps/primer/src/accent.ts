/**
 * `@App(accentColor)` on Primer's own accent hooks — the selected navigation item's marker and the
 * underline of the current tab — in the LIGHT scheme only (dark keeps Primer's tuned accent). More
 * specific than the primitives' theme blocks, which Primer's ThemeProvider repeats on its own root.
 */
export function primerAccent(color: string): string {
  const vars = `--mateu-accent: ${color}; --underlineNav-borderColor-active: ${color}; --borderColor-accent-emphasis: ${color};`
  return `:root[data-color-mode="light"], :root[data-color-mode="light"] [data-color-mode] { ${vars} }\n`
    + `@media (prefers-color-scheme: light) { :root[data-color-mode="auto"], :root[data-color-mode="auto"] [data-color-mode] { ${vars} } }`
}
