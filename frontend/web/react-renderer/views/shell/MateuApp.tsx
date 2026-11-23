import React from 'react'
import { loadFailureMessage } from '@rn/core/uxRules'
import type { StaticBundleLike } from '@mr/shell/appExtras'
import { useMateuApp, focusMain, NO_APP } from '@mr/shell/useMateuApp'
import { ViewHost } from '@mr/render/ViewHost'
import { tx } from '@mr/i18n/texts'
import { Toasts } from './Toasts'
import { Overlays } from './Overlays'
import { AppShell } from './AppShell'
import { GlobalLayer } from './global/GlobalLayer'
import { Resilience } from './resilience/Resilience'
import { BootFailure, BootLoading, Centered, useConfirmDialog } from './bootViews'
import '../base.css'

/**
 * A React renderer's root: the shared boot (useMateuApp — the session, the URL, the fresh load,
 * back/forward, the host hooks) drawn with the renderer's kit (@kit): the app shell, the kit's
 * confirmation dialog, its banners as toasts, its dialog overlays. `accentCss` writes
 * `@App(accentColor)` on the design system's own accent hooks (the renderer app supplies it).
 */
export function MateuApp({ baseUrl, bundle, accentCss }: {
  baseUrl: string
  bundle?: StaticBundleLike | null
  accentCss: (color: string) => string
}) {
  const { confirm, dialog } = useConfirmDialog()
  const app = useMateuApp({ baseUrl, bundle, confirm, accentCss })
  const { session, boot, content, preview, go } = app

  const screen = preview
    ? <ViewHost key={`preview-${preview.version}`} session={session} preview={{ increment: preview.increment, route: preview.route, consumedRoute: preview.route }} onController={app.onScreenController} onNavigate={go} />
    : content
    ? <ViewHost key={app.contentKey} session={app.screenSession} target={content} onController={app.onScreenController} onNavigate={go} />
    : null

  let body: React.ReactNode
  if (boot.failure) {
    const message = loadFailureMessage(boot.failure)
    body = (
      <Centered>
        <BootFailure title={message.title} detail={message.detail} onRetry={app.retryBoot} />
      </Centered>
    )
  } else if (boot.loading && !content) {
    body = <Centered><BootLoading /></Centered>
  } else if (boot.app) {
    body = <AppShell session={session} app={boot.app} current={content} onNavigate={app.navigate}>{screen}</AppShell>
  } else {
    body = <Centered>{screen}</Centered>
  }

  return (
    <>
      <a className="mateu-skip-link" href="#mateu-main" onClick={focusMain}>{tx('skipToContent')}</a>
      {body}
      {!boot.failure && <GlobalLayer session={session} app={boot.app ?? NO_APP} current={content} onNavigate={go} onPreview={app.showPreview} />}
      <Overlays state={app.overlays} />
      <Toasts state={app.toasts} />
      <Resilience session={session} />
      {dialog}
    </>
  )
}
