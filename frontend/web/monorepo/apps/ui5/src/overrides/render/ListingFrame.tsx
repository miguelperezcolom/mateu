import React from 'react'
import { DynamicPage, DynamicPageHeader, DynamicPageTitle, Text as Ui5Text, Title } from '@ui5/webcomponents-react'
import { Text } from '@kit'
import { useFillViewport } from '../../fiori/useFillViewport'

/**
 * A Fiori list report's frame. Inside a page: the toolbar (ListingToolbar) carries the title and the
 * row count, the subtitle follows it, then the rows. When the listing IS the view: the LIST REPORT
 * floorplan — a dynamic page whose title stays, whose header is the filter bar (the search, Filter,
 * the saved views as variants) and collapses as the rows scroll, the table toolbar over the rows.
 */
export function ListingFrame({ m, titleId, toolbar, children, asPage }: {
  m: { id: string; title: string; subtitle: string }; titleId: string; toolbar: React.ReactNode; children: React.ReactNode
  actions?: React.ReactNode; asPage?: boolean
}) {
  if (asPage && React.isValidElement(toolbar)) return <ListReport m={m} toolbar={toolbar}>{children}</ListReport>
  return (
    <section className="mateu-listing" aria-labelledby={m.title ? titleId : undefined}>
      {toolbar}
      {m.subtitle && <Text as="p" className="mateu-listing-subtitle" id={`${m.id}-subtitle`}>{m.subtitle}</Text>}
      {children}
    </section>
  )
}

function ListReport({ m, toolbar, children }: { m: { id: string; title: string; subtitle: string }; toolbar: React.ReactElement; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const height = useFillViewport(ref)
  const part = (p: 'filters' | 'table') => React.cloneElement(toolbar as React.ReactElement<{ part?: string }>, { part: p })
  return (
    <div ref={ref} className="mateu-page mateu-fiori-page mateu-list-report" style={{ height }}>
      <DynamicPage
        className="mateu-dynamic-page"
        titleArea={(
          <DynamicPageTitle
            heading={<Title level="H2" size="H3" wrappingType="Normal">{m.title}</Title>}
            snappedHeading={<Title level="H2" size="H5" wrappingType="None">{m.title}</Title>}
            subheading={m.subtitle ? <Ui5Text className="mateu-page-subtitle">{m.subtitle}</Ui5Text> : undefined}
          />
        )}
        headerArea={<DynamicPageHeader className="mateu-list-report-filters">{part('filters')}</DynamicPageHeader>}
      >
        <section className="mateu-listing mateu-fiori-content" aria-label={m.title || undefined}>
          {part('table')}
          {children}
        </section>
      </DynamicPage>
    </div>
  )
}
