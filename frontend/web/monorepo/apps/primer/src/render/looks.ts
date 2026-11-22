type Dict = Record<string, unknown>

export type ButtonVariant = 'default' | 'primary' | 'invisible' | 'danger'
export type LabelVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'sponsors'

/**
 * A Mateu button's look in Primer's vocabulary. Only a button the server marks primary looks
 * primary (Primer: one primary action per view); a destructive one is `danger`; the tertiary /
 * leave buttons (Cancel, Back) are `invisible`.
 */
export function buttonVariantOf(button: Dict): ButtonVariant {
  const style = String(button['buttonStyle'] ?? '').toLowerCase()
  const color = String(button['color'] ?? '').toLowerCase()
  if (color === 'error' || color === 'danger' || style === 'danger') return 'danger'
  if (style === 'primary') return 'primary'
  if (style === 'tertiary' || style === 'tertiaryinline' || style === 'invisible') return 'invisible'
  return 'default'
}

/** A badge colour (Lumo theme names on the wire) as a Primer Label variant. */
export function labelVariantOf(badge: Dict): LabelVariant {
  const c = String(badge['color'] ?? badge['theme'] ?? badge['tone'] ?? '').toLowerCase()
  if (c.includes('success') || c === 'green') return 'success'
  if (c.includes('error') || c.includes('danger') || c === 'red') return 'danger'
  if (c.includes('warning') || c === 'amber' || c === 'yellow') return 'attention'
  if (c.includes('contrast')) return 'secondary'
  if (c.includes('primary') || c.includes('info') || c === 'blue') return 'accent'
  return 'default'
}
