import React, { useState } from 'react'
import { Stack } from '@kit'
import { ChevronDownIcon } from '@kit/icons'
import { interpolate } from '@rn/core/expressions'
import { LAYOUT_STYLE, styleOf } from '@mr/render/styleOf'
import { ComponentRenderer } from '@mr/views/render/ComponentRenderer'

/**
 * SLDS override of views/render/Box.tsx: cards are the Card blueprint (`slds-card` with header,
 * body and footer) and accordion panels the Accordion blueprint — markup a kit component cannot
 * stand in for, because the card's header, body and footer are SLDS's own regions.
 */
type Dict = Record<string, unknown>

const meta = (c: unknown): Dict => (((c as Dict | null)?.['metadata'] as Dict | undefined) ?? {})
const childrenOf = (c: unknown): unknown[] => (((c as Dict | null)?.['children'] as unknown[] | undefined) ?? [])
const node = (v: unknown): Dict | null => (v && typeof v === 'object' ? (v as Dict) : null)

export const sectionClassesOf = (component: Dict): string | undefined =>
  String(component['cssClasses'] ?? '').split(/\s+/).filter((c) => /^mateu-section(--sticky)?$/.test(c)).join(' ') || undefined

/**
 * A section, a card, a sub-section: SLDS's Card blueprint — `slds-card` with its header (the
 * figure = headerPrefix, the title + subtitle, the actions = headerSuffix), its body and footer.
 * A frameless section keeps only the body; `elevated` is the card's own shadow, `horizontal` puts the
 * media beside the body.
 */
export function Box({ component, state, data, level }: { component: Dict; state: Dict; data?: unknown; level: 2 | 3 }) {
  const m = meta(component)
  const ctx = { state, data }
  // a Card's slots may be text or components (a title with a badge, a media image, header extras)
  const slot = (v: unknown) => (node(v) ? <ComponentRenderer component={v} state={state} data={data} /> : null)
  const title = typeof m['title'] === 'string' ? interpolate(m['title'], ctx) : ''
  const subtitle = typeof m['subtitle'] === 'string' ? interpolate(m['subtitle'], ctx) : ''
  const Tag = `h${level}` as 'h2'
  const titleSlot = title ? null : slot(m['title'])
  // a title component (a Text, a title with a badge) still takes the blueprint's card-title type
  const titleNode = title
    ? <Tag className="slds-card__header-title"><span className="slds-truncate" title={title}>{title}</span></Tag>
    : titleSlot ? <div className="slds-card__header-title mateu-card__title-slot">{titleSlot}</div> : null
  const subtitleNode = subtitle ? <p className="slds-text-body_small slds-text-color_weak">{subtitle}</p> : slot(m['subtitle'])
  const prefix = slot(m['headerPrefix'])
  const suffix = slot(m['headerSuffix'])
  const media = slot(m['media'])
  const frameless = (component['cssClasses'] as string | undefined)?.includes('frameless')
  const variants = ((m['variants'] as string[] | undefined) ?? []).map(String)
  const elevated = variants.includes('elevated')
  const horizontal = variants.includes('horizontal') && !!media
  const footer = slot(m['footer'])
  const body = (
    <Stack gap="normal">
      {slot(m['header'])}
      {slot(m['content'])}
      {childrenOf(component).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)}
    </Stack>
  )
  const style = styleOf(component, LAYOUT_STYLE.filter((k) => k !== 'gap' && k !== 'padding'))
  // the server's marker classes (mateu-section, mateu-section--sticky): the page's @Toc index and
  // its sticky stacking find the section cards by them
  const markers = sectionClassesOf(component)
  if (frameless) {
    return <section aria-label={title || undefined} className={markers} style={style}>{titleNode}{subtitleNode}{body}{footer}</section>
  }
  return (
    <article aria-label={title || undefined} className={['slds-card', elevated ? 'mateu-card_elevated' : '', horizontal ? 'mateu-card_horizontal' : '', markers].filter(Boolean).join(' ')} style={style}>
      {media && <div className="mateu-card__media">{media}</div>}
      <div className="mateu-card__main">
        {(titleNode || subtitleNode || prefix || suffix) && (
          <div className="slds-card__header slds-grid">
            <header className="slds-media slds-media_center slds-has-flexi-truncate">
              {prefix && <div className="slds-media__figure">{prefix}</div>}
              <div className="slds-media__body">{titleNode}{subtitleNode}</div>
              {suffix && <div className="slds-no-flex">{suffix}</div>}
            </header>
          </div>
        )}
        <div className="slds-card__body slds-card__body_inner">{body}</div>
        {footer && <footer className="slds-card__footer">{footer}</footer>}
      </div>
    </article>
  )
}

/** SLDS's Accordion blueprint: a section per panel, its summary a button (aria-expanded) over the content. */
