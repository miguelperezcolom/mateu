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

export function AccordionPanel({ panel, state, data }: { panel: unknown; state: Dict; data?: unknown }) {
  const m = meta(panel)
  const [open, setOpen] = useState(m['active'] === true || m['open'] === true)
  const id = React.useId()
  return (
    <div className="slds-accordion__list-item">
      <section className={'slds-accordion__section' + (open ? ' slds-is-open' : '')}>
        <div className="slds-accordion__summary">
          <h3 className="slds-accordion__summary-heading">
            <button type="button" className="slds-button slds-button_reset slds-accordion__summary-action" aria-controls={id} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <ChevronDownIcon size={14} className="slds-accordion__summary-action-icon slds-button__icon slds-button__icon_left" />
              <span className="slds-accordion__summary-content" title={String(m['label'] ?? '')}>{interpolate(String(m['label'] ?? ''), { state, data })}</span>
            </button>
          </h3>
        </div>
        <div className="slds-accordion__content" id={id} hidden={!open}>
          {open && childrenOf(panel).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
        </div>
      </section>
    </div>
  )
}


/** SLDS's accordion list. */
export function AccordionGroup({ children }: { children: React.ReactNode }) {
  return <div className="slds-accordion">{children}</div>
}
