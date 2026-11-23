import React from 'react'
import { Heading, Stack, Text } from '@kit'
import { interpolate } from '@rn/core/expressions'
import { LAYOUT_STYLE, styleOf } from '@mr/render/styleOf'
import { ComponentRenderer } from './ComponentRenderer'

/**
 * The boxes of a page: Card / FormSection / FormSubSection. Their frame is the design system's own
 * markup, so this file is what a renderer overrides when its design system draws cards with a
 * different structure (SLDS: slds-card) — the rest of ComponentRenderer stays shared. The accordion
 * is its own seam (AccordionPanel.tsx).
 */
type Dict = Record<string, unknown>

const meta = (c: unknown): Dict => (((c as Dict | null)?.['metadata'] as Dict | undefined) ?? {})
const childrenOf = (c: unknown): unknown[] => (((c as Dict | null)?.['children'] as unknown[] | undefined) ?? [])
const node = (v: unknown): Dict | null => (v && typeof v === 'object' ? (v as Dict) : null)

export const sectionClassesOf = (component: Dict): string | undefined =>
  String(component['cssClasses'] ?? '').split(/\s+/).filter((c) => /^mateu-section(--sticky)?$/.test(c)).join(' ') || undefined

/** A titled, outlined region: Primer has no Card component, its boxes are a bordered surface with a heading. */
export function Box({ component, state, data, level }: { component: Dict; state: Dict; data?: unknown; level: 2 | 3 }) {
  const m = meta(component)
  const ctx = { state, data }
  // a Card's slots may be text or components (a title with a badge, a media image, header extras)
  const slot = (v: unknown) => (node(v) ? <ComponentRenderer component={v} state={state} data={data} /> : null)
  const title = typeof m['title'] === 'string' ? interpolate(m['title'], ctx) : ''
  const subtitle = typeof m['subtitle'] === 'string' ? interpolate(m['subtitle'], ctx) : ''
  const titleNode = title ? <Heading as={`h${level}` as 'h2'} variant="small">{title}</Heading> : slot(m['title'])
  const subtitleNode = subtitle ? <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)', margin: 0 }}>{subtitle}</Text> : slot(m['subtitle'])
  const prefix = slot(m['headerPrefix'])
  const suffix = slot(m['headerSuffix'])
  const media = slot(m['media'])
  const frameless = (component['cssClasses'] as string | undefined)?.includes('frameless')
  const variants = ((m['variants'] as string[] | undefined) ?? []).map(String)
  const elevated = variants.includes('elevated')
  const horizontal = variants.includes('horizontal') && !!media
  return (
    <section
      aria-label={title || undefined}
      // the server's marker classes (mateu-section, mateu-section--sticky): the page's @Toc index and
      // its sticky stacking find the section cards by them
      className={sectionClassesOf(component)}
      style={{
        border: frameless || (elevated && !variants.includes('outlined')) ? 'none' : 'var(--borderWidth-thin) solid var(--borderColor-default)',
        boxShadow: elevated ? 'var(--shadow-resting-medium)' : undefined,
        display: horizontal ? 'flex' : undefined,
        gap: horizontal ? 'var(--base-size-16)' : undefined,
        borderRadius: 'var(--borderRadius-medium)',
        background: 'var(--bgColor-default)',
        padding: frameless ? 0 : 'var(--base-size-16)',
        overflow: 'hidden',
        ...styleOf(component, LAYOUT_STYLE.filter((k) => k !== 'gap' && k !== 'padding')),
      }}
    >
      {media && (horizontal
        ? <div style={{ flex: '0 0 40%', maxWidth: '40%', margin: frameless ? 0 : 'calc(-1 * var(--base-size-16)) 0 calc(-1 * var(--base-size-16)) calc(-1 * var(--base-size-16))' }}>{media}</div>
        : <div style={{ margin: frameless ? 0 : 'calc(-1 * var(--base-size-16)) calc(-1 * var(--base-size-16)) var(--base-size-12)' }}>{media}</div>)}
      <div style={{ flex: 1, minWidth: 0 }}>
      {(titleNode || subtitleNode || prefix || suffix) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--base-size-12)', marginBottom: 'var(--base-size-12)' }}>
          {prefix}
          <div style={{ flex: 1, minWidth: 0 }}>
            {titleNode}
            {subtitleNode}
          </div>
          {suffix}
        </div>
      )}
      <Stack gap="normal">
        {slot(m['header'])}
        {slot(m['content'])}
        {childrenOf(component).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)}
        {slot(m['footer'])}
      </Stack>
      </div>
    </section>
  )
}
