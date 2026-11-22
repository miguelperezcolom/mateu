import React, { useState } from 'react'
import { AnchoredOverlay, Tooltip as PrimerTooltip } from '@primer/react'
import { ChevronDownIcon, ChevronRightIcon } from '@primer/octicons-react'
import { ComponentRenderer } from '../../ComponentRenderer'
import type { CatalogueProps } from '../types'
import { childrenOf, isNode, list, MateuAvatar, str, useText, WireIcon } from './shared'
import { tx } from '../../../i18n/texts'

/** Icon: the Octicon its token names (an emoji as written). */
export function Icon({ metadata }: CatalogueProps) {
  return <span className="mateu-icon"><WireIcon token={metadata['icon']} /></span>
}

/** Avatar: the person's image, else their initials on a Primer display colour. */
export function Avatar({ metadata }: CatalogueProps) {
  return <MateuAvatar name={str(metadata['name'])} image={metadata['image']} abbreviation={metadata['abbreviation']} />
}

/** AvatarGroup: overlapping avatars (Primer's AvatarStack look), the rest as «+N». */
export function AvatarGroup({ metadata }: CatalogueProps) {
  const all = list(metadata['avatars'])
  const max = Number(metadata['maxItemsVisible'] ?? 0) || all.length
  const shown = all.slice(0, max)
  const rest = all.length - shown.length
  const names = all.map((a) => str(a['name'])).filter(Boolean)
  return (
    <span className="mateu-avatar-group" role="group" aria-label={names.join(', ') || tx('people')}>
      {shown.map((a, i) => (
        <span key={i} className="mateu-avatar-group__item" title={str(a['name'])}>
          <MateuAvatar name={str(a['name'])} image={a['image']} abbreviation={a['abbreviation']} size={28} />
        </span>
      ))}
      {rest > 0 && <span className="mateu-avatar-group__item mateu-avatar-group__more" title={names.slice(max).join(', ')}>+{rest}</span>}
    </span>
  )
}

/** Details: a disclosure — its summary (a component or a text) opens its content. */
export function Details({ metadata, state, data }: CatalogueProps) {
  const [open, setOpen] = useState(metadata['opened'] === true)
  const summary = metadata['summary']
  return (
    <details className="mateu-details" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="mateu-details__summary">{isNode(summary) ? <ComponentRenderer component={summary} state={state} data={data} /> : str(summary)}</span>
      </summary>
      {open && isNode(metadata['content']) && (
        <div className="mateu-details__body"><ComponentRenderer component={metadata['content']} state={state} data={data} /></div>
      )}
    </details>
  )
}

const INTERACTIVE = new Set(['Button', 'Anchor', 'MenuBar', 'ContextMenu'])

/**
 * Tooltip: Primer's, on what it wraps. Primer requires an interactive trigger (so a keyboard and a
 * screen reader reach the text): a wrapped button or link is it; anything else (a badge, a text)
 * sits in a plain, unstyled button.
 */
export function Tooltip({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const tip = text(metadata['text'])
  const wrapped = isNode(metadata['wrapped']) ? <ComponentRenderer component={metadata['wrapped']} state={state} data={data} /> : null
  if (!tip) return wrapped
  const wrappedType = str(((metadata['wrapped'] as Record<string, unknown> | undefined)?.['metadata'] as Record<string, unknown> | undefined)?.['type'])
  return (
    <PrimerTooltip text={tip} direction="n">
      {INTERACTIVE.has(wrappedType)
        ? <span className="mateu-tooltip-anchor">{wrapped}</span>
        : <button type="button" className="mateu-tooltip-anchor mateu-tooltip-anchor--plain">{wrapped}</button>}
    </PrimerTooltip>
  )
}

/**
 * Popover: what it wraps is the trigger (a click, or a hover when declared so) for an anchored
 * Primer overlay holding its content. The trigger OWNS the click: a wrapped button opens the
 * popover, it does not also run an action.
 */
export function Popover({ metadata, state, data }: CatalogueProps) {
  const [open, setOpen] = useState(false)
  const hover = str(metadata['trigger']).toLowerCase() === 'hover'
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      overlayProps={{ role: 'dialog', 'aria-label': tx('details') }}
      renderAnchor={(anchorProps) => (
        <span
          {...anchorProps}
          className="mateu-popover-anchor"
          tabIndex={0}
          role="button"
          aria-expanded={open}
          onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o) } }}
          onMouseEnter={hover ? () => setOpen(true) : undefined}
          onMouseLeave={hover ? () => setOpen(false) : undefined}
        >
          {isNode(metadata['wrapped']) ? <ComponentRenderer component={metadata['wrapped']} state={state} data={data} /> : null}
        </span>
      )}
    >
      <div className="mateu-popover-body">
        {isNode(metadata['content']) ? <ComponentRenderer component={metadata['content']} state={state} data={data} /> : null}
      </div>
    </AnchoredOverlay>
  )
}

/** FormItem: a labelled group of components (a label over its children). */
export function FormItem({ component, metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const label = text(metadata['label'])
  return (
    <div className="mateu-form-item">
      {label ? <div className="mateu-form-item__label">{label}</div> : null}
      {childrenOf(component).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
    </div>
  )
}
