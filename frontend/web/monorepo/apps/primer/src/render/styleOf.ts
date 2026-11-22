import type React from 'react'

/** The layout properties a wire `style` may set on a Primer layout (the look stays Primer's). */
export const LAYOUT_STYLE = ['width', 'max-width', 'min-width', 'gap', 'padding']
/** A box the server frames (a micro frontend, a raw element): its size, frame and spacing too. */
export const BOX_STYLE = [...LAYOUT_STYLE, 'height', 'min-height', 'max-height', 'margin', 'border', 'border-radius', 'overflow']

/**
 * A wire `style` (CSS text) → React style, keeping only the listed properties and never a value
 * that loads something (`url(…)`) or evaluates (`expression(…)`).
 */
export function styleOf(component: unknown, keep: string[] = LAYOUT_STYLE): React.CSSProperties {
  const raw = String((component as Record<string, unknown> | null)?.['style'] ?? '')
  const out: Record<string, string> = {}
  for (const decl of raw.split(';')) {
    const at = decl.indexOf(':')
    if (at < 0) continue
    const prop = decl.slice(0, at).trim().toLowerCase()
    const value = decl.slice(at + 1).trim()
    if (!keep.includes(prop) || !value || /url\(|expression\(/i.test(value)) continue
    out[prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value
  }
  return out as React.CSSProperties
}
