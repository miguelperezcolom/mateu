import React, { useRef, useState } from 'react'
import { Button, Dialog, ShellBar, ShellBarItem } from '@ui5/webcomponents-react'
import { type MateuSession, type NavTarget } from '@rn/core/MateuSession'
import { type HeaderAction } from '@rn/core/embeddedAppExtras'
import { type HeaderValue } from '@rn/core/appShellExtras'
import { firstLeaf, visibleItems } from '@mr/shell/menu'
import { tx } from '@mr/i18n/texts'
import { ContextPickers } from '@mr/views/shell/header/ContextPickers'
import { HeaderActions } from '@mr/views/shell/header/HeaderActions'
import { type InboxHandle } from '@app/ui5/NotificationInbox'
import { HeaderValues } from '@mr/views/shell/header/LiveHeader'
import { accountOf, ProfileAvatar, SignOutButton } from '@app/ui5/Account'
import { ConnectAi } from '@mr/views/shell/header/AgentPush'
import { CardsDialog, SideNav, TabsNav, TilesHub } from '@app/overrides/shell/header/MenuNav'
import { ShellBand, useAppShell } from '@mr/views/shell/appShellState'
import '@ui5/webcomponents-icons/dist/menu2.js'
import '@ui5/webcomponents-icons/dist/light-mode.js'
import '@ui5/webcomponents-icons/dist/dark-mode.js'
import '@ui5/webcomponents-icons/dist/iphone.js'
import '@ui5/webcomponents-icons/dist/bell.js'
import '@app/overrides/shell/header/header.css'

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
  const s = useAppShell({ session, app, current, onNavigate })
  const { narrow, color, layout, target, agentMeta, themeToggle, menu, paneOpen, setPaneOpen, drawer, setDrawer, setQr, cards, setCards, hub, setHub, menuSearch, navigate, activate, h, goHome, title, subtitle, logo, section, onStart } = s
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)
  const notifications = app['notificationsEnabled'] === true
  const inbox = useRef<InboxHandle>(null)
  const [unread, setUnread] = useState(0)
  const account = accountOf(app)

  if (layout === 'bare') {
    return <main id="mateu-main" tabIndex={-1} className="mateu-app-main mateu-app-main--bare">{children}</main>
  }

  const sidePane = layout === 'side' && !narrow && menu.length > 0 && (paneOpen || app['variant'] === 'RAIL')
  const startButton = menu.length > 0 && (narrow || layout === 'sections' || (layout === 'side' && app['variant'] === 'HAMBURGER_MENU'))
  const tabs = !narrow && (layout === 'top' || layout === 'tabs' || layout === 'tiles')

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
        // the logo area is a link home; its accessible name carries the text it shows (the app's
        // title, and the subtitle where it is shown) — WCAG 2.5.3 label in name
        accessibilityAttributes={{ logo: { role: 'link', name: [title, narrow ? '' : subtitle].filter(Boolean).join(' ') || undefined } } as never}
        onNotificationsClick={(e: CustomEvent<{ targetRef: HTMLElement }>) => { e.preventDefault(); setNotifAnchor(e.detail.targetRef); inbox.current?.open() }}
        onProfileClick={(e: CustomEvent<{ targetRef: HTMLElement }>) => setProfileAnchor(e.detail.targetRef)}
        content={(
          <>
            {!narrow && <div slot="content" className="mateu-shell-content"><HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} /></div>}
            {!narrow && <div slot="content" className="mateu-shell-content"><ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} /></div>}
            <div slot="content" className="mateu-shell-content"><HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} onNavigate={navigate} /></div>
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
      <ShellBand session={session} app={app} s={s} />
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
