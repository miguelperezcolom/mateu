import React, { useState } from 'react'
import { Panel } from '@ui5/webcomponents-react'
import { interpolate } from '@rn/core/expressions'
import { childrenOf, metaOf as meta, type Dict } from '@mr/render/wire'
import { ComponentRenderer } from '@mr/views/render/ComponentRenderer'

/** An accordion panel: Fiori's expandable panel (ui5-panel), open when the wire says so. */
export function AccordionPanel({ panel, state, data }: { panel: unknown; state: Dict; data?: unknown }) {
  const m = meta(panel)
  const [open, setOpen] = useState(m['active'] === true || m['open'] === true)
  return (
    <Panel headerText={interpolate(String(m['label'] ?? ''), { state, data })} collapsed={!open || undefined} headerLevel="H3"
      onToggle={(e: Event) => setOpen(!(e.target as unknown as { collapsed: boolean }).collapsed)}>
      {open && childrenOf(panel).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
    </Panel>
  )
}

// the panels stack as the shared view stacks them
export { AccordionGroup } from '@mr/views/render/AccordionPanel'
