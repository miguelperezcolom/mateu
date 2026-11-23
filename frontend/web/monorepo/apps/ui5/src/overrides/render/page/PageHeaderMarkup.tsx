import React from 'react'
import { Breadcrumbs, BreadcrumbsItem, Label as Ui5Label, Text as Ui5Text, Title } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/nav-back.js'
import { IconButton, Stack, sapIcon } from '@kit'
import type { HeaderParts } from '@mr/views/render/page/PageHeaderMarkup'

const NavBackIcon = sapIcon('nav-back')

/**
 * A Fiori object page header: breadcrumbs and the overline above; the way back, the avatar, the
 * title (or its dimmed placeholder), the status, badges and record switcher, then the header actions
 * on one row; subtitle, timestamp, header widgets and the key facts as label/value pairs below.
 */
export function PageHeaderMarkup(p: HeaderParts) {
  return (
    <header className={'mateu-object-header' + (p.level > 0 ? ' mateu-object-header--nested' : '')} role={p.banner ? 'banner' : undefined} aria-label={p.label}>
      {p.crumbs.length > 0 && (
        <Breadcrumbs design="Standard"
          onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => {
            e.preventDefault()
            const c = p.crumbs[Number(e.detail.item.getAttribute('data-index'))]
            if (c?.route) p.onCrumb(c.route, c.routeLabel)
          }}>
          {p.crumbs.map((c, i) => <BreadcrumbsItem key={i} data-index={i} href={c.route ? '#' : undefined}>{c.label}</BreadcrumbsItem>)}
        </Breadcrumbs>
      )}
      {p.overline && <span className="mateu-page-overline">{p.overline}</span>}
      {(p.hasTitleArea || p.actions) && (
        <div className="mateu-object-header__title-row">
          {p.back && <IconButton icon={NavBackIcon} aria-label={p.back.label} variant="invisible" onClick={p.back.onPress} />}
          {p.visual && <span className="mateu-object-header__visual">{p.visual}</span>}
          {(p.title || p.placeholder) && (
            <Title level={p.heading.toUpperCase() as 'H2'} size={p.level === 0 ? 'H3' : 'H4'} wrappingType="Normal" className="mateu-object-header__title">
              {p.title || <span className="mateu-page-title-placeholder">{p.placeholder}</span>}
            </Title>
          )}
          {p.trailing && <span className="mateu-object-header__status">{p.trailing}</span>}
          {p.actions && <div className="mateu-object-header__actions">{p.actions}</div>}
        </div>
      )}
      {p.hasDescription && (
        <div className="mateu-object-header__content">
          {p.subtitle && <Ui5Text className="mateu-page-subtitle">{p.subtitle}</Ui5Text>}
          {p.timestamp && <Ui5Text className="mateu-page-timestamp">{p.timestamp}</Ui5Text>}
          {p.widgets && <Stack direction="horizontal" gap="normal" wrap="wrap" align="center" className="mateu-page-widgets">{p.widgets}</Stack>}
          {p.facts.length > 0 && (
            <div className="mateu-page-facts">
              {p.facts.map((f, i) => (
                <div key={i} className="mateu-page-fact">
                  <Ui5Label showColon>{f.label}</Ui5Label>
                  <Ui5Text className="mateu-page-fact-value">{f.value}</Ui5Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export type { HeaderParts }
