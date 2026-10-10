/**
 * Live reload — the DOM half. Installed once by the top-level `mateu-ui`, and only when the page
 * was served by a backend in development mode (see `devEventsUrl`); otherwise it does nothing at
 * all — no request, no listener.
 *
 * On a `page` change it re-requests the route ON SCREEN, in place (no navigation, no full page
 * load), carrying what the user has typed: the content's live componentState is sent with the load
 * (so a Java view model is hydrated from it) and re-applied over the answer (so a definition-only
 * page keeps it too). On an `app` change it remounts the app on the same URL. A dropped stream
 * reconnects by itself (EventSource), and the `hello` of a RESTARTED server re-renders the page.
 */
import { decideLiveReload, devEventsUrl, LiveReloadAction, strongest } from './liveReloadPolicy'
import { isAppShell } from '@infra/ui/layout/pageWidth.ts'
import type Component from '@mateu/shared/apiClients/dtos/Component.ts'

/** What the live reload needs from the top-level host (`mateu-ui`). */
export interface LiveReloadHost extends HTMLElement {
    /** Rebuilds the whole tree on the current URL. */
    remount(): void
}

/** What it needs from a `mateu-ux`. */
interface ReloadableUx extends HTMLElement {
    fragment?: { component?: Component }
    liveReload?: (state: Record<string, unknown> | undefined) => void
}

let installed: EventSource | undefined

/** Subscribes to the dev event stream when the page announces one. Idempotent. */
export const installLiveReload = (host: LiveReloadHost): void => {
    if (installed || typeof EventSource === 'undefined') return
    const url = devEventsUrl(document, window)
    if (!url) return
    const source = new EventSource(url)
    installed = source
    let bootId: string | undefined
    let pending: LiveReloadAction = 'none'
    let reason: string | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    source.onmessage = (event: MessageEvent) => {
        let message
        try {
            message = JSON.parse(event.data)
        } catch {
            return
        }
        const decision = decideLiveReload(message, bootId)
        bootId = decision.bootId
        if (decision.action === 'none') return
        pending = strongest(pending, decision.action)
        reason = decision.reason
        // A burst (an editor's save, a git checkout) collapses into ONE reload.
        clearTimeout(timer)
        timer = setTimeout(() => {
            const action = pending
            pending = 'none'
            applyLiveReload(host, action, reason)
        }, 60)
    }
}

/** Tests. */
export const resetLiveReload = (): void => {
    installed?.close()
    installed = undefined
}

export const applyLiveReload = (
    host: LiveReloadHost,
    action: LiveReloadAction,
    reason?: string,
): void => {
    if (action === 'none') return
    if (action === 'app') {
        host.remount()
    } else if (reloadContent(host) === 0) {
        // Nothing routed on screen yet (or only a shell): a remount is the only meaningful reload.
        host.remount()
    }
    showLiveReloadIndicator(reason)
}

/**
 * Re-requests every routed content on screen, keeping its state. Returns how many were reloaded.
 */
export const reloadContent = (root: Node): number => {
    const targets = contentUxs(root)
    for (const ux of targets) {
        const component = firstDeep(ux, 'MATEU-COMPONENT') as (HTMLElement & {
            state?: Record<string, unknown>
        }) | undefined
        const state = component?.state
        ux.liveReload?.(state ? { ...state } : undefined)
    }
    return targets.length
}

/**
 * The routed CONTENT under `root`: the outermost `mateu-ux` elements showing something that is not
 * an app shell. An app shell's ux is walked through (its content area holds the screen); an
 * embedded island inside a screen is left alone — re-rendering its host re-renders it too.
 */
export const contentUxs = (root: Node): ReloadableUx[] => {
    const found: ReloadableUx[] = []
    const visit = (node: Node) => {
        for (const child of childrenOf(node)) {
            if ((child as Element).tagName === 'MATEU-UX') {
                const component = (child as ReloadableUx).fragment?.component
                if (component && !isAppShell(component)) {
                    found.push(child as ReloadableUx)
                    continue
                }
            }
            visit(child)
        }
    }
    visit(root)
    return found
}

const childrenOf = (node: Node): Element[] => {
    const out: Element[] = [...((node as Element | ShadowRoot).children ?? [])]
    const shadow = (node as Element).shadowRoot
    if (shadow) out.push(...shadow.children)
    return out
}

const firstDeep = (root: Node, tagName: string): Element | undefined => {
    for (const child of childrenOf(root)) {
        if (child.tagName === tagName) return child
        const inner = firstDeep(child, tagName)
        if (inner) return inner
    }
    return undefined
}

const INDICATOR_ID = 'mateu-live-reload-indicator'

/** A small, unobtrusive pill (bottom-left) that fades out by itself. */
export const showLiveReloadIndicator = (reason?: string): void => {
    if (typeof document === 'undefined' || !document.body) return
    let pill = document.getElementById(INDICATOR_ID)
    if (!pill) {
        pill = document.createElement('div')
        pill.id = INDICATOR_ID
        pill.setAttribute('role', 'status')
        pill.setAttribute('aria-live', 'polite')
        pill.style.cssText = [
            'position:fixed', 'left:12px', 'bottom:12px', 'z-index:2147483000',
            'padding:4px 10px', 'border-radius:999px', 'font:12px/1.4 system-ui,sans-serif',
            'background:rgba(30,30,30,.82)', 'color:#fff', 'pointer-events:none',
            'transition:opacity .4s ease', 'opacity:0',
        ].join(';')
        document.body.appendChild(pill)
    }
    pill.textContent = '↻ Reloaded' + (reason ? ` · ${reason}` : '')
    pill.style.opacity = '1'
    const current = pill
    clearTimeout((current as unknown as { _t?: ReturnType<typeof setTimeout> })._t)
    ;(current as unknown as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
        current.style.opacity = '0'
    }, 1800)
}
