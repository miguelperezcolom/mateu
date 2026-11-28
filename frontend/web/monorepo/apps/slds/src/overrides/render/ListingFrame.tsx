import React from 'react'
import { ListingFrame as SharedListingFrame } from '@mr/views/render/ListingFrame'
import { PageHeaderMarkup } from '@mr/views/render/page/PageHeaderMarkup'

/**
 * A Lightning LIST VIEW when the listing is the view: one page header box holds the title, the
 * listing's actions and — on its second row — the search and the list controls, and the table hangs
 * right under it. A listing inside a page keeps the shared frame.
 */
export function ListingFrame(p: {
  m: { id: string; title: string; subtitle: string }; titleId: string; toolbar: React.ReactNode; children: React.ReactNode
  actions?: React.ReactNode; asPage?: boolean
}) {
  if (!p.asPage) return <SharedListingFrame {...p} />
  const { m, titleId, toolbar, actions, children } = p
  return (
    <div className="mateu-listing-frame mateu-listing-frame--page mateu-list-view">
      <PageHeaderMarkup
        level={0} banner={false} nested={false} crumbs={[]} onCrumb={() => {}} overline="" back={null} visual={null}
        heading="h2" titleId={titleId} title={m.title} placeholder="" hasTitleArea={!!m.title} trailing={null} actions={actions}
        subtitle={m.subtitle} timestamp="" widgets={toolbar ? [<div key="controls" className="mateu-list-view__controls">{toolbar}</div>] : null}
        facts={[]} hasDescription={!!(m.subtitle || toolbar)}
      />
      {children}
    </div>
  )
}
