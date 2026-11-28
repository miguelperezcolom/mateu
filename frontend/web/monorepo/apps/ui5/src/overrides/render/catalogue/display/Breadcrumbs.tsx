import { Breadcrumbs as Ui5Breadcrumbs, BreadcrumbsItem } from '@ui5/webcomponents-react'
import { type CatalogueProps } from '@mr/views/render/catalogue/types'
import { list, safeHref, str, useOpenRoute } from '@mr/views/render/catalogue/display/shared'

/** Breadcrumbs: UI5's, each crumb opening its route in the app; the current item last. */
export function Breadcrumbs({ metadata }: CatalogueProps) {
  const open = useOpenRoute()
  const crumbs = list(metadata['breadcrumbs'])
  const current = str(metadata['currentItemText'])
  return (
    <Ui5Breadcrumbs design={current ? 'Standard' : 'NoCurrentPage'}
      onItemClick={(e: CustomEvent<{ item: HTMLElement; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }>) => {
        const c = crumbs[Number(e.detail.item.getAttribute('data-index'))]
        if (!c) return
        const link = str(c['link'])
        if (e.detail.metaKey || e.detail.ctrlKey || e.detail.shiftKey || /^https?:/i.test(link)) return
        e.preventDefault()
        open(link, str(c['text']))
      }}>
      {crumbs.map((c, i) => <BreadcrumbsItem key={i} data-index={i} href={safeHref(str(c['link'])) ?? '#'}>{str(c['text'])}</BreadcrumbsItem>)}
      {current && <BreadcrumbsItem>{current}</BreadcrumbsItem>}
    </Ui5Breadcrumbs>
  )
}
