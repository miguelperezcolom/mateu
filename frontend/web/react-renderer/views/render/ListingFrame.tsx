import React from 'react'
import { Table } from '@kit'

// Split out of CrudRenderer.tsx: the frame a listing sits in — a design system whose list frame
// is structured differently (Fiori: the list report's toolbar carries the title) overrides this file.

/** Primer's Table.Container: the title and subtitle over the toolbar, the rows and the pages. */
export function ListingFrame({ m, titleId, toolbar, children }: {
  m: { id: string; title: string; subtitle: string }; titleId: string; toolbar: React.ReactNode; children: React.ReactNode
}) {
  return (
    <Table.Container>
      {m.title && <Table.Title as="h2" id={titleId}>{m.title}</Table.Title>}
      {m.subtitle && <Table.Subtitle as="p" id={`${m.id}-subtitle`}>{m.subtitle}</Table.Subtitle>}
      {toolbar}
      {children}
    </Table.Container>
  )
}
