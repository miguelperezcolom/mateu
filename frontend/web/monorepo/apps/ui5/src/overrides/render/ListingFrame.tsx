import React from 'react'
import { Text } from '@kit'

/**
 * A Fiori list report's frame: the toolbar (ListingToolbar) carries the title and the row count, the
 * subtitle follows it, then the rows.
 */
export function ListingFrame({ m, titleId, toolbar, children }: {
  m: { id: string; title: string; subtitle: string }; titleId: string; toolbar: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section className="mateu-listing" aria-labelledby={m.title ? titleId : undefined}>
      {toolbar}
      {m.subtitle && <Text as="p" className="mateu-listing-subtitle" id={`${m.id}-subtitle`}>{m.subtitle}</Text>}
      {children}
    </section>
  )
}
