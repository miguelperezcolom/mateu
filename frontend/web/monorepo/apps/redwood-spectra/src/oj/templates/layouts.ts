import { html, nothing } from 'lit'
import type { SpectraRenderContext, SpectraTemplate } from '@/oj/types'

/**
 * VerticalLayout / HorizontalLayout → plain flex `<div>`s (NO vaadin-*-layout). These are pure
 * containers; we translate the wire flags (spacing/padding/fullWidth/wrap/justification/alignment)
 * to flexbox and render the children. Per-child `flexGrows` are not applied here — children carry
 * their own `style` (e.g. `flex:1`) in practice.
 */

const GAP: Record<string, string> = { xs: '0.25rem', s: '0.5rem', m: '1rem', l: '1.5rem', xl: '2rem' }
const JUSTIFY: Record<string, string> = {
  START: 'flex-start',
  CENTER: 'center',
  END: 'flex-end',
  BETWEEN: 'space-between',
  AROUND: 'space-around',
  EVENLY: 'space-evenly',
}
const ALIGN: Record<string, string> = {
  STRETCH: 'stretch',
  START: 'flex-start',
  CENTER: 'center',
  END: 'flex-end',
  BASELINE: 'baseline',
}

interface LayoutMeta {
  padding?: boolean
  spacing?: boolean
  fullWidth?: boolean
  wrap?: boolean
  spacingVariant?: string
  justification?: string
  horizontalAlignment?: string
  verticalAlignment?: string
}

function renderLayout(ctx: SpectraRenderContext, direction: 'row' | 'column') {
  const m = ctx.component.metadata as unknown as LayoutMeta
  const parts = [`display:flex`, `flex-direction:${direction}`]
  if (m.spacing) parts.push(`gap:${GAP[m.spacingVariant ?? 'm'] ?? '1rem'}`)
  if (m.padding) parts.push('padding:1rem')
  if (m.fullWidth) parts.push('width:100%')
  if (m.wrap) parts.push('flex-wrap:wrap')
  if (m.justification) parts.push(`justify-content:${JUSTIFY[m.justification] ?? 'flex-start'}`)
  const align = direction === 'column' ? m.horizontalAlignment : m.verticalAlignment
  if (align) parts.push(`align-items:${ALIGN[align] ?? 'stretch'}`)
  const style = parts.join('; ') + (ctx.component.style ? '; ' + ctx.component.style : '')
  return html`<div class=${ctx.component.cssClasses || nothing} style=${style}>
    ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
  </div>`
}

export const verticalLayoutTemplate: SpectraTemplate = {
  loaders: [],
  render: (ctx) => renderLayout(ctx, 'column'),
}

export const horizontalLayoutTemplate: SpectraTemplate = {
  loaders: [],
  render: (ctx) => renderLayout(ctx, 'row'),
}
