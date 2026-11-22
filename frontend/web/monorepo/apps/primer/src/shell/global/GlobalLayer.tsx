import React, { useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Tooltip } from '@primer/react'
import { CommandPaletteIcon, CopilotIcon, PlusIcon } from '@primer/octicons-react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { firstComponentFragment, previewOverlayOf } from '@rn/core/chatStream'
import { pushRecentRoute } from '@infra/recentRoutesStore.ts'
import { octiconOf } from '../../render/catalogue/display/shared'
import { runAndApply, routeTarget, type AppMetaLike } from './appActions'
import { CommandPalette, flattenMenu } from './CommandPalette'
import { ShortcutsHelp } from './ShortcutsHelp'
import { IdleWarning } from './IdleWarning'
import { trackScreenShortcuts, useGlobalKeys, type AppShortcutLike } from './shortcuts'
import { useAccessKeys } from './accessKeys'
import { humanizeId, usePageFabList, type FabLike, type ShownFab } from './fabs'
import './global.css'

/** What the assistant asked to show in the content area (render-screen → `__preview__`). */
export interface ContentPreview { increment: unknown; route: string; title?: string; version: number }

/**
 * Everything the App shell adds ABOVE the screens, outside the header: the keyboard (screen
 * shortcuts through the RN core's registry, ⌘K, `?`, @AppShortcut keys, access keys), the command
 * palette / command center, the shortcuts list, the idle-session warning, ONE column of floating
 * buttons (the page's, the app's, the command center, the assistant — none covers another) and
 * the assistant's side panel.
 */
export function GlobalLayer({ session, app, current, onNavigate, onPreview }: {
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

  trackScreenShortcuts(session)
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

  return (
    <>
      <div className="mateu-fab-rail" aria-label="Floating actions" role="group" hidden={!pageFabs.length && !appFabs.length && !commandCenter && !sseUrl}>
        {[...pageFabs, ...appFabs].map((f) => <Fab key={f.key} fab={f} />)}
        {commandCenter && (
          <Tooltip text="Command center (Ctrl+K)" direction="w">
            <IconButton className="mateu-fab" icon={CommandPaletteIcon} aria-label="Command center" variant="primary" size="large" onClick={() => setPalette(true)} />
          </Tooltip>
        )}
        {sseUrl && (
          <Tooltip text={chat ? 'Close the assistant' : 'Open the assistant'} direction="w">
            <IconButton className="mateu-fab" icon={CopilotIcon} aria-label={chat ? 'Close assistant' : 'Open assistant'} aria-expanded={chat} size="large" onClick={() => setChat((c) => !c)} />
          </Tooltip>
        )}
      </div>
      <CommandPalette
        session={session}
        app={app}
        open={palette}
        onClose={() => setPalette(false)}
        onNavigate={onNavigate}
        onLaunch={launch}
        onAskAi={sseUrl ? (text) => { setChat(true); setSeed((s) => ({ text, version: (s?.version ?? 0) + 1 })) } : undefined}
      />
      {help && <ShortcutsHelp session={session} shortcuts={shortcuts} palette={paletteOn} onClose={() => setHelp(false)} />}
      {!!app['idleSession'] && <IdleWarning session={session} app={app} />}
      {/* the assistant is its own chunk: only an app with an agent (sseUrl) fetches it */}
      {sseUrl && <React.Suspense fallback={null}><ChatPanel session={session} sseUrl={sseUrl} open={chat} onClose={() => setChat(false)} seed={seed} /></React.Suspense>}
    </>
  )
}

/** One floating button: a labelled pill, or a round icon button (named by its action). */
function Fab({ fab }: { fab: ShownFab }) {
  const Icon = octiconOf(fab.icon) ?? PlusIcon
  if (fab.label) {
    return <Button className="mateu-fab mateu-fab--labelled" variant="primary" size="large" leadingVisual={Icon} onClick={fab.run}>{fab.label}</Button>
  }
  return <IconButton className="mateu-fab" icon={Icon} aria-label={fab.name} variant="primary" size="large" onClick={fab.run} />
}

const ChatPanel = React.lazy(() => import('./ChatPanel').then((m) => ({ default: m.ChatPanel })))
