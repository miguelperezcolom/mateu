import React from 'react'
import {
  Breadcrumbs, BreadcrumbsItem, DynamicPage, DynamicPageHeader, DynamicPageTitle,
  Label as Ui5Label, Text as Ui5Text, Title,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/nav-back.js'
import { IconButton, sapIcon } from '@kit'
import { PageFrame as PlainPageFrame, type PageFrameProps } from '@mr/views/render/page/PageFrame'
import { PageTocAside } from '@mr/views/render/page/PageToc'
import { useFillViewport } from '../../../fiori/useFillViewport'
import { tx } from '@mr/i18n/texts'

const NavBackIcon = sapIcon('nav-back')

/**
 * Fiori's DYNAMIC PAGE — the floorplan under the list report and the object page — for the view's
 * own page: the title bar stays (breadcrumbs, title, status and badges, the actions and the record
 * arrows; its snapped form once the header collapses), the header content collapses as the page
 * scrolls and can be pinned (the avatar or picture, the subtitle, the key facts, the header widgets),
 * the section index is the object page's anchor bar under it, and the page's own buttons are the
 * floating footer bar. A page inside an overlay or an island keeps the plain frame.
 */
export function PageFrame(p: PageFrameProps) {
  const h = p.headerParts
  if (!p.top || !h) return <PlainPageFrame {...p} />
  return <FioriDynamicPage {...p} h={h} />
}

export type { PageFrameProps }

function FioriDynamicPage(p: PageFrameProps & { h: NonNullable<PageFrameProps['headerParts']> }) {
  const { h } = p
  const height = useFillViewport(p.rootRef)
  const title = h.title || (h.placeholder ? <span className="mateu-page-title-placeholder">{h.placeholder}</span> : '')
  const hasHeaderContent = !!(h.visual || h.timestamp || h.widgets || h.facts.length > 0)

  return (
    <div ref={p.rootRef} className={'mateu-page mateu-fiori-page' + (p.compactDensity ? ' mateu-compact' : '')} data-page-level={p.level}
      style={{ height }}>
      <DynamicPage
        className="mateu-dynamic-page"
        hidePinButton={!hasHeaderContent}
        showFooter={!!p.buttons}
        titleArea={(
          <DynamicPageTitle
            breadcrumbs={h.crumbs.length > 0 ? (
              <Breadcrumbs design="Standard"
                onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => {
                  e.preventDefault()
                  const c = h.crumbs[Number(e.detail.item.getAttribute('data-index'))]
                  if (c?.route) h.onCrumb(c.route, c.routeLabel)
                }}>
                {h.crumbs.map((c, i) => <BreadcrumbsItem key={i} data-index={i} href={c.route ? '#' : undefined}>{c.label}</BreadcrumbsItem>)}
              </Breadcrumbs>
            ) : undefined}
            heading={(
              <div className="mateu-fiori-heading">
                {h.back && <IconButton icon={NavBackIcon} aria-label={h.back.label} variant="invisible" onClick={h.back.onPress} />}
                <div className="mateu-fiori-heading__text">
                  {h.overline && <span className="mateu-page-overline">{h.overline}</span>}
                  <Title level="H2" size="H3" wrappingType="Normal">{title}</Title>
                </div>
              </div>
            )}
            snappedHeading={(
              <div className="mateu-fiori-heading">
                {h.back && <IconButton icon={NavBackIcon} aria-label={h.back.label} variant="invisible" onClick={h.back.onPress} />}
                <Title level="H2" size="H5" wrappingType="None">{title}</Title>
              </div>
            )}
            subheading={h.subtitle ? <Ui5Text className="mateu-page-subtitle">{h.subtitle}</Ui5Text> : undefined}
            snappedSubheading={h.subtitle ? <Ui5Text className="mateu-page-subtitle">{h.subtitle}</Ui5Text> : undefined}
            actionsBar={h.actions ? <div className="mateu-fiori-actions">{h.actions}</div> : undefined}
          >
            {h.trailing && <div className="mateu-fiori-status">{h.trailing}</div>}
          </DynamicPageTitle>
        )}
        headerArea={hasHeaderContent ? (
          <DynamicPageHeader>
            <div className="mateu-fiori-header">
              {h.visual && <div className="mateu-fiori-header__visual">{h.visual}</div>}
              {h.facts.length > 0 && (
                <div className="mateu-page-facts">
                  {h.facts.map((f, i) => (
                    <div key={i} className="mateu-page-fact">
                      <Ui5Label showColon>{f.label}</Ui5Label>
                      <Ui5Text className="mateu-page-fact-value">{f.value}</Ui5Text>
                    </div>
                  ))}
                </div>
              )}
              {h.widgets && <div className="mateu-page-widgets">{h.widgets}</div>}
              {h.timestamp && <Ui5Text className="mateu-page-timestamp">{h.timestamp}</Ui5Text>}
            </div>
          </DynamicPageHeader>
        ) : undefined}
        // Fiori's floating footer bar, drawn in its tokens: UI5's Bar labels its root with its design
        // name ("FloatingFooter") and gives it no role — an aria-label axe flags as prohibited
        footerArea={p.buttons ? <div role="group" aria-label={tx('actions')} className="mateu-fiori-footer">{p.buttons}</div> : undefined}
      >
        <div className="mateu-fiori-content">
          {p.toc && (
            <div ref={p.headerRef} className="mateu-fiori-anchorbar">
              <PageTocAside entries={p.tocEntries} active={p.activeSection} onJump={p.onJump} />
            </div>
          )}
          {p.banners}
          <div className="mateu-page-body">
            <div className="mateu-fiori-blocks">{p.content}</div>
          </div>
          {p.footer && <div className="mateu-page-footer">{p.footer}</div>}
        </div>
      </DynamicPage>
    </div>
  )
}
