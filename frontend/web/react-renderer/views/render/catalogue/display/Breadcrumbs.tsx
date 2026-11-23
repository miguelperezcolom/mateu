import React from 'react'
import { Breadcrumbs as PrimerBreadcrumbs } from '@kit'
import { type CatalogueProps } from '../types'
import { list, safeHref, str, useOpenRoute } from './shared'

// Split out of headers.tsx: a design system with its own markup for it overrides only this file.

/** Breadcrumbs: Primer's, each crumb opening its route in the app; the current item last. */
export function Breadcrumbs({ metadata }: CatalogueProps) {
  const open = useOpenRoute()
  const crumbs = list(metadata['breadcrumbs'])
  const current = str(metadata['currentItemText'])
  return (
    <PrimerBreadcrumbs>
      {crumbs.map((c, i) => {
        const link = str(c['link'])
        return (
          <PrimerBreadcrumbs.Item key={i} href={safeHref(link) ?? '#'} onClick={(e: React.MouseEvent) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || /^https?:/i.test(link)) return
            e.preventDefault()
            open(link, str(c['text']))
          }}>{str(c['text'])}</PrimerBreadcrumbs.Item>
        )
      })}
      {current && <PrimerBreadcrumbs.Item selected>{current}</PrimerBreadcrumbs.Item>}
    </PrimerBreadcrumbs>
  )
}
