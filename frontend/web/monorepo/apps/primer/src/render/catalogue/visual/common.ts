import type React from 'react'

export type Dict = Record<string, unknown>
export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

/** Primer's data-vis palette, in the order a series takes it (colour-blind distinguishable first). */
export const SERIES = ['blue', 'orange', 'green', 'purple', 'red', 'teal', 'yellow', 'pink', 'brown', 'gray']
export const seriesColor = (i: number, strength: 'emphasis' | 'muted' = 'emphasis') =>
  `var(--data-${SERIES[i % SERIES.length]}-color-${strength})`

const TONE_ALIASES: Record<string, Tone> = {
  info: 'info', primary: 'info', accent: 'info', blue: 'info', normal: 'info',
  success: 'success', ok: 'success', green: 'success', done: 'success', positive: 'success',
  warning: 'warning', attention: 'warning', amber: 'warning', yellow: 'warning', orange: 'warning', pending: 'warning',
  danger: 'danger', error: 'danger', critical: 'danger', red: 'danger', negative: 'danger',
  neutral: 'neutral', contrast: 'neutral', gray: 'neutral', grey: 'neutral', muted: 'neutral',
}
const PRIMER_TONE: Record<Tone, string> = { info: 'accent', success: 'success', warning: 'attention', danger: 'danger', neutral: 'neutral' }

export const toneOf = (value: unknown): Tone | undefined =>
  typeof value === 'string' ? TONE_ALIASES[value.trim().toLowerCase()] : undefined

/** A tone's surface / ink / border, Primer's semantic tokens (light and dark follow the theme). */
export const toneBg = (t: Tone, strength: 'muted' | 'emphasis' = 'muted') => `var(--bgColor-${PRIMER_TONE[t]}-${strength})`
export const toneFg = (t: Tone) => (t === 'neutral' ? 'var(--fgColor-muted)' : `var(--fgColor-${PRIMER_TONE[t]})`)
export const toneBorder = (t: Tone) => `var(--borderColor-${PRIMER_TONE[t]}-emphasis)`

/**
 * A colour the server named: a tone word → Primer's token; an explicit CSS colour (the app's own
 * data, e.g. a task's `#f39c12`) → as is; anything else → the fallback. Never a colour of ours.
 */
export function colorOf(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const tone = toneOf(value)
  if (tone) return tone === 'neutral' ? 'var(--fgColor-muted)' : toneBg(tone, 'emphasis')
  if (/^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|var\(--)/i.test(value.trim())) return value.trim()
  return fallback
}

export const meta = (c: unknown): Dict => (((c as Dict | null)?.['metadata'] as Dict | undefined) ?? {})
export const arr = <T = Dict>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
export const str = (v: unknown): string => (v == null ? '' : String(v))

/** Enter / Space activate a non-button element, like a native button. */
export const activate = (fn: () => void) => ({
  role: 'button',
  tabIndex: 0,
  onClick: fn,
  onKeyDown: (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  },
})
