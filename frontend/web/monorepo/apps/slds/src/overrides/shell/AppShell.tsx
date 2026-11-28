import React, { useLayoutEffect, useRef, useState } from 'react'
import { ActionList, ActionMenu, Dialog, IconButton } from '@kit'
import { ChevronDownIcon, DeviceMobileIcon, SearchIcon } from '@kit/icons'
import { type MateuSession, type NavTarget } from '@rn/core/MateuSession'
import { type HeaderAction } from '@rn/core/embeddedAppExtras'
import { type HeaderValue } from '@rn/core/appShellExtras'
import { isCurrentDestination } from '@rn/core/uxRules'
import { isCardsGroup } from '@rn/renderer/menuCards'
import { ContextPickers } from '@mr/views/shell/header/ContextPickers'
import { HeaderActions } from '@mr/views/shell/header/HeaderActions'
import { NotificationBell } from '@mr/views/shell/header/NotificationBell'
import { HeaderValues } from '@mr/views/shell/header/LiveHeader'
import { UserMenu } from '@mr/views/shell/header/UserMenu'
import { ConnectAi } from '@mr/views/shell/header/AgentPush'
import { CardsDialog, MenuListItems, SideNav, TilesHub } from '@mr/views/shell/header/MenuNav'
import { firstLeaf, holdsCurrent, isGroup, subsOf, visibleItems, type MenuHandlers, type MenuItem } from '@mr/shell/menu'
import { tx } from '@mr/i18n/texts'
import { st } from '@app/i18n/st'
import { ShellBand, useAppShell } from '@mr/views/shell/appShellState'
import '@mr/views/shell/header/header.css'
import '@app/kit/shell.css'

type Dict = Record<string, unknown>

/**
 * An App shell in Lightning's grammar — SLDS's **Global Header** (the app's logo, the global search,
 * the global actions: header values, @AppContext pickers, header actions, notifications, the
 * signed-in user) over its **Global Navigation** (the Context Bar: the App Launcher waffle, the
 * app's name, the navigation items, a group a dropdown). The menu follows the app's variant: the
 * Context Bar's items (MENU_ON_TOP, TABS; TILES opens a group's page of tiles), the sections in the
 * App Launcher with the current one's entries as items (HAMBURGER_SECTIONS), or a Vertical
 * Navigation pane (HAMBURGER_MENU — the waffle folds it —, MENU_ON_LEFT, RAIL). A MEDIATOR shell
 * and a chromeless app draw no chrome. Below 768px the menu folds into the App Launcher. Light only.
 */
export function AppShell({ session, app, current, onNavigate, children }: {
  session: MateuSession
  app: Dict
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  children: React.ReactNode
}) {
  const s = useAppShell({ session, app, current, onNavigate })
  const { narrow, layout, target, agentMeta, menu, currentRoute, paneOpen, drawer: launcher, setDrawer: setLauncher, setQr, cards, setCards, hub, setHub, menuSearch, navigate, activate, h, goHome, title, subtitle, logo, section, onStart: onWaffle } = s

  // the Global Header is fixed (its blueprint): the content starts under it, whatever its height
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return undefined
    const measure = () => setHeaderHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [layout])

  if (layout === 'bare') {
    return <main id="mateu-main" tabIndex={-1} className="mateu-app-main mateu-app-main--bare">{children}</main>
  }

  const sidePane = layout === 'side' && !narrow && menu.length > 0 && paneOpen
  // the Context Bar's items: the menu on top, the tabs, or the current section's entries
  const barItems = narrow ? [] : layout === 'top' || layout === 'tiles' || layout === 'tabs' ? menu : layout === 'sections' && section ? visibleItems(section.submenus) : []
  const launcherOffered = menu.length > 0 && (narrow || layout === 'sections' || layout === 'side')
  const searchOn = app['globalSearchEnabled'] === true || !!app['globalSearchSource'] || app['commandCenterEnabled'] === true

  return (
    <div className={`mateu-app mateu-app--${layout}`} data-variant={String(app['variant'] ?? '')} style={{ paddingTop: headerHeight, '--mateu-header-h': `${headerHeight}px` } as React.CSSProperties}>
      <header ref={headerRef} className="slds-global-header_container mateu-global-header">
        <div className="slds-global-header slds-grid slds-grid_align-spread">
          {/* the APP's logo (never SLDS's logo class: its default image is Salesforce's own mark) */}
          <div className="slds-global-header__item">
            <button type="button" className="mateu-slds-brand" onClick={goHome} aria-label={`${title}, ${tx('home')}`}
              style={logo ? { backgroundImage: `url("${logo}")` } : undefined}>
              {!logo && <span className="mateu-app-wordmark">{title}</span>}
            </button>
          </div>
          {searchOn && !narrow && (
            <div className="slds-global-header__item slds-global-header__item_search">
              <button type="button" className="slds-input mateu-global-search" onClick={openPalette} aria-keyshortcuts="Control+K Meta+K">
                <SearchIcon size={14} className="slds-icon slds-icon-text-default slds-icon_x-small" />
                <span>{tx('search')}…</span>
              </button>
            </div>
          )}
          <div className="slds-global-header__item">
            <ul className="slds-global-actions mateu-global-actions">
              {narrow && <li className="slds-global-actions__item"><HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} onNavigate={navigate} /></li>}
              {app['notificationsEnabled'] === true && (
                <li className="slds-global-actions__item slds-global-actions__notifications"><NotificationBell session={session} app={{ ...app, ...target }} onNavigate={navigate} /></li>
              )}
              <li className="slds-global-actions__item"><ConnectAi session={session} app={agentMeta} /></li>
              {app['mobileQr'] === true && (
                <li className="slds-global-actions__item">
                  <IconButton icon={DeviceMobileIcon} variant="invisible" size="small" aria-label={tx('openOnMobile')} aria-haspopup="dialog" onClick={() => setQr(true)} />
                </li>
              )}
              <li className="slds-global-actions__item"><UserMenu app={app} /></li>
            </ul>
          </div>
        </div>
        <div className="slds-context-bar mateu-context-bar">
          <div className="slds-context-bar__primary">
            <div className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click slds-no-hover">
              {launcherOffered && (
                <div className="slds-context-bar__icon-action">
                  <button type="button" className="slds-button slds-icon-waffle_container slds-context-bar__button" onClick={onWaffle}
                    aria-expanded={!narrow && layout === 'side' ? paneOpen : launcher} aria-haspopup={!narrow && layout === 'side' ? undefined : 'dialog'}
                    title={layout === 'sections' ? tx('sections') : st('appLauncher')}>
                    <span className="slds-icon-waffle">
                      <span className="slds-r1" /><span className="slds-r2" /><span className="slds-r3" /><span className="slds-r4" /><span className="slds-r5" />
                      <span className="slds-r6" /><span className="slds-r7" /><span className="slds-r8" /><span className="slds-r9" />
                    </span>
                    <span className="slds-assistive-text">{layout === 'sections' ? tx('sections') : st('appLauncher')}</span>
                  </button>
                </div>
              )}
              <span className="slds-context-bar__label-action slds-context-bar__app-name">
                <span className="slds-truncate" title={subtitle ? `${title} — ${subtitle}` : title}>{layout === 'sections' && section ? section.label : title}</span>
              </span>
            </div>
          </div>
          {barItems.length > 0 && (
            <nav className="slds-context-bar__secondary" role="navigation" aria-label={layout === 'sections' && section ? section.label : tx('mainMenu')}>
              <ul className="slds-grid">
                {barItems.filter((m) => !m.separator).map((m, i) => (
                  <ContextBarItem key={`${i}-${m.route ?? m.label}`} item={m} h={h} flat={layout === 'tabs' || layout === 'sections'}
                    hub={layout === 'tiles' ? hub : undefined} onHub={layout === 'tiles' ? (g) => setHub(g) : undefined} />
                ))}
              </ul>
            </nav>
          )}
          {/* the app's context on the bar's right: the live header values, the @AppContext pickers, the header actions */}
          {!narrow && (
            <div className="slds-context-bar__tertiary mateu-context-tools">
              <HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} />
              <ContextPickers session={session} app={target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} />
              <HeaderActions session={session} app={target} actions={(app['contextActions'] as HeaderAction[] | undefined) ?? []} narrow={narrow} onNavigate={navigate} />
            </div>
          )}
        </div>
      </header>
      <ShellBand session={session} app={app} s={s} />
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
      {launcher && (
        <Dialog title={layout === 'sections' && !narrow ? tx('sections') : st('appLauncher')} onClose={() => setLauncher(false)} position="left" width="medium">
          {layout === 'sections' && !narrow
            ? <SideNav menu={menu.map((m) => ({ ...m, submenus: [] }))} h={{ ...h, activate: (m) => { const full = menu.find((x) => x.label === m.label) ?? m; const leaf = firstLeaf(full) ?? full; activate(leaf) } }} label={tx('sections')} />
            : <SideNav menu={menu} h={h} searchable={menuSearch} />}
        </Dialog>
      )}
      {cards && <CardsDialog group={cards} h={h} baseUrl={session.api.baseUrl} onClose={() => setCards(null)} />}
    </div>
  )
}

/** The header's search item opens the shared palette, as ⌘K / Ctrl+K does (useGlobalKeys hears that key). */
function openPalette() {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', metaKey: mac, ctrlKey: !mac, bubbles: true }))
}

/**
 * One navigation item of the Context Bar: a leaf a link (`slds-is-active` on the current one), a
 * group a dropdown (TABS and the sections band open its first entry), a card menu its dialog, and
 * under TILES a group opens its page of tiles.
 */
function ContextBarItem({ item, h, flat, hub, onHub }: { item: MenuItem; h: MenuHandlers; flat: boolean; hub?: MenuItem | null; onHub?: (g: MenuItem) => void }) {
  const current = hub ? hub === item : holdsCurrent(item, h.currentRoute)
  const cls = `slds-context-bar__item${current ? ' slds-is-active' : ''}`
  const press = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isCardsGroup(item)) h.openCards(item)
    else if (isGroup(item) && onHub) onHub(item)
    else if (isGroup(item)) h.activate(firstLeaf(item) ?? item)
    else h.activate(item)
  }
  if (isGroup(item) && !isCardsGroup(item) && !flat && !onHub) {
    return (
      <li className={`${cls} slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click`}>
        <ActionMenu>
          <ActionMenu.Anchor>
            <button type="button" className="slds-context-bar__label-action mateu-context-bar__menu" aria-current={current ? 'page' : undefined}>
              <span className="slds-truncate" title={item.label}>{item.label}</span>
              <ChevronDownIcon size={12} className="slds-icon slds-icon_x-small slds-icon-text-default slds-m-left_xx-small" />
            </button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay width="medium">
            <ActionList><MenuListItems items={subsOf(item)} h={h} /></ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </li>
    )
  }
  const here = !isGroup(item) && isCurrentDestination(item, h.currentRoute)
  return (
    <li className={cls}>
      <a href="#" className="slds-context-bar__label-action" aria-current={here || current ? 'page' : undefined} onClick={press}
        aria-haspopup={isCardsGroup(item) ? 'dialog' : undefined} aria-disabled={item.disabled || undefined}>
        <span className="slds-truncate" title={item.label}>{item.label}</span>
      </a>
    </li>
  )
}
