import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, IconButton, Text } from '@primer/react'
import { MoonIcon, SunIcon, ThreeBarsIcon } from '@primer/octicons-react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { appHomeOf } from '@rn/core/componentContext'
import type { HeaderAction } from '@rn/core/embeddedAppExtras'
import type { HeaderValue } from '@rn/core/appShellExtras'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { appTargetOf } from './header/appLevel'
import { ContextPickers } from './header/ContextPickers'
import { HeaderActions } from './header/HeaderActions'
import { NotificationBell } from './header/NotificationBell'
import { HeaderValues, useLiveUpdates } from './header/LiveHeader'
import { UserMenu } from './header/UserMenu'
import { useColorControl } from './header/theme'
import {
  CardsDialog, SideNav, TabsNav, TilesHub, TopNav, firstLeaf, holdsCurrent, useMenuActivation, visibleItems,
  type MenuHandlers, type MenuItem,
} from './header/MenuNav'
import './header/header.css'

type Dict = Record<string, unknown>

/** Below this width the menu folds behind ☰ and the header actions into "More". */
const NARROW = '(max-width: 767px)'

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia(NARROW).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(NARROW)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

/** How a variant lays its menu out (AppDto.variant). */
type Layout = 'side' | 'top' | 'tiles' | 'tabs' | 'sections' | 'bare'

function layoutOf(app: Dict): Layout {
  if (app['chromeless'] === true) return 'bare'
  switch (app['variant']) {
    case 'MEDIATOR': return 'bare'
    case 'MENU_ON_TOP': return 'top'
    case 'TILES': return 'tiles'
    case 'TABS': return 'tabs'
    case 'HAMBURGER_SECTIONS': return 'sections'
    default: return 'side' // HAMBURGER_MENU, MENU_ON_LEFT, RAIL, AUTO
  }
}

/**
 * An App shell in Primer's own grammar (github.com's header): the app's name, its menu, and on the
 * right the app-wide controls — header values, @AppContext pickers, header actions, the
 * notification bell, the theme toggle, the signed-in user. The menu follows the app's variant:
 * a side NavList (HAMBURGER_MENU — togglable —, MENU_ON_LEFT, RAIL), a bar of links and dropdowns
 * (MENU_ON_TOP), tabs (TABS), the sections behind ☰ with the current one's entries as tabs
 * (HAMBURGER_SECTIONS), or a bar whose groups open a page of tiles (TILES). A MEDIATOR shell (a
 * crud's own) and a chromeless app draw no chrome. Below 768px every menu folds behind ☰.
 */
export function AppShell({ session, app, current, onNavigate, children }: {
  session: MateuSession
  app: Dict
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  children: React.ReactNode
}) {
  const narrow = useNarrow()
  const color = useColorControl()
  const layout = layoutOf(app)
  const target = useMemo(() => appTargetOf(app), [app])
  const live = useMemo(() => ({ ...target, liveUpdates: app['liveUpdates'] === true, presence: app['presence'] === true }), [target, app])
  useLiveUpdates(session, live)

  const themeToggle = app['themeToggle'] === true
  useEffect(() => { color?.setToggleOffered(themeToggle) }, [color, themeToggle])

  const menu = useMemo(() => visibleItems(app['menu'] as MenuItem[] | undefined), [app])
  const currentRoute = current?.route ?? ''
  const [paneOpen, setPaneOpen] = useState(app['drawerClosed'] !== true)
  const [drawer, setDrawer] = useState(false)
  const [cards, setCards] = useState<MenuItem | null>(null)
  const [hub, setHub] = useState<MenuItem | null>(null)

  const navigate = (t: NavTarget) => { setDrawer(false); setHub(null); onNavigate(t) }
  const activate = useMenuActivation(session, app, target, navigate)
  const h: MenuHandlers = { currentRoute, activate, openCards: (g) => { setDrawer(false); setCards(g) } }
  const goHome = () => navigate({ label: '', ...appHomeOf(app) })

  if (layout === 'bare') {
    return <main id="mateu-main" tabIndex={-1} className="mateu-app-main mateu-app-main--bare">{children}</main>
  }

  const title = String(app['title'] ?? '') || 'Mateu'
  const subtitle = String(app['subtitle'] ?? '')
  const logo = typeof app['logo'] === 'string' && app['logo'] ? safeHref(app['logo'], { allowData: true }) : undefined
  // the current section (HAMBURGER_SECTIONS): the group holding the screen, else the first
  const section = layout === 'sections' ? menu.find((m) => holdsCurrent(m, currentRoute)) ?? menu.find((m) => !m.separator) ?? null : null
  const sidePane = layout === 'side' && !narrow && menu.length > 0 && paneOpen
  const burger = menu.length > 0 && (narrow || layout === 'sections' || (layout === 'side' && app['variant'] === 'HAMBURGER_MENU'))

  const onBurger = () => {
    if (!narrow && layout === 'side') setPaneOpen((o) => !o)
    else setDrawer(true)
  }

  return (
    <div className={`mateu-app mateu-app--${layout}`} data-variant={String(app['variant'] ?? '')}>
      <header className="mateu-app-header">
        {burger && (
          <IconButton icon={ThreeBarsIcon} variant="invisible" aria-label={layout === 'sections' ? 'Sections' : 'Menu'}
            aria-expanded={!narrow && layout === 'side' ? paneOpen : drawer} onClick={onBurger} />
        )}
        <button type="button" className="mateu-app-brand" onClick={goHome} aria-label={`${title}, home`}>
          {logo && <img src={logo} alt="" className="mateu-app-logo" />}
          <span className="mateu-app-title">{title}</span>
          {subtitle && !narrow && layout !== 'top' && layout !== 'tiles' && <Text size="small" className="mateu-header-muted mateu-app-subtitle">{subtitle}</Text>}
        </button>
        {!narrow && (layout === 'top' || layout === 'tiles') && (
          <TopNav menu={menu} h={h} hub={layout === 'tiles' ? hub : undefined}
            onHub={layout === 'tiles' ? (g) => setHub(g) : undefined} />
        )}
        <div className="mateu-app-controls">
          {!narrow && <HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} />}
          {!narrow && <ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} />}
          <HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} />
          {app['notificationsEnabled'] === true && <NotificationBell session={session} app={{ ...app, ...target }} onNavigate={navigate} />}
          {themeToggle && color && (
            <IconButton icon={color.resolved === 'dark' ? SunIcon : MoonIcon} variant="invisible" size="small"
              aria-label={color.resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={color.toggle} />
          )}
          <UserMenu app={app} />
        </div>
      </header>
      {narrow && (
        <div className="mateu-header-values-band">
          <HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} />
          <ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} />
        </div>
      )}
      {layout === 'tabs' && menu.length > 1 && !narrow && <TabsNav items={menu} h={h} />}
      {layout === 'sections' && section && (
        <div className="mateu-section-band">
          <button type="button" className="mateu-section-name" onClick={() => { const l = firstLeaf(section); if (l) activate(l) }}>{section.label}</button>
          <TabsNav items={visibleItems(section.submenus)} h={h} label={section.label ?? 'Section'} />
        </div>
      )}
      <div className="mateu-app-body">
        {sidePane && (
          <aside className={'mateu-app-pane' + (app['variant'] === 'RAIL' ? ' mateu-app-pane--rail' : '')} aria-label="Main menu">
            <SideNav menu={menu} h={h} />
          </aside>
        )}
        <main id="mateu-main" tabIndex={-1} className="mateu-app-main">
          {hub ? <TilesHub group={hub} h={h} /> : children}
        </main>
      </div>
      {drawer && (
        <Dialog title={layout === 'sections' && !narrow ? 'Sections' : title} onClose={() => setDrawer(false)} position="left" width="medium">
          {layout === 'sections' && !narrow
            ? <SideNav menu={menu.map((m) => ({ ...m, submenus: [] }))} h={{ ...h, activate: (m) => { const full = menu.find((x) => x.label === m.label) ?? m; const leaf = firstLeaf(full) ?? full; activate(leaf) } }} label="Sections" />
            : <SideNav menu={menu} h={h} />}
        </Dialog>
      )}
      {cards && <CardsDialog group={cards} h={h} baseUrl={session.api.baseUrl} onClose={() => setCards(null)} />}
    </div>
  )
}
