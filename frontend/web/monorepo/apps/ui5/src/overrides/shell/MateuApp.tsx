import React, { useCallback, useState } from 'react'
import { BusyIndicator, Button, IllustratedMessage } from '@ui5/webcomponents-react'
import { loadFailureMessage } from '@rn/core/uxRules'
import type { StaticBundleLike } from '@mr/shell/appExtras'
import { useMateuApp, focusMain, NO_APP, type ConfirmRequest } from '@mr/shell/useMateuApp'
import { ViewHost } from '@mr/render/ViewHost'
import { tx } from '@mr/i18n/texts'
import { ConfirmDialog } from '@kit'
import { Toasts } from '@mr/views/shell/Toasts'
import { Overlays } from '@mr/views/shell/Overlays'
import { AppShell } from '@app/overrides/shell/AppShell'
import { GlobalLayer } from '@mr/views/shell/global/GlobalLayer'
import { Resilience } from '@app/overrides/shell/resilience/Resilience'
import '@mr/views/base.css'

interface Pending extends ConfirmRequest { resolve: (ok: boolean) => void }

/**
 * The SAP renderer's root: the shared boot (useMateuApp — the session, the URL, the fresh load,
 * back/forward, the host hooks) drawn as a Fiori app: the shell bar and side navigation, Fiori's
 * confirmation dialog, message strips and toasts, ui5-dialog overlays.
 */
export function MateuApp({ baseUrl, bundle }: { baseUrl: string; bundle?: StaticBundleLike | null; accentCss?: (color: string) => string }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const confirm = useCallback((r: ConfirmRequest) => new Promise<boolean>((resolve) => setPending({ ...r, resolve })), [])
  const app = useMateuApp({ baseUrl, bundle, confirm, accentCss: ui5Accent })
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
        <div role="alert">
          <IllustratedMessage name="ErrorScreen" titleText={message.title} subtitleText={message.detail}>
            <Button design="Emphasized" onClick={app.retryBoot}>{tx('tryAgain')}</Button>
          </IllustratedMessage>
        </div>
      </Centered>
    )
  } else if (boot.loading && !content) {
    body = <Centered><BusyIndicator active size="L" aria-label={tx('loading')} style={{ display: 'block', margin: '4rem auto' }} /></Centered>
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
      {pending && (
        <ConfirmDialog title={pending.title} content={pending.message} confirmButtonContent={pending.confirmLabel} cancelButtonContent={pending.cancelLabel}
          confirmButtonType={pending.destructive ? 'danger' : 'primary'} onClose={(ok) => { pending.resolve(ok); setPending(null) }} />
      )}
    </>
  )
}

/** A screen with no app shell: the content on the page background, Fiori's responsive margins. */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mateu-page-container">
      <div id="mateu-main" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
    </main>
  )
}

/**
 * `@App(accentColor)`: Horizon keeps its own theme — an app's accent only marks the brand area of
 * the shell bar (Fiori lets a company brand its shell, never its controls).
 */
function ui5Accent(color: string): string {
  return `.mateu-shell-brand { --mateu-accent: ${color}; }`
}
