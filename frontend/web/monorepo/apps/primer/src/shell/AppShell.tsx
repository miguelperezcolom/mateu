import React from 'react'
import { Heading, NavList, PageLayout, Text } from '@primer/react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { isCurrentDestination } from '@rn/core/uxRules'

type Dict = Record<string, unknown>

interface MenuItem {
  label?: string
  separator?: boolean
  route?: string
  consumedRoute?: string
  serverSideType?: string
  actionId?: string
  submenus?: MenuItem[]
  description?: string | null
}

/**
 * An App shell in Primer's own grammar: the app's name over a side NavList (the menu, groups as
 * sub-navigation), the screen in PageLayout's content region. Primer's navigation pattern for a
 * product with many destinations is the side NavList, so every menu variant lands there for now.
 */
export function AppShell({ app, current, onNavigate, children }: {
  session: MateuSession
  app: Dict
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  children: React.ReactNode
}) {
  const title = String(app['title'] ?? '')
  const subtitle = String(app['subtitle'] ?? '')
  const menu = ((app['menu'] as MenuItem[] | undefined) ?? []).filter((m) => m && (m.label || m.separator))
  const currentRoute = current?.route ?? ''

  const go = (item: MenuItem) => onNavigate({
    label: item.label ?? '',
    route: item.route ?? '',
    consumedRoute: item.consumedRoute ?? '',
    serverSideType: item.serverSideType ?? '',
  })

  const renderItem = (item: MenuItem, i: number): React.ReactNode => {
    if (item.separator) return <NavList.Divider key={`sep-${i}`} />
    const subs = (item.submenus ?? []).filter((m) => m && (m.label || m.separator))
    if (subs.length > 0) {
      return (
        <NavList.Group key={`g-${i}`} title={item.label ?? ''}>
          {subs.map(renderItem)}
        </NavList.Group>
      )
    }
    const isCurrent = isCurrentDestination(item, currentRoute)
    return (
      <NavList.Item
        key={`i-${i}-${item.route ?? item.actionId ?? ''}`}
        href={'#'}
        aria-current={isCurrent ? 'page' : undefined}
        onClick={(e: React.MouseEvent) => { e.preventDefault(); go(item) }}
      >
        {item.label}
        {item.description ? <NavList.Description>{item.description}</NavList.Description> : null}
      </NavList.Item>
    )
  }

  return (
    <PageLayout containerWidth="full" padding="none" rowGap="none" columnGap="none">
      <PageLayout.Header divider="line" padding="normal">
        <Heading as="h1" variant="small">{title || 'Mateu'}</Heading>
        {subtitle ? <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)', margin: 0 }}>{subtitle}</Text> : null}
      </PageLayout.Header>
      {menu.length > 0 && (
        <PageLayout.Pane position="start" divider="line" padding="normal" aria-label="Main menu" width="medium" sticky>
          <NavList aria-label="Main menu">{menu.map(renderItem)}</NavList>
        </PageLayout.Pane>
      )}
      <PageLayout.Content as="main" padding="normal" width="full">
        <div id="mateu-main" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      </PageLayout.Content>
    </PageLayout>
  )
}
