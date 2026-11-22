import React, { useEffect, useState } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { headerChangesOf, parseSseChunk, reconnectDelay, type HeaderValue } from '@rn/core/appShellExtras'
import { presenceChangesOf, newEditors, presenceRouteOf, presenceSummary, type PresenceEntry } from '@rn/core/presence'
import { inboxChangeOf } from '@rn/core/inbox'
import { RENDERER_HEADER, rendererHeaderValue } from '@rn/core/buildSkew'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { AccessibilityInfo } from '../../shims/react-native'
import type { AppTarget } from './appLevel'
import { tx } from '../../i18n/texts'

/** The header values ("Business date 12 Oct 2026"), repainted from the session's store. */
export function HeaderValues({ session, declared }: { session: MateuSession; declared: HeaderValue[] | undefined }) {
  const [, setVersion] = useState(0)
  // subscribed BEFORE the seed, so the seed's own change repaints
  useEffect(() => session.headerValues.subscribe(() => setVersion((v) => v + 1)), [session])
  useEffect(() => { session.headerValues.seed(declared); setVersion((v) => v + 1) }, [session, declared])
  const values = session.headerValues.list()
  if (values.length === 0) return null
  return (
    <ul className="mateu-header-values" aria-label={tx('headerValues')}>
      {values.map((v) => (
        <li key={v.id} className="mateu-header-value">
          {!!v.label && <span className="mateu-header-muted">{v.label}</span>}
          <span className="mateu-header-value-text">{v.value}</span>
        </li>
      ))}
    </ul>
  )
}

const commandsOf = (increment: unknown, type: string): unknown[] =>
  ((increment as { commands?: { type?: string; data?: unknown }[] } | null)?.commands ?? [])
    .filter((c) => c?.type === type).map((c) => c.data ?? {})

/**
 * `@App(liveUpdates)` / `@App(presence)`: the app event stream — the app-level `_live-updates`
 * action on the existing SSE endpoint — kept open while the tab is visible, reopened with a back-off
 * (the server ends it every few minutes on purpose). Each increment's header values, presence
 * changes and inbox changes land in the session's stores.
 */
export function useLiveUpdates(session: MateuSession, app: AppTarget & { liveUpdates?: boolean; presence?: boolean }) {
  useEffect(() => {
    session.presence.configure(app)
    return () => session.presence.configure(null)
  }, [session, app])

  useEffect(() => {
    if (!app.liveUpdates && !app.presence) return
    let controller: AbortController | null = null
    let timer: number | undefined
    let failures = 0
    let stopped = false

    const connect = async () => {
      if (stopped || controller || document.visibilityState === 'hidden') return
      const own = new AbortController()
      controller = own
      const route = (app.rootRoute ?? '').replace(/^\/+/, '') || '_no_route'
      try {
        const response = await fetch(`${session.api.baseUrl}/mateu/v3/sse/${route}`, {
          method: 'POST',
          signal: own.signal,
          headers: { ...(await session.api.headers({ Accept: 'text/event-stream' })), [RENDERER_HEADER]: rendererHeaderValue() },
          body: JSON.stringify({
            serverSideType: app.serverSideType ?? null, appState: session.appState, componentState: {}, parameters: {},
            initiatorComponentId: 'mateu-live-updates', consumedRoute: '', route: '/' + route, actionId: '_live-updates',
          }),
        })
        if (!response.ok || !response.body) throw new Error(`live updates: HTTP ${response.status}`)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        failures = 0
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const { increments, rest } = parseSseChunk(buffer)
          buffer = rest
          for (const increment of increments) {
            for (const change of headerChangesOf(increment)) {
              const said = session.headerValues.update(change.id, change.value)
              if (said) AccessibilityInfo.announceForAccessibility(said)
            }
            for (const change of presenceChangesOf(increment)) session.presence.apply(change)
            for (const data of commandsOf(increment, 'NotificationsChanged')) {
              const change = session.inbox.apply(inboxChangeOf(data))
              if (change.kind === 'upsert' && change.item.unread && !change.item.resolved) {
                session.notify(null, change.item.title, change.item.variant === 'error' || change.item.variant === 'warning' ? change.item.variant : 'info')
              }
            }
          }
        }
      } catch {
        if (own.signal.aborted) return
        failures++
      } finally {
        if (controller === own) {
          controller = null
          if (!stopped) timer = window.setTimeout(() => void connect(), reconnectDelay(failures))
        }
      }
    }

    const stop = () => {
      window.clearTimeout(timer)
      controller?.abort()
      controller = null
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') void connect(); else stop() }
    document.addEventListener('visibilitychange', onVisibility)
    void connect()
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [session, app])
}

/**
 * Record presence (`@App(presence)`): above a record screen, "Ana is editing this record" in an
 * attention tone, "Bob is viewing it" otherwise; nothing when nobody else is there. Someone STARTING
 * to edit is announced once. Editing = this screen holds unsaved changes.
 */
export function PresenceChip({ controller }: { controller: MateuViewController }) {
  const session = controller.session
  const [entries, setEntries] = useState<PresenceEntry[]>([])
  const route = presenceRouteOf(controller.currentRoute, session.presence.rootRoute)
  const view = controller.currentServerSideType
  const edits = controller.trackDirty
  useEffect(() => {
    if (!session.presence.enabled) return
    let previous: PresenceEntry[] | null = null
    const watch = session.presence.watch(route, view, edits, controller.dirty, (next) => {
      if (previous) for (const name of newEditors(previous, next)) AccessibilityInfo.announceForAccessibility(`${name} started editing this record`)
      previous = next
      setEntries(next)
    })
    const before = controller.onDirtyChanged
    controller.onDirtyChanged = (dirty) => { before(dirty); watch.setEditing(dirty) }
    return () => { controller.onDirtyChanged = before; watch.stop() }
  }, [session, controller, route, view, edits])
  const summary = presenceSummary(entries)
  if (!summary) return null
  return (
    <div className={'mateu-presence' + (summary.tone === 'warning' ? ' is-editing' : '')} role="status" aria-label={`${tx('presenceLabel')}: ${summary.text}`}>
      {summary.text}
    </div>
  )
}
