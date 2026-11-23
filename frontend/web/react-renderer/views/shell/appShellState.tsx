import React, { useEffect, useMemo, useState } from 'react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { appHomeOf } from '@rn/core/componentContext'
import type { HeaderValue } from '@rn/core/appShellExtras'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { appTargetOf } from '@mr/shell/appLevel'
import { NARROW_SHELL, menuLayoutOf, useMediaQuery } from '@mr/shell/layout'
import { holdsCurrent, useMenuActivation, visibleItems, type MenuHandlers, type MenuItem } from '@mr/shell/menu'
import { ContextPickers } from './header/ContextPickers'
import { HeaderValues, useLiveUpdates } from './header/LiveHeader'
import { AgentOperatingNotice, useAgentChannel } from './header/AgentPush'
import { useColorControl } from './header/theme'

const MobileQrDialog = React.lazy(() => import('./header/MobileQr'))

type Dict = Record<string, unknown>

/**
 * What an App shell knows and does, whatever it looks like: its layout and the menu, the screen it
 * hosts, the theme toggle, the live channels (agent push, live header values, presence), the side
 * pane / drawer / card menu / tiles hub states, navigating (closing what is open) and going home.
 * Each renderer's AppShell draws over it (Primer's header, Fiori's shell bar, SLDS's global header).
 */
export function useAppShell({ session, app, current, onNavigate }: {
  session: MateuSession; app: Dict; current: NavTarget | null; onNavigate: (target: NavTarget) => void
}) {
  const narrow = useMediaQuery(NARROW_SHELL)
  const color = useColorControl()
  const layout = menuLayoutOf(app)
  const target = useMemo(() => appTargetOf(app), [app])
  const agentMeta = useMemo(() => ({ ...app, ...target }), [app, target])
  // live UI push: the channel a paired AI agent sends screens through (only when the app turned it on)
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
  const [cards, setCards] = useState<MenuItem | null>(null)
  const [hub, setHub] = useState<MenuItem | null>(null)

  const navigate = (t: NavTarget) => { setDrawer(false); setHub(null); onNavigate(t) }
  const activate = useMenuActivation(session, app, target, navigate)
  const h: MenuHandlers = { currentRoute, activate, openCards: (g) => { setDrawer(false); setCards(g) } }

  const title = String(app['title'] ?? '') || 'Mateu' // i18n-ok: the product name
  const logo = typeof app['logo'] === 'string' && app['logo'] ? safeHref(app['logo'], { allowData: true }) : undefined
  // the current section (HAMBURGER_SECTIONS): the group holding the screen, else the first
  const section = layout === 'sections' ? menu.find((m) => holdsCurrent(m, currentRoute)) ?? menu.find((m) => !m.separator) ?? null : null
  // the side pane / sections open from a start button; on the side layout it toggles the pane
  const onStart = () => {
    if (!narrow && layout === 'side') setPaneOpen((o) => !o)
    else setDrawer(true)
  }
  return {
    narrow, color, layout, target, agentMeta, themeToggle, menu, currentRoute,
    paneOpen, setPaneOpen, drawer, setDrawer, qr, setQr, cards, setCards, hub, setHub,
    menuSearch: Number(app['totalMenuOptions'] ?? 0) > 10,
    navigate, activate, h, goHome: () => navigate({ label: '', ...appHomeOf(app) }),
    title, subtitle: String(app['subtitle'] ?? ''), logo, section, onStart,
  }
}

export type AppShellState = ReturnType<typeof useAppShell>

/**
 * Under the shell's header, the same in every renderer: the "an AI agent is operating this screen"
 * strip, the phone QR dialog, and — on a narrow screen — the header values and @AppContext pickers
 * on a band of their own.
 */
export function ShellBand({ session, app, s }: { session: MateuSession; app: Dict; s: AppShellState }) {
  return (
    <>
      <AgentOperatingNotice session={session} app={s.agentMeta} />
      {s.qr && (
        <React.Suspense fallback={null}>
          <MobileQrDialog appTitle={s.title} baseUrl={session.api.baseUrl} onClose={() => s.setQr(false)} />
        </React.Suspense>
      )}
      {s.narrow && (
        <div className="mateu-header-values-band">
          <HeaderValues session={session} declared={app['headerValues'] as HeaderValue[] | undefined} />
          <ContextPickers session={session} app={s.target} selectors={(app['contextSelectors'] as never[] | undefined) ?? []} />
        </div>
      )}
    </>
  )
}
