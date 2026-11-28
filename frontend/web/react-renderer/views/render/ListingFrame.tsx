import React from 'react'
import { Table } from '@kit'
import { PageHeaderMarkup } from './page/PageHeaderMarkup'

// Split out of CrudRenderer.tsx: the frame a listing sits in — a design system whose list frame
// is structured differently (Fiori: the list report's toolbar carries the title) overrides this file.

/**
 * The listing's frame, top to bottom: its heading — the title and subtitle with the listing's own
 * actions beside them; the PAGE header when the listing is the page (a route whose view is the
 * listing itself, as a smart-search page is) —, the search row (toolbar), then the applied filters,
 * the rows and the pages (children).
 */
export function ListingFrame({ m, titleId, toolbar, actions, asPage, children }: {
  m: { id: string; title: string; subtitle: string }; titleId: string; toolbar: React.ReactNode; children: React.ReactNode
  /** The listing's own actions (ListingButtons). */
  actions?: React.ReactNode
  /** The listing is the whole view: its heading is the page's. */
  asPage?: boolean
}) {
  const heading = asPage
    ? (m.title || actions) && (
        <PageHeaderMarkup
          level={0} banner={false} nested={false} crumbs={[]} onCrumb={() => {}} overline="" back={null} visual={null}
          heading="h2" titleId={titleId} title={m.title} placeholder="" hasTitleArea={!!m.title} trailing={null} actions={actions}
          subtitle={m.subtitle} timestamp="" widgets={null} facts={[]} hasDescription={!!m.subtitle}
        />
      )
    : (m.title || m.subtitle || actions) && (
        <div className="mateu-listing-head">
          <div className="mateu-listing-head__text">
            {m.title && <Table.Title as="h2" id={titleId}>{m.title}</Table.Title>}
            {m.subtitle && <Table.Subtitle as="p" id={`${m.id}-subtitle`}>{m.subtitle}</Table.Subtitle>}
          </div>
          {actions}
        </div>
      )
  return (
    <div className={'mateu-listing-frame' + (asPage ? ' mateu-listing-frame--page' : '')}>
      {heading}
      {toolbar}
      {children}
    </div>
  )
}
