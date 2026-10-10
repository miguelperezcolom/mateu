import {Subscription} from "rxjs";
import {upstream} from "@domain/state";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import {LitElement} from "lit";
import {property} from "lit/decorators.js";
import Message from "@domain/Message";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element.ts";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {
    isActiveFor,
    mergeRemoteMenus,
    RemoteAnswer,
    RemoteApp,
    remoteMounts,
    withoutHidden,
    withPrefixesFromHome,
} from "@infra/ui/navTree.ts";
import { registerRemoteMenuRetry } from "@infra/ui/remoteMenuRetry.ts";
import { announce } from "@infra/a11y/announcer.ts";
import { fragmentIsCurrent } from "@infra/ui/callbackTokenGuard.ts";
import { safeNavigate } from '@infra/ui/safeNavigate.ts'
import { ConnectionScope } from '@infra/ui/connectionScope.ts'

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''

    callbackToken = ''

    private upstreamSubscription: Subscription | undefined;

    /**
     * Listeners that must die with this component (document-level ones, and those on elements it
     * appends to <head>/<body>, which outlive it): register them with `{ signal: this.connection.signal }`.
     */
    protected connection = new ConnectionScope()

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((message: Message) => {
            let applies = false;
            if (message.command) {
                const command = message.command
                if (this.id == command.targetComponentId) {
                    applies = true
                    this.applyCommand(command)
                }
            }
            if (fragmentIsCurrent(this, message)) {
                if (message.fragment) {
                    const fragment = message.fragment
                    if (this.id == fragment.targetComponentId) {
                        applies = true
                        this.applyFragment(fragment)
                        this.completeMenu(fragment)
                    }
                }
            }
            if (applies) {
                //this.callbackToken = nanoid()
            }
        })
    }

    /**
     * Fills in the shell's remote sections: asks each remote for its menu and merges the answers
     * into the app's (navTree.mergeRemoteMenus). What it keeps to:
     *
     * <ul>
     *     <li><b>One remote down is one section down.</b> The remotes are asked together and each
     *     answer is taken on its own (allSettled): one that fails leaves its section disabled with a
     *     hint, the rest are merged, and it is asked again in the background.</li>
     *     <li><b>The shell knows where the user is before anyone answers.</b> Each remote section
     *     carries the prefix its screens live under (and a deep link says which remote it was
     *     mounted from), so the active section and the first breadcrumb are there on the first
     *     frame.</li>
     *     <li><b>Hidden sections stay in the tree</b> (`navMenu`), not drawn: a page under one still
     *     gets its breadcrumbs. A hidden remote is asked only when the user is in it.</li>
     *     <li><b>The variant is the app's.</b> This used to force MENU_ON_TOP on any shell with
     *     remotes; the server's AUTO now picks that, and a declared variant is respected.</li>
     * </ul>
     */
    private completeMenu(fragment: UIFragment) {
        if (fragment.component && fragment.component.type == ComponentType.ClientSide) {
            const clientSideComponent = fragment.component as ClientSideComponent
            const metadata = clientSideComponent.metadata
            if (metadata?.type == ComponentMetadataType.App) {
                // A new app replaces the old one's menu: its pending retries are moot.
                this.pendingMenuRetries?.forEach(cancel => cancel())
                this.pendingMenuRetries = new Set()
                const app = metadata as App
                const here = typeof window !== 'undefined' ? window.location.pathname : ''
                // What a deep link already says: which remote the page was mounted from.
                const source = withPrefixesFromHome(app.menu ?? [], app.homeBaseUrl, here)
                // Options that travel but are not drawn go before anything renders the menu:
                // synchronously, while the fragment just applied is still waiting for its update.
                const drawn = withoutHidden(source)
                if (drawn !== app.menu || source !== app.menu) {
                    clientSideComponent.metadata = { ...app, menu: drawn, navMenu: source } as App
                }
                const mounts = remoteMounts(source).filter(option =>
                    option.visible !== false
                    || isActiveFor(option, here)
                    || (!!app.homeBaseUrl && option.baseUrl === app.homeBaseUrl))
                if (mounts.length > 0) {
                    this.askRemotes(clientSideComponent, source, mounts, new Map(), 0)
                }
            }
        }
    }

    /** How to call off the retries this element has pending (see askRemotes). */
    private pendingMenuRetries?: Set<() => void>

    /** How long a remote has to answer with its menu before its section is shown unavailable. */
    static remoteMenuTimeoutMillis = 20_000

    /** Back-off for asking again the remotes that did not answer; after it, only a click asks. */
    static remoteRetryDelays = [10_000, 30_000, 60_000]

    private askRemotes(clientSideComponent: ClientSideComponent, source: MenuOption[], mounts: MenuOption[],
                       answers: Map<MenuOption, RemoteAnswer>, attempt: number) {
        // Each answer is merged as it arrives: a slow remote does not hold back the others, and a
        // failed one only marks its own section. allSettled, then, only to know when all are in.
        const failed: MenuOption[] = []
        const merge = () => {
            // HAMBURGER_SECTIONS: each remote mounted at the top is one section (navTree.mergeRemoteMenus)
            const sections = (clientSideComponent.metadata as App).variant === AppVariant.HAMBURGER_SECTIONS
            const navMenu = mergeRemoteMenus(source, answers, undefined, { sections })
            // A NEW metadata object, and nothing else touched.
            //
            // This used to publish the app component back upstream as a Replace targeting this
            // element. applyFragment answers a ClientSide component by setting
            // `this.component.children = [component]` — so updating the MENU threw away everything
            // the router had mounted underneath and built it again. Measured on a cold load of
            // /workflow/definitions behind a shell with six remote menus: the page's three-request
            // chain (route → page → listing search) ran three times over, the last two for
            // nothing. That is the flicker.
            //
            // The menu is read from this object at render time, so replacing the reference is what
            // makes Lit notice; mutating in place would leave the child holding an unchanged
            // reference and repaint nothing. The variant is left as it came.
            const app = clientSideComponent.metadata as App
            clientSideComponent.metadata = { ...app, menu: withoutHidden(navMenu), navMenu } as App
            this.requestUpdate()
        }
        Promise.allSettled(mounts.map(option => mateuApiClient.runAction(
            option.baseUrl,
            option.route,
            '_empty',
            '',
            option.baseUrl + '#' + option.route,
            undefined,
            undefined,
            undefined,
            option.params,
            this,
            true,
            // its failure is this section's, not the app's: no toast, no "no connection"
            { quiet: true, timeoutMillis: ConnectedElement.remoteMenuTimeoutMillis }
        ).then(increment => {
            const remoteApp = this.remoteAppOf(increment?.fragments, option)
            if (!remoteApp) throw new Error('no app in the answer of ' + option.baseUrl)
            answers.set(option, { app: remoteApp })
            merge()
        }).catch(() => {
            answers.set(option, { failed: true })
            failed.push(option)
            merge()
        }))).then(() => {
            if (failed.length > 0) {
                // Asked again on a timer while the back-off lasts, and whenever the user clicks
                // an unavailable section (retryUnavailableMenus) — whichever comes first.
                const delay = ConnectedElement.remoteRetryDelays[attempt]
                let timer: ReturnType<typeof setTimeout> | undefined
                const cancel = () => {
                    if (timer !== undefined) clearTimeout(timer)
                    unregister()
                    this.pendingMenuRetries?.delete(cancel)
                }
                const retry = () => {
                    cancel()
                    if (!this.isConnected) return
                    this.askRemotes(clientSideComponent, source, failed, answers,
                        Math.min(attempt + 1, ConnectedElement.remoteRetryDelays.length))
                }
                const unregister = registerRemoteMenuRetry(retry)
                this.pendingMenuRetries?.add(cancel)
                if (delay !== undefined) timer = setTimeout(retry, delay)
            }
        })
    }

    /** The menu a remote answered with, or undefined when the answer holds no app. */
    private remoteAppOf(fragments: UIFragment[] | undefined, option: MenuOption): RemoteApp | undefined {
        const fragment = (fragments ?? []).find(f => f?.targetComponentId == option.baseUrl + '#' + option.route)
        if (fragment?.component?.type == ComponentType.ClientSide) {
            const metadata = (fragment.component as ClientSideComponent).metadata
            if (metadata?.type == ComponentMetadataType.App) {
                const app = metadata as App
                return { menu: app.menu ?? [], route: app.route, serverSideType: app.serverSideType }
            }
        }
        return undefined
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
        this.connection.abort()
    }

    abstract applyFragment(fragment: UIFragment):void

    abstract manageActionRequestedEvent(event: CustomEvent):void

    applyCommand(command: UICommand) {

        if ('SetWindowTitle' == command.type) {
            document.title = command.data as string
            // A single-page app changes what is on screen without changing the page, so a screen
            // reader has nothing to announce and the user is told nothing about where they landed.
            // The backend sends this command on every route load, which makes it the one reliable
            // "navigation happened, and here is its name" signal available to every renderer.
            announce(document.title)
        }
        if ('Announce' == command.type) {
            // the backend's announcement (the Redwood `announcement` slot): what just happened,
            // for a screen-reader user, when nothing on screen takes focus. Draws nothing.
            const data = command.data as { text?: string, assertive?: boolean } | undefined
            if (data?.text) announce(data.text, { politeness: data.assertive ? 'assertive' : 'polite' })
        }
        if ('SetFavicon' == command.type) {
            this.changeFavicon(command.data as string)
        }
        if ('DispatchEvent' == command.type) {
            this.dispatchNamedEvent(command.data as {
                eventName: string
                payload?: unknown
                detail?: unknown
            })
        }
        if ('NavigateTo' == command.type) {
            const destination = command.data as string
            // server-sent: only http(s)/relative, same-origin here, cross-origin in a new tab
            if (destination) safeNavigate(destination)
        }
        if ('PushStateToHistory' == command.type) {
            const destination = command.data as string
            if (destination !== undefined) {
                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: {
                        route: destination
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
        if ('RunAction' == command.type) {
            const data = command.data as {
                actionId: string
                targetComponentId: string
            }
            if (data && data.actionId) {
                if (data.targetComponentId) {
                    const msg = {
                        command: {
                            type: 'RunAction',
                            data: {
                                actionId: data.actionId
                            },
                            targetComponentId: data.targetComponentId
                        },
                        fragment: undefined,
                        ui: undefined,
                        error: undefined,
                        callbackToken: ''
                    }
                    setTimeout(() => upstream.next(msg))
                } else {
                    this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: data.actionId,
                            parameters: {}
                        },
                        bubbles: true,
                        composed: true
                    }))
                }

            }
        }

        if ('MarkAsDirty' == command.type) {
            this.dispatchEvent(new CustomEvent('dirty', {
                detail: {},
                bubbles: true,
                composed: true
            }))
        }
        if ('MarkAsClean' == command.type) {
            this.dispatchEvent(new CustomEvent('clean', {
                detail: {},
                bubbles: true,
                composed: true
            }))
        }


        if ('DownloadFile' == command.type) {
            const data = command.data as {
                filename: string
                mimeType: string
                base64Content: string
            }
            if (data && data.base64Content) {
                const binaryStr = atob(data.base64Content)
                const bytes = new Uint8Array(binaryStr.length)
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i)
                }
                const blob = new Blob([bytes], { type: data.mimeType })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = data.filename ?? 'export'
                a.click()
                URL.revokeObjectURL(url)
            }
        }
        if ('CloseModal' == command.type) {
            this.closeModal()
            // closeModal(eventName[, payload]) also emits the named event, so the host page can
            // react via @SubscribeTo — refresh itself or receive the overlay's result.
            this.dispatchNamedEvent(command.data as { eventName: string, payload?: unknown, detail?: unknown })
        }
        if ('AddContentToHead' == command.type) {
            const data = command.data as Element
            if (data && data.name) {
                if (data.attributes && data.attributes['id']) {
                    if (document.getElementById(data.attributes['id'])) {
                        return
                    }
                }
                document.head.appendChild(this.createElement(command))
            }
        }
        if ('AddContentToBody' == command.type) {
            const data = command.data as Element
            if (data && data.name) {
                if (data.attributes && data.attributes['id']) {
                    if (document.getElementById(data.attributes['id'])) {
                        return
                    }
                }
                document.body.appendChild(this.createElement(command))
            }
        }
    }

    createElement = (command: UICommand): HTMLElement => {
        const data = command.data as Element
            const element = document.createElement(data.name);
            for (let k in data.attributes) {
                element.setAttribute(k, data.attributes[k])
            }
            for (let k in data.on) {
                // the element outlives this component (it is appended to <head>/<body>): the
                // listener must not keep calling back into a disconnected component
                element.addEventListener(k, (e: Event) => {
                    this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: data.on[k],
                            parameters: {
                                event: e
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }, { signal: this.connection.signal })
        }
            return element
    }

    // Shared by DispatchEvent and CloseModal(eventName): emit a named DOM custom event.
    // Stamps the emitting component's logical source name so that COMPONENT-scoped
    // subscribers (@SubscribeTo(source = COMPONENT, from = ...)) can filter by origin.
    // Falls back to the server-side type when @Emits(name=...) is not set. Only added to
    // object payloads, so legacy events with null/primitive detail keep their exact shape.
    private dispatchNamedEvent(data: { eventName: string, payload?: unknown, detail?: unknown } | undefined) {
        if (data && data.eventName) {
            const emitter = (this as any).component as
                { emitsName?: string, serverSideType?: string } | undefined
            const source = emitter?.emitsName ?? emitter?.serverSideType
            let detail = data.payload ?? data.detail
            if (source && detail && typeof detail === 'object') {
                detail = { ...detail as object, __source: source }
            }
            this.dispatchEvent(new CustomEvent(data.eventName, {
                detail,
                bubbles: true,
                composed: true
            }))
        }
    }

    closeModal = () => {
        // Overlays (dialogs and drawers) are appended to the initiator's render root in opening
        // order, so the last one in DOM order is the top of the stack. On shells that render to
        // light DOM (no shadow root) the overlay is a plain descendant, so
        // fall back to querying the element itself.
        const overlays = (this.shadowRoot ?? this).querySelectorAll('mateu-dialog, mateu-drawer')
        if (overlays && overlays.length > 0) {
            // close() also splices the overlay's component out of the owner's declarative
            // children (by identity — see ComponentElement.removeSelfFromOwnerChildren), so a
            // later re-render doesn't resurrect a closed husk that would block the page and
            // swallow the next Add with the same overlay id.
            (overlays[overlays.length - 1] as unknown as { close: () => void }).close()
            return
        }
        // No overlay lives in our own shadow root: we are a component embedded INSIDE the
        // overlay (e.g. a selectable grid returned as the dialog content). Bubble a close
        // request up — the mateu-event-interceptor that wraps the overlay content forwards
        // it to the overlay owner, whose closeModal() does find the overlay and closes it.
        this.dispatchEvent(new CustomEvent('close-modal-requested', { bubbles: true, composed: true }))
    }

    changeFavicon = (link: string) => {
        let $favicon = document.querySelector('link[rel="icon"]')
        // If a <link rel="icon"> element already exists,
        // change its href to the given link.
        if ($favicon !== null) {
            $favicon.setAttribute('href', link)
            // Otherwise, create a new element and append it to <head>.
        } else {
            $favicon = document.createElement("link")
            $favicon.setAttribute('rel', 'icon')
            $favicon.setAttribute('href', link)
            document.head.appendChild($favicon)
        }
    }

}