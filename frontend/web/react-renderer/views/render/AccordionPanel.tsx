import React, { useState } from 'react'
import { Stack } from '@kit'
import { interpolate } from '@rn/core/expressions'
import { childrenOf, metaOf as meta, type Dict } from '@mr/render/wire'
import { ComponentRenderer } from './ComponentRenderer'

/**
 * One accordion panel (AccordionLayout's, or a TabLayout's tab degraded to one on a narrow screen):
 * its label as the disclosure, its children inside, open when the wire says `active` / `open`. Its own
 * module so a design system with an expandable-panel component draws it (an override of this file:
 * UI5's ui5-panel, SLDS's slds-accordion).
 */
export function AccordionPanel({ panel, state, data }: { panel: unknown; state: Dict; data?: unknown }) {
  const m = meta(panel)
  const [open, setOpen] = useState(m['active'] === true || m['open'] === true)
  return (
    <details open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{ border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)', padding: 'var(--base-size-8) var(--base-size-16)' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{interpolate(String(m['label'] ?? ''), { state, data })}</summary>
      <div style={{ paddingTop: 'var(--base-size-12)' }}>
        {childrenOf(panel).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
      </div>
    </details>
  )
}

/** The accordion's panels, stacked (a design system with an accordion container wraps them in it). */
export function AccordionGroup({ children }: { children: React.ReactNode }) {
  return <Stack gap="condensed">{children}</Stack>
}
