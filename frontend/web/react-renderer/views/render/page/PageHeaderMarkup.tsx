import React from 'react'
import { Breadcrumbs, IconButton, PageHeader, Stack, Text } from '@kit'
import { ArrowLeftIcon } from '@kit/icons'

/**
 * What a page header shows, decided by PageRenderer (the shared logic: what the wire asks for, the
 * COMPACT chrome, a nested page) — drawn by PageHeaderMarkup, the one piece a design system with a
 * different header structure (Fiori's object page header) overrides.
 */
export interface HeaderParts {
  level: number
  /** The top-level page's header is the page's banner landmark. */
  banner: boolean
  /** A page inside another (an island, an overlay's content): a kit may draw it plainer. */
  nested: boolean
  label?: string
  crumbs: { label: string; route: string; routeLabel: string }[]
  onCrumb: (route: string, label: string) => void
  overline: string
  back: { label: string; onPress: () => void } | null
  /** The avatar or the icon before the title. */
  visual: React.ReactNode
  heading: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  title: string
  placeholder: string
  hasTitleArea: boolean
  /** Status, badges and the record switcher after the title. */
  trailing: React.ReactNode
  /** Peer arrows and the toolbar. */
  actions: React.ReactNode
  subtitle: string
  timestamp: string
  /** The header widgets (HeaderSupplier), each drawn. */
  widgets: React.ReactNode[] | null
  /** The key facts (KPIs) as label / value. */
  facts: { label: string; value: string }[]
  hasDescription: boolean
}

/** Primer's PageHeader: context (crumbs, overline), title area, actions, description. */
export function PageHeaderMarkup(p: HeaderParts) {
  return (
    <PageHeader role={p.banner ? 'banner' : undefined} aria-label={p.label}
      className={p.nested ? 'mateu-page-header_nested' : undefined}>
      {(p.crumbs.length > 0 || p.overline) && (
        <PageHeader.ContextArea hidden={false}>
          <Stack gap="condensed">
            {p.crumbs.length > 0 && (
              <Breadcrumbs>
                {p.crumbs.map((c, i) => (
                  <Breadcrumbs.Item key={i} href={c.route ? '#' : undefined} selected={i === p.crumbs.length - 1 && !c.route}
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); if (c.route) p.onCrumb(c.route, c.routeLabel) }}>
                    {c.label}
                  </Breadcrumbs.Item>
                ))}
              </Breadcrumbs>
            )}
            {p.overline && <span className="mateu-page-overline">{p.overline}</span>}
          </Stack>
        </PageHeader.ContextArea>
      )}
      {p.hasTitleArea && (
        <PageHeader.TitleArea variant={p.level === 0 ? 'medium' : 'subtitle'}>
          {p.back && (
            <PageHeader.LeadingAction>
              <IconButton icon={ArrowLeftIcon} aria-label={p.back.label} variant="invisible" onClick={p.back.onPress} />
            </PageHeader.LeadingAction>
          )}
          {p.visual && <PageHeader.LeadingVisual>{p.visual}</PageHeader.LeadingVisual>}
          <PageHeader.Title as={p.heading}>
            {p.title || (p.placeholder ? <span className="mateu-page-title-placeholder">{p.placeholder}</span> : null)}
          </PageHeader.Title>
          {p.trailing && (
            <PageHeader.TrailingVisual>
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">{p.trailing}</Stack>
            </PageHeader.TrailingVisual>
          )}
        </PageHeader.TitleArea>
      )}
      {p.actions && <PageHeader.Actions>{p.actions}</PageHeader.Actions>}
      {p.hasDescription && (
        <PageHeader.Description>
          <Stack gap="condensed">
            {p.subtitle && <Text className="mateu-page-subtitle">{p.subtitle}</Text>}
            {p.timestamp && <Text className="mateu-page-timestamp">{p.timestamp}</Text>}
            {p.widgets && <Stack direction="horizontal" gap="normal" wrap="wrap" align="center" className="mateu-page-widgets">{p.widgets}</Stack>}
            {p.facts.length > 0 && (
              <div className="mateu-page-facts">
                {p.facts.map((f, i) => (
                  <div key={i} className="mateu-page-fact">
                    <span className="mateu-page-fact-label">{f.label}</span>
                    <span className="mateu-page-fact-value">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Stack>
        </PageHeader.Description>
      )}
    </PageHeader>
  )
}
