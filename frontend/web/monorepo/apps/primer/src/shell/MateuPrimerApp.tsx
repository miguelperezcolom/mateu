import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Flash, PageLayout, Spinner, Stack, Text, useConfirm } from '@primer/react'
import { MateuSession, type NavTarget } from '@rn/core/MateuSession'
import { appHomeOf } from '@rn/core/componentContext'
import { bootFailureOf, loadFailureMessage } from '@rn/core/uxRules'
import { locationOfRoute, routeOfLocation } from './pageConfig'
import { Toasts, useToasts } from './Toasts'
import { Overlays, useOverlays } from './Overlays'
import { AppShell } from './AppShell'
import { storedAppContext } from './header/appLevel'
import { ViewHost } from '../render/ViewHost'
import { GlobalLayer, type ContentPreview } from './global/GlobalLayer'
import { Resilience } from './resilience/Resilience'

type Dict = Record<string, unknown>

/**
 * The renderer's root: ONE MateuSession (the React Native renderer's core — api client, rules,
 * catalogues, the action pipeline) and what the browser's URL names.
 *
 * The boot is RN's (shell/SessionContent): the fresh load of the URL decides — an App shell (menu +
 * content area aimed at its home, or at the route a deep link named), or a screen on its own,
 * hosted at that route. Back / forward is that same fresh load again, like the web renderers.
 *
 * The session's host hooks are where a renderer plugs in: notify → Primer banners, openOverlay →
 * Primer Dialog, confirmAction / confirmDiscard → Primer's confirmation dialog, openView → the
 * browser history.
 */
export function MateuPrimerApp({ baseUrl }: { baseUrl: string }) {
  const session = useMemo(() => new MateuSession(baseUrl, newSessionId(), storedAppContext()) /* the @AppContext the user fixed rides every request */, [baseUrl])
  const confirm = useConfirm()
  const toasts = useToasts()
  const overlays = useOverlays(session)
  const [route, setRoute] = useState(() => routeOfLocation(window.location.pathname, baseUrl))
  const [boot, setBoot] = useState<{ app: Dict | null; failure: string | null; loading: boolean; attempt: number }>({ app: null, failure: null, loading: true, attempt: 0 })
  const [content, setContent] = useState<NavTarget | null>(null)
  // the assistant's render-screen in the content area: shown until the next navigation
  const [preview, setPreview] = useState<ContentPreview | null>(null)
  const showPreview = useCallback((p: Omit<ContentPreview, 'version'>) => setPreview((old) => ({ ...p, version: (old?.version ?? 0) + 1 })), [])

  // a navigation: written to the URL and loaded in the content area (or as THE screen)
  const go = useCallback((target: NavTarget, replace = false) => {
    const url = locationOfRoute(target.route, baseUrl) + carriedQuery()
    if (url !== window.location.pathname + window.location.search) {
      if (replace) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
    }
    setPreview(null)
    setContent(target)
  }, [baseUrl])

  useEffect(() => {
    session.notify = toasts.notify
    session.setTitle = (title) => { document.title = title }
    session.openOverlay = overlays.open
    session.closeTopOverlay = overlays.closeTop
    session.openView = (target) => go(target)
    session.confirmAction = (texts) => confirm({
      title: texts.header,
      content: texts.message,
      confirmButtonContent: texts.confirmationText,
      cancelButtonContent: texts.denialText,
      confirmButtonType: texts.destructive ? 'danger' : 'primary',
    })
    session.confirmDiscard = () => confirm({
      title: 'Discard changes?',
      content: 'You have unsaved changes on this screen. If you leave, they are lost.',
      confirmButtonContent: 'Discard',
      cancelButtonContent: 'Stay',
      confirmButtonType: 'danger',
    })
    session.reload = () => window.location.reload()
  }, [session, toasts.notify, overlays.open, overlays.closeTop, confirm, go])

  // the fresh load of the URL: an App shell, or a screen on its own
  useEffect(() => {
    let alive = true
    setBoot((b) => ({ ...b, loading: true, failure: null }))
    session.api.initialLoad(route, session.appState)
      .then((result) => {
        if (!alive) return
        const failure = bootFailureOf(result)
        if (failure) return setBoot((b) => ({ ...b, loading: false, failure }))
        const root = rootOf(result)
        const meta = ((root as Dict | null)?.['metadata'] as Dict | undefined) ?? {}
        if (meta['type'] === 'App') {
          if (meta['restSources'] !== undefined) session.sources.register(meta['restSources'])
          if (meta['actionCatalogue'] !== undefined) session.actionCatalogue.register(meta['actionCatalogue'] as never)
          if (meta['mockSources'] === true) session.sources.setSampleMode(true)
          if (typeof meta['title'] === 'string' && meta['title']) document.title = meta['title']
          setContent({ label: '', ...appHomeOf(meta) })
          setBoot((b) => ({ ...b, loading: false, app: meta }))
        } else {
          setContent({ label: '', route, consumedRoute: '_empty', serverSideType: '' })
          setBoot((b) => ({ ...b, loading: false, app: null }))
        }
      })
      .catch((e: Error) => { if (alive) setBoot((b) => ({ ...b, loading: false, failure: e.message })) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, route, boot.attempt])

  // back / forward: the fresh load of the URL again
  useEffect(() => {
    const onPop = async () => {
      const next = routeOfLocation(window.location.pathname, baseUrl)
      if (session.anyUnsavedChanges() && !(await session.confirmDiscard())) {
        window.history.pushState(null, '', locationOfRoute(content?.route ?? route, baseUrl) + carriedQuery())
        return
      }
      setContent(null)
      setRoute(next)
      setBoot((b) => ({ ...b, attempt: b.attempt + 1 }))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [session, route, content, baseUrl])

  const screen = preview
    ? <ViewHost key={`preview-${preview.version}`} session={session} preview={{ increment: preview.increment, route: preview.route, consumedRoute: preview.route }} onNavigate={go} />
    : content
    ? <ViewHost key={`${content.route}|${content.consumedRoute}|${content.serverSideType}`} session={session} target={content} onNavigate={go} />
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
            <div><Button onClick={() => setBoot((b) => ({ ...b, attempt: b.attempt + 1 }))}>Try again</Button></div>
          </Stack>
        </Flash>
      </Centered>
    )
  } else if (boot.loading && !content) {
    body = <Centered><Spinner size="large" srText="Loading" /></Centered>
  } else if (boot.app) {
    body = (
      <AppShell
        session={session}
        app={boot.app}
        current={content}
        onNavigate={async (target) => {
          if (session.anyUnsavedChanges() && !(await session.confirmDiscard())) return
          go(target)
        }}
      >
        {screen}
      </AppShell>
    )
  } else {
    body = <Centered>{screen}</Centered>
  }

  return (
    <>
      <a className="mateu-skip-link" href="#mateu-main" onClick={focusMain}>Skip to content</a>
      {body}
      {!boot.failure && <GlobalLayer session={session} app={boot.app ?? NO_APP} current={content} onNavigate={go} onPreview={showPreview} />}
      <Overlays state={overlays} />
      <Toasts state={toasts} />
      <Resilience session={session} />
    </>
  )
}

/** A screen on its own: no app shell, but its page FABs and screen shortcuts still need the global layer. */
const NO_APP: Record<string, unknown> = {}

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

/** The App shell of a load (a ServerSide whose first child is it, too), else its first component. */
function rootOf(result: unknown): unknown {
  const fragments = ((result as Dict)?.['fragments'] as Dict[] | undefined) ?? []
  const typeOf = (c: unknown) => ((c as Dict | null)?.['metadata'] as Dict | undefined)?.['type']
  const frag = fragments.find((f) => typeOf(f?.['component']) === 'App')
    ?? fragments.find((f) => typeOf((((f?.['component'] as Dict | undefined)?.['children'] as unknown[] | undefined) ?? [])[0]) === 'App')
    ?? fragments[0]
  const comp = (frag?.['component'] as Dict | undefined) ?? null
  const child = ((comp?.['children'] as unknown[] | undefined) ?? [])[0]
  return typeOf(child) === 'App' ? child : comp
}

/**
 * What a navigation keeps of the current query: nothing — the next screen's listing must not read
 * the previous one's search — but the dev server's `?baseUrl=` (a served page names its mount itself).
 */
function carriedQuery(): string {
  if (!import.meta.env.DEV) return ''
  const base = new URLSearchParams(window.location.search).get('baseUrl')
  return base ? `?baseUrl=${encodeURIComponent(base)}` : ''
}

function focusMain(e: React.MouseEvent) {
  const main = document.getElementById('mateu-main')
  if (!main) return
  e.preventDefault()
  main.focus()
}

function newSessionId(): string {
  // a session id is an identifier, never derived from Math.random: crypto is in every browser we serve
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return 's-' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
