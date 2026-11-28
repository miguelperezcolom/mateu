import React from 'react'
import { Dialog, IconButton, Text } from '@kit'
import { DeviceMobileIcon, MoonIcon, SunIcon, ThreeBarsIcon } from '@kit/icons'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import type { HeaderAction } from '@rn/core/embeddedAppExtras'
import type { HeaderValue } from '@rn/core/appShellExtras'
import { ContextPickers } from './header/ContextPickers'
import { HeaderActions } from './header/HeaderActions'
import { NotificationBell } from './header/NotificationBell'
import { HeaderValues } from './header/LiveHeader'
import { UserMenu } from './header/UserMenu'
import { ConnectAi } from './header/AgentPush'
import { CardsDialog, SideNav, TabsNav, TilesHub, TopNav } from './header/MenuNav'
import { firstLeaf, visibleItems } from '@mr/shell/menu'
import { ShellBand, useAppShell } from './appShellState'
import './header/header.css'
import { tx } from '@mr/i18n/texts'

type Dict = Record<string, unknown>

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
  const s = useAppShell({ session, app, current, onNavigate })
  const { narrow, color, layout, target, agentMeta, themeToggle, menu, paneOpen, drawer, setDrawer, setQr, cards, setCards, hub, setHub, menuSearch, navigate, activate, h, goHome, title, subtitle, logo, section, onStart } = s

  if (layout === 'bare') {
    return <main id="mateu-main" tabIndex={-1} className="mateu-app-main mateu-app-main--bare">{children}</main>
  }

  const sidePane = layout === 'side' && !narrow && menu.length > 0 && paneOpen
  const burger = menu.length > 0 && (narrow || layout === 'sections' || (layout === 'side' && app['variant'] === 'HAMBURGER_MENU'))

  return (
    <div className={`mateu-app mateu-app--${layout}`} data-variant={String(app['variant'] ?? '')}>
      <header className="mateu-app-header">
        {burger && (
          <IconButton icon={ThreeBarsIcon} variant="invisible" aria-label={layout === 'sections' ? tx('sections') : tx('menu')}
            aria-expanded={!narrow && layout === 'side' ? paneOpen : drawer} onClick={onStart} />
        )}
        <button type="button" className="mateu-app-brand" onClick={goHome} aria-label={`${title}, ${tx('home')}`}>
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
          <HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} onNavigate={navigate} />
          {app['notificationsEnabled'] === true && <NotificationBell session={session} app={{ ...app, ...target }} onNavigate={navigate} />}
          {themeToggle && color && (
            <IconButton icon={color.resolved === 'dark' ? SunIcon : MoonIcon} variant="invisible" size="small"
              aria-label={color.resolved === 'dark' ? tx('lightMode') : tx('darkMode')} onClick={color.toggle} />
          )}
          <ConnectAi session={session} app={agentMeta} />
          {app['mobileQr'] === true && (
            <IconButton icon={DeviceMobileIcon} variant="invisible" size="small" aria-label={tx('openOnMobile')} aria-haspopup="dialog" onClick={() => setQr(true)} />
          )}
          <UserMenu app={app} />
        </div>
      </header>
      <ShellBand session={session} app={app} s={s} />
      {layout === 'tabs' && menu.length > 1 && !narrow && <TabsNav items={menu} h={h} />}
      {layout === 'sections' && section && (
        <div className="mateu-section-band">
          <button type="button" className="mateu-section-name" onClick={() => { const l = firstLeaf(section); if (l) activate(l) }}>{section.label}</button>
          <TabsNav items={visibleItems(section.submenus)} h={h} label={section.label ?? tx('sections')} />
        </div>
      )}
      <div className="mateu-app-body">
        {sidePane && (
          <aside className={'mateu-app-pane' + (app['variant'] === 'RAIL' ? ' mateu-app-pane--rail' : '')} aria-label={tx('mainMenu')}>
            <SideNav menu={menu} h={h} searchable={menuSearch} />
          </aside>
        )}
        <main id="mateu-main" tabIndex={-1} className="mateu-app-main">
          {hub ? <TilesHub group={hub} h={h} /> : children}
        </main>
      </div>
      {drawer && (
        <Dialog title={layout === 'sections' && !narrow ? tx('sections') : title} onClose={() => setDrawer(false)} position="left" width="medium">
          {layout === 'sections' && !narrow
            ? <SideNav menu={menu.map((m) => ({ ...m, submenus: [] }))} h={{ ...h, activate: (m) => { const full = menu.find((x) => x.label === m.label) ?? m; const leaf = firstLeaf(full) ?? full; activate(leaf) } }} label={tx('sections')} />
            : <SideNav menu={menu} h={h} searchable={menuSearch} />}
        </Dialog>
      )}
      {cards && <CardsDialog group={cards} h={h} baseUrl={session.api.baseUrl} onClose={() => setCards(null)} />}
    </div>
  )
}
