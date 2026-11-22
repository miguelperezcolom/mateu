import React, { useCallback } from 'react'
import { Button, Flash, PageLayout, Spinner, Stack, Text, useConfirm } from '@primer/react'
import { loadFailureMessage } from '@rn/core/uxRules'
import type { StaticBundleLike } from '@mr/shell/appExtras'
import { useMateuApp, focusMain, NO_APP, type ConfirmRequest } from '@mr/shell/useMateuApp'
import { ViewHost } from '@mr/render/ViewHost'
import { tx } from '@mr/i18n/texts'
import { Toasts } from './Toasts'
import { Overlays } from './Overlays'
import { AppShell } from './AppShell'
import { GlobalLayer } from './global/GlobalLayer'
import { Resilience } from './resilience/Resilience'

/**
 * The Primer renderer's root: the shared boot (useMateuApp — the session, the URL, the fresh load,
 * back/forward, the host hooks) drawn in Primer: the app shell, Primer's confirmation dialog, its
 * banners as toasts, its Dialog overlays.
 */
export function MateuPrimerApp({ baseUrl, bundle }: { baseUrl: string; bundle?: StaticBundleLike | null }) {
  const primerConfirm = useConfirm()
  const confirm = useCallback((r: ConfirmRequest) => primerConfirm({
    title: r.title,
    content: r.message,
    confirmButtonContent: r.confirmLabel,
    cancelButtonContent: r.cancelLabel,
    confirmButtonType: r.destructive ? 'danger' : 'primary',
  }), [primerConfirm])
  const app = useMateuApp({ baseUrl, bundle, confirm, accentCss: primerAccent })
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
        <Flash variant="danger" role="alert">
          <Stack gap="condensed">
            <Text weight="semibold">{message.title}</Text>
            <Text>{message.detail}</Text>
            <div><Button onClick={app.retryBoot}>{tx('tryAgain')}</Button></div>
          </Stack>
        </Flash>
      </Centered>
    )
  } else if (boot.loading && !content) {
    body = <Centered><Spinner size="large" srText={tx('loading')} /></Centered>
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
    </>
  )
}

/** A screen with no app shell: Primer's page container (centred, its margins). */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout containerWidth="xlarge" padding="normal">
      <PageLayout.Content as="main" width="full">
        <div id="mateu-main" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      </PageLayout.Content>
    </PageLayout>
  )
}

/**
 * `@App(accentColor)` on Primer's own accent hooks — the selected navigation item's marker and the
 * underline of the current tab — in the LIGHT scheme only (dark keeps Primer's tuned accent). More
 * specific than the primitives' theme blocks, which Primer's ThemeProvider repeats on its own root.
 */
function primerAccent(color: string): string {
  const vars = `--mateu-accent: ${color}; --underlineNav-borderColor-active: ${color}; --borderColor-accent-emphasis: ${color};`
  return `:root[data-color-mode="light"], :root[data-color-mode="light"] [data-color-mode] { ${vars} }\n`
    + `@media (prefers-color-scheme: light) { :root[data-color-mode="auto"], :root[data-color-mode="auto"] [data-color-mode] { ${vars} } }`
}
