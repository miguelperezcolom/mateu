import React from 'react'
import { Button, IconButton, Tooltip } from '@primer/react'
import { CommandPaletteIcon, CopilotIcon, PlusIcon } from '@primer/octicons-react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { octiconOf } from '../../render/catalogue/display/shared'
import type { AppMetaLike } from '@mr/shell/appActions'
import { CommandPalette } from './CommandPalette'
import { ShortcutsHelp } from './ShortcutsHelp'
import { IdleWarning } from './IdleWarning'
import type { ShownFab } from '@mr/shell/fabs'
import { useGlobalLayer } from '@mr/shell/globalLayer'
import './global.css'
import { tx } from '@mr/i18n/texts'

/** What the assistant asked to show in the content area (render-screen → `__preview__`). */
export type { ContentPreview } from '@mr/shell/useMateuApp'
import type { ContentPreview } from '@mr/shell/useMateuApp'

/**
 * Everything the App shell adds above the screens, drawn in Primer (the behaviour is shared:
 * useGlobalLayer): the command palette / command center, the shortcuts list, the idle-session
 * warning, ONE column of floating buttons (the page's, the app's, the command center, the
 * assistant — none covers another) and the assistant's side panel.
 */
export function GlobalLayer({ session, app, current, onNavigate, onPreview }: {
  session: MateuSession
  app: AppMetaLike
  current: NavTarget | null
  onNavigate: (target: NavTarget) => void
  /** The assistant's render-screen aimed at the content area. */
  onPreview?: (preview: Omit<ContentPreview, 'version'>) => void
}) {
  const g = useGlobalLayer({ session, app, current, onNavigate, onPreview })
  const { palette, setPalette, help, setHelp, chat, setChat, seed, shortcuts, sseUrl, commandCenter, paletteOn, launch, pageFabs, appFabs } = g

  return (
    <>
      <div className="mateu-fab-rail" aria-label={tx('floatingActions')} role="group" hidden={!pageFabs.length && !appFabs.length && !commandCenter && !sseUrl}>
        {[...pageFabs, ...appFabs].map((f) => <Fab key={f.key} fab={f} />)}
        {commandCenter && (
          <Tooltip text={`${tx('commandCenter')} (Ctrl+K)`} direction="w">
            <IconButton className="mateu-fab" icon={CommandPaletteIcon} aria-label={tx('commandCenter')} variant="primary" size="large" onClick={() => setPalette(true)} />
          </Tooltip>
        )}
        {sseUrl && (
          <Tooltip text={chat ? tx('closeChat') : tx('openChat')} direction="w">
            <IconButton className="mateu-fab" icon={octiconOf(app['askIcon']) ?? CopilotIcon} aria-label={chat ? (app['askLabel'] ? tx('closeNamed', { name: String(app['askLabel']) }) : tx('closeChat')) : String(app['askLabel'] || tx('openChat'))} aria-expanded={chat} size="large" onClick={() => setChat((c) => !c)} />
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
        onAskAi={g.askAi}
      />
      {help && <ShortcutsHelp session={session} shortcuts={shortcuts} palette={paletteOn} onClose={() => setHelp(false)} />}
      {!!app['idleSession'] && <IdleWarning session={session} app={app} />}
      {/* the assistant is its own chunk: only an app with an agent (sseUrl) fetches it */}
      {sseUrl && <React.Suspense fallback={null}><ChatPanel session={session} sseUrl={sseUrl} open={chat} onClose={() => setChat(false)} seed={seed}
        texts={{ title: app['askLabel'] as string | null, follow: app['followLabel'] as string | null, following: app['followingLabel'] as string | null }} /></React.Suspense>}
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
