import { useEffect, useMemo, useState } from 'react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { firstComponentFragment, previewOverlayOf } from '@rn/core/chatStream'
import { pushRecentRoute } from '@infra/recentRoutesStore.ts'
import { runAndApply, routeTarget, type AppMetaLike } from './appActions'
import { flattenMenu } from './palette'
import { useGlobalKeys, type AppShortcutLike } from './shortcuts'
import { useAccessKeys } from './accessKeys'
import { humanizeId, usePageFabList, type FabLike, type ShownFab } from './fabs'
import type { ContentPreview } from './useMateuApp'

/**
 * Everything an App shell adds ABOVE the screens, outside the header, without the drawing: the
 * keyboard (screen shortcuts through the RN core's registry, ⌘K, `?`, @AppShortcut keys, access
 * keys), whether the palette / help / assistant are open, the recent screens, what the assistant
 * may do with this shell, and the ONE list of floating buttons (the page's, then the app's).
 */
export function useGlobalLayer({ session, app, current, onNavigate, onPreview }: {
  session: MateuSession
  app: AppMetaLike
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  /** The assistant's render-screen aimed at the content area. */
  onPreview?: (preview: Omit<ContentPreview, 'version'>) => void
}) {
  const [palette, setPalette] = useState(false)
  const [help, setHelp] = useState(false)
  const [chat, setChat] = useState(false)
  const [seed, setSeed] = useState<{ text: string; version: number } | null>(null)
  const shortcuts = (app['shortcuts'] as AppShortcutLike[] | undefined) ?? []
  const sseUrl = typeof app['sseUrl'] === 'string' && app['sseUrl'] ? String(app['sseUrl']) : ''
  const commandCenter = app['commandCenterEnabled'] === true || app['chromeless'] === true
  const paletteOn = commandCenter || app['globalSearchEnabled'] === true || !!app['globalSearchSource'] || shortcuts.some((s) => s.code)

  const launch = (s: AppShortcutLike) => {
    if (s.route) onNavigate(routeTarget(s.route, s.label))
    else if (s.actionId) void runAndApply(session, app, s.actionId, onNavigate)
  }

  useGlobalKeys({ session, shortcuts, palette: paletteOn, onPalette: () => setPalette((o) => !o), onHelp: () => setHelp(true), onLaunch: launch })
  useAccessKeys(app['accessKeys'] === true, session, shortcuts)

  // what the assistant may do with this shell: the menu, its MCP endpoint, closing itself, showing a screen
  useEffect(() => {
    session.chatApp = { menu: app['menu'], mcpUrl: (app['mcpUrl'] as string | null) ?? null, uploadUrl: (app['uploadUrl'] as string | null) ?? null }
    session.closeAssistant = () => setChat(false)
    const fallbackScreen = session.currentScreen
    if (!session.currentScreen()) session.currentScreen = () => ({ route: current?.route ?? '', componentState: {}, component: null } as never)
    session.showPreview = (increment, target, title) => {
      const route = session.currentScreen()?.route ?? current?.route ?? ''
      if (target === 'content' && onPreview) { onPreview({ increment, route, title }); return }
      const fragment = firstComponentFragment(increment)
      if (!fragment) { session.notify(null, 'The assistant sent a screen with nothing to show.', 'warning'); return }
      session.openOverlay(previewOverlayOf(fragment, target === 'content' ? 'drawer' : target, title), null, null, { route, consumedRoute: route, serverSideType: '' })
    }
    return () => { session.currentScreen = fallbackScreen }
  }, [session, app, current, onPreview])

  // the screens visited lately, for the palette's "Recent" (the web renderer's store and scope)
  const menu = useMemo(() => flattenMenu(app['menu']), [app])
  useEffect(() => {
    if (!current?.route) return
    const label = current.label || menu.find((m) => m.target.route === current.route)?.label || document.title
    if (label) pushRecentRoute(String(app.serverSideType ?? ''), { route: current.route, label })
  }, [current, menu, app.serverSideType])

  const pageFabs = usePageFabList()
  const appFabs: ShownFab[] = ((app['fabs'] as FabLike[] | undefined) ?? [])
    .filter((f) => f && (f.actionId || f.id))
    .map((f, i) => ({ key: `app-${i}`, label: f.label ?? '', icon: f.icon, name: humanizeId(String(f.actionId ?? f.id)), run: () => void runAndApply(session, app, String(f.actionId ?? f.id), onNavigate) }))

  /** The palette's "Ask AI": opens the assistant with the query. */
  const askAi = sseUrl ? (text: string) => { setChat(true); setSeed((s) => ({ text, version: (s?.version ?? 0) + 1 })) } : undefined
  return { palette, setPalette, help, setHelp, chat, setChat, seed, askAi, shortcuts, sseUrl, commandCenter, paletteOn, launch, pageFabs, appFabs }
}
