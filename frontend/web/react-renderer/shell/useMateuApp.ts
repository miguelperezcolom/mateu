import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MateuSession, declareMenuRemotes, navigationSession, type NavTarget } from '@rn/core/MateuSession'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { remoteHomeBaseUrl } from '@rn/core/homeTarget'
import { appHomeOf } from '@rn/core/componentContext'
import { bootFailureOf } from '@rn/core/uxRules'
import { applyAppExtras, type AccentCss, type StaticBundleLike } from './appExtras'
import { locationOfRoute, routeOfLocation } from './pageConfig'
import { storedAppContext } from './appLevel'
import { useToasts, type ToastsState } from './toasts'
import { useOverlays, type OverlaysState } from './overlays'
import { tx } from '../i18n/texts'

type Dict = Record<string, unknown>

/** A confirmation in neutral words: each renderer asks it with its design system's dialog. */
export interface ConfirmRequest {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive: boolean
}
export type Confirm = (request: ConfirmRequest) => Promise<boolean>

/** The assistant's render-screen in the content area: shown until the next navigation. */
export interface ContentPreview {
  increment: unknown
  route: string
  title?: string
  version: number
}

export interface BootState {
  app: Dict | null
  failure: string | null
  loading: boolean
  attempt: number
}

export interface MateuApp {
  session: MateuSession
  boot: BootState
  /** The screen in the content area (or THE screen, with no app shell). */
  content: NavTarget | null
  preview: ContentPreview | null
  toasts: ToastsState
  overlays: OverlaysState
  /** A navigation: written to the URL and loaded in the content area. */
  go: (target: NavTarget, replace?: boolean) => void
  /** A menu click: asks about unsaved changes first. */
  navigate: (target: NavTarget) => Promise<void>
  retryBoot: () => void
  showPreview: (p: Omit<ContentPreview, 'version'>) => void
  /** The content view's controller, for the assistant and an operating agent (RN's screenOf). */
  onScreenController: (c: MateuViewController) => void
  /** The session a content screen runs against (a federated one: its own backend). */
  screenSession: MateuSession
  /** A key that changes whenever the content view must be a new one. */
  contentKey: string
}

/**
 * The renderer's root, without the drawing: ONE MateuSession (the React Native renderer's core —
 * api client, rules, catalogues, the action pipeline) and what the browser's URL names.
 *
 * The boot is RN's (shell/SessionContent): the fresh load of the URL decides — an App shell (menu +
 * content area aimed at its home, or at the route a deep link named), or a screen on its own,
 * hosted at that route. Back / forward is that same fresh load again, like the web renderers. The
 * session's host hooks are wired here: notify → the toasts, openOverlay → the overlay stack,
 * confirmAction / confirmDiscard → the renderer's `confirm`, openView → the browser history.
 */
export function useMateuApp({ baseUrl, bundle, confirm, accentCss }: {
  baseUrl: string
  bundle?: StaticBundleLike | null
  /** The renderer's confirmation dialog. */
  confirm: Confirm
  /** How the renderer puts `@App(accentColor)` on its design system (none: the accent is ignored). */
  accentCss?: AccentCss
}): MateuApp {
  const session = useMemo(() => {
    const s = new MateuSession(baseUrl, newSessionId(), storedAppContext()) /* the @AppContext the user fixed rides every request */
    // a static bundle (<mateu-ui bundleUrl>): loads are answered from it, actions still go to a host if there is one
    if (bundle) s.openStaticBundle(bundle as never)
    return s
  }, [baseUrl, bundle])
  const toasts = useToasts()
  const overlays = useOverlays(session)
  const [route, setRoute] = useState(() => routeOfLocation(window.location.pathname, baseUrl))
  const [boot, setBoot] = useState<BootState>({ app: null, failure: null, loading: true, attempt: 0 })
  const [content, setContent] = useState<NavTarget | null>(null)
  const [preview, setPreview] = useState<ContentPreview | null>(null)
  const showPreview = useCallback((p: Omit<ContentPreview, 'version'>) => setPreview((old) => ({ ...p, version: (old?.version ?? 0) + 1 })), [])

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
      message: texts.message,
      confirmLabel: texts.confirmationText,
      cancelLabel: texts.denialText,
      destructive: !!texts.destructive,
    })
    session.confirmDiscard = () => confirm({
      title: tx('discardTitle'),
      message: tx('discardMessage'),
      confirmLabel: tx('discard'),
      cancelLabel: tx('stay'),
      destructive: true,
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
          // the menu's federated entries are trusted with the user's credentials; nothing else is
          declareMenuRemotes(session, meta['menu'])
          // accent, favicon, the app-scope data, the capability handshake
          applyAppExtras(session, meta, () => setBoot((b) => ({ ...b })), accentCss)
          const homeBase = remoteHomeBaseUrl(meta as { homeBaseUrl?: string | null }, session.api.baseUrl)
          setContent({ label: '', ...appHomeOf(meta), ...(homeBase ? { baseUrl: homeBase } : {}) } as NavTarget)
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

  const onScreenController = useCallback((c: MateuViewController) => {
    session.currentScreen = () => ({ route: c.currentRoute, componentState: c.currentComponentState, component: c.rendered.component } as never)
    session.agentScreen.page = c
  }, [session])

  // a federated screen runs against its own backend (credentials only where the menu trusted it)
  const contentBase = content ? baseUrlOf(content) : undefined
  const screenSession = useMemo(() => (contentBase ? navigationSession(session, contentBase) : session), [session, contentBase])

  const navigate = useCallback(async (target: NavTarget) => {
    if (session.anyUnsavedChanges() && !(await session.confirmDiscard())) return
    go(target)
  }, [session, go])

  const retryBoot = useCallback(() => setBoot((b) => ({ ...b, attempt: b.attempt + 1 })), [])

  return {
    session, boot, content, preview, toasts, overlays, go, navigate, retryBoot, showPreview, onScreenController, screenSession,
    contentKey: content ? `${content.route}|${content.consumedRoute}|${content.serverSideType}|${baseUrlOf(content) ?? ''}` : '',
  }
}

/** The backend a navigation names, when it is not the shell's (a federated menu entry, a remote home). */
export const baseUrlOf = (t: NavTarget): string | undefined => (t as NavTarget & { baseUrl?: string }).baseUrl || undefined

/** A screen on its own: no app shell, but its page FABs and screen shortcuts still need the global layer. */
export const NO_APP: Record<string, unknown> = {}

/** The App shell of a load (a ServerSide whose first child is it, too), else its first component. */
export function rootOf(result: unknown): unknown {
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
export function carriedQuery(): string {
  if (!import.meta.env.DEV) return ''
  const base = new URLSearchParams(window.location.search).get('baseUrl')
  return base ? `?baseUrl=${encodeURIComponent(base)}` : ''
}

/** The skip link's target: the content region (`#mateu-main`), focused without scrolling the page away. */
export function focusMain(e: React.MouseEvent) {
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
