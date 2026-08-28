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
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {AppVariant} from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { announce } from "@infra/a11y/announcer.ts";

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''

    callbackToken = ''

    private upstreamSubscription: Subscription | undefined;

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
            if (!message.callbackToken || !this.callbackToken || message.callbackToken === this.callbackToken) {
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

    private completeMenu(fragment: UIFragment) {
        if (fragment.component && fragment.component.type == ComponentType.ClientSide) {
            const clientSideComponent = fragment.component as ClientSideComponent
            const metadata = clientSideComponent.metadata
            if (metadata?.type == ComponentMetadataType.App) {
                const app = metadata as App
                const remoteMenus = this.getRemoteMenus(app.menu)
                if (remoteMenus.length > 0) {
                    const requests = remoteMenus
                        .map(option => mateuApiClient.runAction(
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
                            true
                        ))
                    Promise.all(requests).then(increments => {
                        const menu = this.updateMenu(app.menu, increments
                            .map(increment => increment.fragments)
                            .filter(fragment => fragment)
                            .map(fragment => fragment!)
                            .flat())
                        // A NEW metadata object, and nothing else touched.
                        //
                        // This used to publish the app component back upstream as a Replace
                        // targeting this element. applyFragment answers a ClientSide component by
                        // setting `this.component.children = [component]` — so updating the MENU
                        // threw away everything the router had mounted underneath and built it
                        // again. Measured on a cold load of /workflow/definitions behind a shell
                        // with six remote menus: the page's three-request chain (route → page →
                        // listing search) ran three times over, the last two for nothing. That is
                        // the flicker.
                        //
                        // The menu is read from this object at render time, so replacing the
                        // reference is what makes Lit notice; mutating in place would leave the
                        // child holding an unchanged reference and repaint nothing.
                        clientSideComponent.metadata = {
                            ...app,
                            menu,
                            variant: AppVariant.MENU_ON_TOP
                        } as App
                        this.requestUpdate()
                    })
                }
            }
        }
    }

    private updateMenu(menu: MenuOption[], increments: UIFragment[]) {
        const replaced: MenuOption[] = []
        menu.forEach(option => {
            if (option.remote) {
                const replacement = increments.find(increment => increment.targetComponentId == option.baseUrl + '#' + option.route)
                if (replacement) {
                    if (replacement.component?.type == ComponentType.ClientSide) {
                        const clientSideComponent = replacement.component as ClientSideComponent
                        if (clientSideComponent.metadata?.type == ComponentMetadataType.App) {
                            const app = clientSideComponent.metadata as App
                            const effectiveAppServerSideType = option.serverSideType && !('' == option.serverSideType)?option.serverSideType:app.serverSideType
                            this.changeBaseUrl(app.menu, option.baseUrl, effectiveAppServerSideType, option.route, app.route)
                            replaced.push(...app.menu)
                        }
                    }
                }
            } else {
                replaced.push(option)
            }
        })
        return replaced
    }

    private changeBaseUrl(menu: MenuOption[], baseUrl: string, serverSideType: string | undefined, uriPrefix: string | undefined, consumedRoute: string | undefined): void {
        menu.forEach(option => {
            if (!option.baseUrl) {
                if (option.submenus && option.submenus.length > 0) {
                    this.changeBaseUrl(option.submenus, baseUrl, serverSideType, uriPrefix, consumedRoute)
                } else {
                    option.consumedRoute = consumedRoute??''
                    option.baseUrl = baseUrl
                    option.serverSideType = serverSideType
                    option.uriPrefix = uriPrefix
                }
            }
        })
    }

    private getRemoteMenus(menu: MenuOption[]): MenuOption[] {
        const remotes: MenuOption[] = []
        menu.forEach(option => {
            if (option.remote) {
                remotes.push(option)
            }
        })
        return remotes
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
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
            if (destination) {
                if (true) {
                    if (destination.startsWith('http:') || destination.startsWith('https:')) {
                        window.open(command.data as string, '_blank');
                    } else {
                        window.location.href = command.data as string
                    }
                } else {
                    this.dispatchEvent(new CustomEvent('navigate-to-requested', {
                        detail: {
                            route: destination
                        },
                        bubbles: true,
                        composed: true
                    }))
                }
            }
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
                })
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
        // light DOM (no shadow root — e.g. redwood-oj) the overlay is a plain descendant, so
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