import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient'
import { isStaticBundleUrl } from '@infra/http/bundleStore'
import { expandDefinition } from '@infra/expander/expandDefinition'
import { chromeText } from '@infra/ui/chromeTexts'
import { announce } from '@infra/a11y/announcer'
import {
    jsonDefinitionOf,
    PREVIEW_ACTION,
    previewParametersOf,
    type RenderScreenRequest,
} from '@infra/ui/chatEvents'

/**
 * The BUILT-IN render target of the chat's `render-screen` event: when no component on screen
 * subscribes to it, the shell renders the screen the agent authored itself. The definition goes to
 * the backend's reserved `__preview__` action — the one the visual editor uses — which turns it into
 * a normal UI increment through the real mapper; nothing is bound to a view model, so it renders
 * exactly what it was given and nothing the caller could not already see. The result lands in the
 * content area (transiently: any navigation brings the route's own screen back), or in a drawer or a
 * dialog over it.
 *
 * With no backend (a static bundle) a JSON definition is expanded in the browser instead.
 */

interface ContentView extends HTMLElement {
    id: string
    fragment?: UIFragment
    baseUrl?: string
    route?: string
    consumedRoute?: string
    appState?: Record<string, unknown>
    showTransient(fragment: UIFragment): void
}

interface OverlayHost extends HTMLElement {
    id: string
    applyFragment(fragment: UIFragment): void
}

/** The id of the overlay a generated screen opens in: one at a time, a new one refreshes it. */
export const GENERATED_SCREEN_ID = 'mateu-generated-screen'

/** The parent of a node, crossing shadow boundaries (a shadow root's parent is its host). */
const parentOf = (node: Node): Node | null =>
    node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode

/**
 * The content area the origin (the chat panel, or an inline Chat on a page) belongs to: the content
 * view of the nearest app shell around it, else the outermost view around it, else the page's.
 */
export function contentViewFor(origin: Element): ContentView | null {
    let outermostUx: ContentView | null = null
    for (let node: Node | null = origin; node; node = parentOf(node)) {
        if (!(node instanceof HTMLElement)) continue
        const tag = node.tagName.toLowerCase()
        if (tag === 'mateu-app' && node.shadowRoot) {
            const content = node.shadowRoot.querySelector('mateu-ux[data-content-view]') as ContentView | null
            if (content) return content
        }
        if (tag === 'mateu-ux') outermostUx = node as ContentView
    }
    return outermostUx
        ?? (document.querySelector('mateu-ux[data-content-view]') as ContentView | null)
        ?? findDeep(document, 'mateu-ux[data-content-view]') as ContentView | null
}

/** querySelector through open shadow roots (the content view lives inside the app's). */
function findDeep(root: Document | ShadowRoot | Element, selector: string): Element | null {
    const direct = root.querySelector(selector)
    if (direct) return direct
    for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.shadowRoot) {
            const found = findDeep(el.shadowRoot, selector)
            if (found) return found
        }
    }
    return null
}

/** The overlay of a generated screen: a client-side Drawer or Dialog holding it as its content. */
export function overlayOf(request: RenderScreenRequest, content: Component, state: Record<string, unknown> | undefined): Component {
    const headerTitle = request.title ?? chromeText('chatGeneratedScreen')
    const metadata = request.target === 'dialog'
        ? {
            type: ComponentMetadataType.Dialog,
            id: GENERATED_SCREEN_ID,
            headerTitle,
            content,
            closeButtonOnHeader: true,
            width: 'min(64rem, 92vw)',
            initialData: state ?? {},
        }
        : {
            type: ComponentMetadataType.Drawer,
            id: GENERATED_SCREEN_ID,
            headerTitle,
            content,
            position: 'end',
            size: 'l',
            maximizable: true,
            initialData: state ?? {},
        }
    return {
        type: ComponentType.ClientSide,
        id: GENERATED_SCREEN_ID,
        metadata,
        children: [],
        style: '',
        cssClasses: '',
        slot: '',
        initialData: undefined,
        confirmOnNavigationIfDirty: false,
    } as unknown as Component
}

/** The id of the wrapper that holds a transient screen and an overlay opened over it. */
export const GENERATED_HOST_ID = 'mateu-generated-host'

/**
 * The content area's fragment with an overlay over its screen: a plain Div holding the screen on
 * show (unwrapped first, when it is already such a host) and the overlay — a newer overlay replaces
 * the previous one, as on a page.
 */
export function withOverlay(current: UIFragment, overlay: Component): UIFragment {
    const shown = current.component!
    const screen = shown.id === GENERATED_HOST_ID ? (shown.children ?? [])[0] : shown
    return {
        ...current,
        component: {
            type: ComponentType.ClientSide,
            id: GENERATED_HOST_ID,
            metadata: { type: ComponentMetadataType.Div },
            children: screen ? [screen, overlay] : [overlay],
            style: '',
            cssClasses: '',
            slot: '',
            initialData: undefined,
            confirmOnNavigationIfDirty: false,
        } as unknown as Component,
    }
}

async function previewFragment(view: ContentView, request: RenderScreenRequest): Promise<UIFragment> {
    const baseUrl = view.baseUrl ?? ''
    const expandLocally = (): UIFragment | undefined => {
        const json = jsonDefinitionOf(request)
        return json ? expandDefinition(json, view.route ?? '', request.title).fragments?.find(f => f.component) : undefined
    }
    if (isStaticBundleUrl(baseUrl)) {
        const local = expandLocally()
        if (local) return local
        throw new Error('this deployment has no backend to render YAML; send the screen as JSON (uidl)')
    }
    try {
        const increment = await mateuApiClient.runAction(
            baseUrl, view.route ?? '', view.consumedRoute ?? '', PREVIEW_ACTION, view.id,
            view.appState, undefined, {}, previewParametersOf(request), view, true)
        const fragment = increment?.fragments?.find(f => f.component)
        if (!fragment) throw new Error('the backend returned nothing to show')
        return fragment
    } catch (e) {
        const local = expandLocally()
        if (local) return local
        throw e
    }
}

/**
 * Renders a generated screen where the request says. Resolves once it is on screen; rejects with
 * the reason when it could not be shown (no content area, the backend failed).
 */
export async function renderScreenInShell(origin: Element, request: RenderScreenRequest): Promise<void> {
    const view = contentViewFor(origin)
    if (!view) throw new Error('there is no content area to show it in')
    const fragment = await previewFragment(view, request)
    const page = request.target === 'content'
        ? null
        : (view.shadowRoot ?? view).querySelector('mateu-component') as OverlayHost | null
    const overlay = () => overlayOf(request, fragment.component!, fragment.state as Record<string, unknown> | undefined)
    if (page && typeof page.applyFragment === 'function') {
        page.applyFragment({
            targetComponentId: page.id,
            component: overlay(),
            state: undefined,
            data: undefined,
            action: UIFragmentAction.Add,
            containerId: undefined,
        })
    } else if (request.target !== 'content' && view.fragment?.component) {
        // no page to open it over, but the content area shows something (a generated screen shown
        // there before has no mateu-component of its own): open the overlay over THAT, not instead
        view.showTransient(withOverlay(view.fragment, overlay()))
    } else {
        view.showTransient(fragment)
    }
    announce(request.title ?? chromeText('chatGeneratedScreen'))
}
