import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Dialog, ShellBar, ShellBarItem } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/menu2.js'
import '@ui5/webcomponents-icons/dist/light-mode.js'
import '@ui5/webcomponents-icons/dist/dark-mode.js'
import '@ui5/webcomponents-icons/dist/iphone.js'
import '@ui5/webcomponents-icons/dist/bell.js'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { appHomeOf } from '@rn/core/componentContext'
import type { HeaderAction } from '@rn/core/embeddedAppExtras'
import type { HeaderValue } from '@rn/core/appShellExtras'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { appTargetOf } from '@mr/shell/appLevel'
import { NARROW_SHELL, menuLayoutOf, useMediaQuery } from '@mr/shell/layout'
import { firstLeaf, holdsCurrent, useMenuActivation, visibleItems, type MenuHandlers, type MenuItem } from '@mr/shell/menu'
import { tx } from '@mr/i18n/texts'
import { ContextPickers } from '@mr/views/shell/header/ContextPickers'
import { HeaderActions } from '@mr/views/shell/header/HeaderActions'
import type { InboxHandle } from '@app/ui5/NotificationInbox'
import { HeaderValues, useLiveUpdates } from '@mr/views/shell/header/LiveHeader'
import { accountOf, ProfileAvatar, SignOutButton } from '@app/ui5/Account'
import { AgentOperatingNotice, ConnectAi, useAgentChannel } from '@mr/views/shell/header/AgentPush'
import { useColorControl } from '@app/overrides/shell/header/theme'
import { CardsDialog, SideNav, TabsNav, TilesHub } from '@app/overrides/shell/header/MenuNav'
import '@app/overrides/shell/header/header.css'

const MobileQrDialog = React.lazy(() => import('@mr/views/shell/header/MobileQr'))
// the notification list and the user menu are their own chunks: only an app with notifications /
// a signed-in user loads them
const NotificationInbox = React.lazy(() => import('@app/ui5/NotificationInbox').then((m) => ({ default: m.NotificationInbox })))
const ProfileMenu = React.lazy(() => import('@app/ui5/ProfileMenu').then((m) => ({ default: m.ProfileMenu })))

type Dict = Record<string, unknown>

/**
 * An App shell as a Fiori app: SAP's shell bar on top — the app's name and logo, its subtitle, the
 * app-wide controls in its content area (header values, @AppContext pickers, header actions, Connect
 * AI), its own notifications button (the inbox), the theme and phone items, the user's avatar —
 * and the menu in Fiori's navigation patterns: the side navigation (HAMBURGER_MENU — togglable from
 * the shell bar's start button —, MENU_ON_LEFT, RAIL collapsed to icons), an icon tab bar
 * (MENU_ON_TOP — groups open from their tab —, TABS), the sections behind the start button with the
 * current one's entries as tabs (HAMBURGER_SECTIONS), or tabs whose groups open a page of tiles
 * (TILES). A MEDIATOR shell (a crud's own) and a chromeless app draw no chrome. Below 768px the side
 * navigation folds behind the start button.
 */
export function AppShell({ session, app, current, onNavigate, children }: {
  session: MateuSession
  app: Dict
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  children: React.ReactNode
}) {
  const narrow = useMediaQuery(NARROW_SHELL)
  const color = useColorControl()
  const layout = menuLayoutOf(app)
  const target = useMemo(() => appTargetOf(app), [app])
  const agentMeta = useMemo(() => ({ ...app, ...target }), [app, target])
  useAgentChannel(session, agentMeta)
  const live = useMemo(() => ({ ...target, liveUpdates: app['liveUpdates'] === true, presence: app['presence'] === true }), [target, app])
  useLiveUpdates(session, live)

  const themeToggle = app['themeToggle'] === true
  useEffect(() => { color?.setToggleOffered(themeToggle) }, [color, themeToggle])

  const menu = useMemo(() => visibleItems(app['menu'] as MenuItem[] | undefined), [app])
  const currentRoute = current?.route ?? ''
  const [paneOpen, setPaneOpen] = useState(app['drawerClosed'] !== true)
  const [drawer, setDrawer] = useState(false)
  const [qr, setQr] = useState(false)
  const menuSearch = Number(app['totalMenuOptions'] ?? 0) > 10
  const [cards, setCards] = useState<MenuItem | null>(null)
  const [hub, setHub] = useState<MenuItem | null>(null)
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)

  const navigate = (t: NavTarget) => { setDrawer(false); setHub(null); onNavigate(t) }
  const activate = useMenuActivation(session, app, target, navigate)
  const h: MenuHandlers = { currentRoute, activate, openCards: (g) => { setDrawer(false); setCards(g) } }
  const goHome = () => navigate({ label: '', ...appHomeOf(app) })
  const notifications = app['notificationsEnabled'] === true
  const inbox = useRef<InboxHandle>(null)
  const [unread, setUnread] = useState(0)
  const account = accountOf(app)

  if (layout === 'bare') {
    return <main id="mateu-main" tabIndex={-1} className="mateu-app-main mateu-app-main--bare">{children}</main>
  }

  const title = String(app['title'] ?? '') || 'Mateu' // i18n-ok: the product name
  const subtitle = String(app['subtitle'] ?? '')
  const logo = typeof app['logo'] === 'string' && app['logo'] ? safeHref(app['logo'], { allowData: true }) : undefined
  const section = layout === 'sections' ? menu.find((m) => holdsCurrent(m, currentRoute)) ?? menu.find((m) => !m.separator) ?? null : null
  const sidePane = layout === 'side' && !narrow && menu.length > 0 && (paneOpen || app['variant'] === 'RAIL')
  const startButton = menu.length > 0 && (narrow || layout === 'sections' || (layout === 'side' && app['variant'] === 'HAMBURGER_MENU'))
  const tabs = !narrow && (layout === 'top' || layout === 'tabs' || layout === 'tiles')

  const onStart = () => {
    if (!narrow && layout === 'side') setPaneOpen((o) => !o)
    else setDrawer(true)
  }

  return (
    <div className={`mateu-app mateu-app--${layout}`} data-variant={String(app['variant'] ?? '')}>
      <ShellBar
        className="mateu-shell-brand"
        primaryTitle={title}
        secondaryTitle={narrow ? undefined : subtitle || undefined}
        showNotifications={notifications || undefined}
        notificationsCount={notifications && unread > 0 ? (unread > 99 ? '99+' : String(unread)) : undefined}
        logo={logo ? <img slot="logo" src={logo} alt="" /> : undefined}
        startButton={startButton ? (
          <Button slot="startButton" icon="menu2" design="Transparent" tooltip={layout === 'sections' ? tx('sections') : tx('menu')}
            accessibleName={layout === 'sections' ? tx('sections') : tx('menu')}
            accessibilityAttributes={{ expanded: !narrow && layout === 'side' ? paneOpen : drawer } as never} onClick={onStart} />
        ) : undefined}
        profile={account.control === 'menu' ? <ProfileAvatar account={account} /> : undefined}
        onLogoClick={goHome}
        onNotificationsClick={(e: CustomEvent<{ targetRef: HTMLElement }>) => { e.preventDefault(); setNotifAnchor(e.detail.targetRef); inbox.current?.open() }}
        onProfileClick={(e: CustomEvent<{ targetRef: HTMLElement }>) => setProfileAnchor(e.detail.targetRef)}
        content={(
          <>
            {!narrow && <div slot="content" className="mateu-shell-content"><HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} /></div>}
            {!narrow && <div slot="content" className="mateu-shell-content"><ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} /></div>}
            <div slot="content" className="mateu-shell-content"><HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} /></div>
            <div slot="content" className="mateu-shell-content"><ConnectAi session={session} app={agentMeta} /></div>
            {account.control === 'signOut' && <SignOutButton account={account} />}
          </>
        )}
      >
        {themeToggle && color && (
          <ShellBarItem icon={color.resolved === 'dark' ? 'light-mode' : 'dark-mode'} text={color.resolved === 'dark' ? tx('lightMode') : tx('darkMode')} onClick={color.toggle} />
        )}
        {app['mobileQr'] === true && <ShellBarItem icon="iphone" text={tx('openOnMobile')} onClick={() => setQr(true)} />}
      </ShellBar>
      <React.Suspense fallback={null}>
        {notifications && <NotificationInbox ref={inbox} session={session} app={{ ...app, ...target }} onNavigate={navigate} opener={notifAnchor} onUnread={setUnread} />}
        {account.control === 'menu' && profileAnchor && <ProfileMenu account={account} open opener={profileAnchor} onClose={() => setProfileAnchor(null)} />}
      </React.Suspense>
      <AgentOperatingNotice session={session} app={agentMeta} />
      {qr && (
        <React.Suspense fallback={null}>
          <MobileQrDialog appTitle={title} baseUrl={session.api.baseUrl} onClose={() => setQr(false)} />
        </React.Suspense>
      )}
      {narrow && (
        <div className="mateu-header-values-band">
          <HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} />
          <ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} />
        </div>
      )}
      {tabs && menu.length > 0 && (layout !== 'tabs' || menu.length > 1) && (
        <TabsNav items={menu} h={h} hub={layout === 'tiles' ? hub : undefined} onHub={layout === 'tiles' ? (g) => setHub(g) : undefined} />
      )}
      {layout === 'sections' && section && <TabsNav items={visibleItems(section.submenus)} h={h} label={section.label ?? tx('sections')} />}
      <div className="mateu-app-body">
        {sidePane && (
          <aside className="mateu-app-pane" aria-label={tx('mainMenu')}>
            <SideNav menu={menu} h={h} searchable={menuSearch} collapsed={app['variant'] === 'RAIL' && !paneOpen} />
          </aside>
        )}
        <main id="mateu-main" tabIndex={-1} className="mateu-app-main">
          {hub ? <TilesHub group={hub} h={h} /> : children}
        </main>
      </div>
      {drawer && (
        <Dialog open className="mateu-nav-drawer" headerText={layout === 'sections' && !narrow ? tx('sections') : title} onClose={() => setDrawer(false)}>
          {layout === 'sections' && !narrow
            ? <SideNav menu={menu.map((m) => ({ ...m, submenus: [] }))} h={{ ...h, activate: (m) => { const full = menu.find((x) => x.label === m.label) ?? m; activate(firstLeaf(full) ?? full) } }} label={tx('sections')} />
            : <SideNav menu={menu} h={h} searchable={menuSearch} />}
        </Dialog>
      )}
      {cards && <CardsDialog group={cards} h={h} baseUrl={session.api.baseUrl} onClose={() => setCards(null)} />}
    </div>
  )
}
