/**
 * `@App(accentColor)`: Horizon keeps its own theme — an app's accent only marks the brand area of the
 * shell bar (Fiori lets a company brand its shell, never its controls).
 */
export function ui5Accent(color: string): string {
  return `.mateu-shell-brand { --mateu-accent: ${color}; }`
}
