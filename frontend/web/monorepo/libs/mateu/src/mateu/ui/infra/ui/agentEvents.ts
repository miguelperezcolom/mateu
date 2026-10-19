import { isEventClaimed, NAVIGATION_REQUESTED, RENDER_SCREEN, renderScreenRequestOf } from './chatEvents'
import { renderScreenInShell } from './builtInRenderTarget'
import { navigateToRoute } from './rowRoute'
import { agentMayDispatch } from './agentEventPolicy'
import { isTrustedOrigin } from '@infra/http/credentialScope.ts'

/**
 * What the UI does with ONE agent event — the chat's stream (`{"event":…}`) and the live UI push
 * channel (an `AgentPush` command, agentChannel.ts) go through here, so a pushed `render-screen`
 * behaves exactly like the chat's, and a pushed `navigation-requested` like a menu click.
 *
 * The event is dispatched first, from `origin`, as a bubbling, composed, cancelable DOM event: a
 * page subscribed to it (`@SubscribeTo`) takes it, the shell takes `navigation-requested` (its
 * listener calls preventDefault). Then, for what nobody took:
 *  - `navigation-requested`: the app shell around the origin navigates with those fields (the same
 *    handler a menu click and the chat panel reach); outside a shell, the route is opened directly;
 *  - `render-screen`: the built-in render target (`__preview__` → content / drawer / dialog);
 *  - anything else: nothing more — dispatching it was the whole job.
 *
 * Only the built-in events and those a component on screen DECLARES (`@SubscribeTo`) go out, and
 * never one of the framework's own event names (agentEventPolicy.ts): an agent must not be able to
 * fire `server-side-action-requested`, `page-banners-received`, `route-changed`… at the app.
 */

export interface AgentEventOptions {
    /** Called when a generated screen could not be shown (the chat says so in the conversation). */
    onRenderFailed?: (error: unknown) => void
}

/** An app shell with the navigation handler the menu and the chat panel use. */
interface NavigatingShell extends HTMLElement {
    updateRoute: (e: Event) => void
    component?: { metadata?: { variant?: string } }
}

const parentOf = (node: Node): Node | null =>
    node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode

/**
 * The app shell that owns the origin (the origin itself included), crossing shadow roots. A nested
 * MEDIATOR shell (a crud's chrome-less shell in the content area) does not own navigation: the
 * shell around it does.
 */
export function navigatingShellOf(origin: Element): NavigatingShell | null {
    for (let node: Node | null = origin; node; node = parentOf(node)) {
        if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() !== 'mateu-app') continue
        const shell = node as NavigatingShell
        if (typeof shell.updateRoute !== 'function') continue
        if (shell.component?.metadata?.variant === 'MEDIATOR') continue
        return shell
    }
    return null
}

/**
 * An agent's navigation names a `baseUrl` only to reach a remote of THIS app: kept when it is the
 * app's own origin or a remote the app's menu declares (credentialScope.isTrustedOrigin — the rule
 * credentials follow); any other base url is dropped and the route is opened in the app. Before
 * this, an agent steered by what it read could name an attacker's Mateu-shaped server and the
 * content view rendered its answer with the author's trust (R1).
 */
export function trustedNavigationOf(detail: unknown): unknown {
    if (!detail || typeof detail !== 'object') return detail
    const fields = detail as Record<string, unknown>
    if (!('baseUrl' in fields) || fields.baseUrl === undefined || fields.baseUrl === null || fields.baseUrl === '') return detail
    if (typeof fields.baseUrl === 'string' && isTrustedOrigin(fields.baseUrl)) return detail
    console.warn('[mateu] an agent navigation named a base url this app does not trust; opened in the app instead')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { baseUrl, ...rest } = fields
    return rest
}

export function applyAgentEvent(origin: Element, name: string, detail: unknown, options: AgentEventOptions = {}): void {
    if (!agentMayDispatch(name)) {
        console.warn('[mateu] agent event not declared on this screen, dropped:', name)
        return
    }
    if (name === NAVIGATION_REQUESTED) detail = trustedNavigationOf(detail)
    const event = new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true })
    origin.dispatchEvent(event)
    if (name === NAVIGATION_REQUESTED) {
        if (event.defaultPrevented) return
        const shell = navigatingShellOf(origin)
        if (shell && detail && typeof detail === 'object') {
            shell.updateRoute(new CustomEvent(NAVIGATION_REQUESTED, { detail, cancelable: true }))
            return
        }
        const route = (detail as { route?: unknown } | null)?.route
        if (typeof route === 'string') navigateToRoute(origin as HTMLElement, route)
        return
    }
    if (name === RENDER_SCREEN && !isEventClaimed(event)) {
        const request = renderScreenRequestOf(detail)
        if (!request) return
        renderScreenInShell(origin, request).catch((e: unknown) => {
            console.warn('[mateu] render-screen', e)
            options.onRenderFailed?.(e)
        })
    }
}
