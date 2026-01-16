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
import {UIFragmentAction} from "@mateu/shared/apiClients/dtos/UIFragmentAction.ts";
import {AppVariant} from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((message: Message) => {
            if (message.command) {
                const command = message.command
                if (this.id == command.targetComponentId) {
                    this.applyCommand(command)
                }
            }
            if (message.fragment) {
                const fragment = message.fragment
                if (this.id == fragment.targetComponentId) {
                    this.applyFragment(fragment)
                    this.completeMenu(fragment)
                }
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
                            undefined,
                            option.params,
                            this,
                            true
                        ))
                    Promise.all(requests).then(increments => {
                        app.menu = this.updateMenu(app.menu, increments
                            .map(increment => increment.fragments)
                            .filter(fragment => fragment)
                            .map(fragment => fragment!)
                            .flat())
                        app.variant = AppVariant.MENU_ON_TOP
                        upstream.next({
                            fragment: {
                                component: clientSideComponent,
                                data: undefined,
                                state: undefined,
                                action: UIFragmentAction.Replace,
                                targetComponentId: this.id
                            } as UIFragment
                        } as Message)
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
                            const effectiveAppServerSideType = option.appServerSideType && !('' == option.appServerSideType)?option.appServerSideType:app.appServerSideType
                            this.changeBaseUrl(app.menu, option.baseUrl, effectiveAppServerSideType, option.destination.route)
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

    private changeBaseUrl(menu: MenuOption[], baseUrl: string, appServerSideType: string | undefined, uriPrefix: string | undefined): void {
        menu.forEach(option => {
            if (!option.baseUrl) {
                if (option.submenus && option.submenus.length > 0) {
                    this.changeBaseUrl(option.submenus, baseUrl, appServerSideType, uriPrefix)
                } else {
                    option.baseUrl = baseUrl
                    option.appServerSideType = appServerSideType
                    option.destination.baseUrl = baseUrl
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
        }
        if ('SetFavicon' == command.type) {
            this.changeFavicon(command.data as string)
        }
        if ('NavigateTo' == command.type) {
            const destination = command.data as string
            if (destination) {
                if (destination.startsWith('http:') || destination.startsWith('https:')) {
                    window.location.href = command.data as string
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
            if (destination) {
                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: {
                        route: destination
                    },
                    bubbles: true,
                    composed: true
                }))
                this.dispatchEvent(new CustomEvent('history-pushed', {
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
            }
            if (data && data.actionId) {
                this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: data.actionId
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }

        if ('CloseModal' == command.type) {
            this.closeModal()
        }
        if ('AddContentToHead' == command.type) {
            const data = command.data as Element
            if (data && data.name) {
                if (data.attributes && data.attributes['id']) {
                    if (document.getElementById(data.attributes['id'])) {
                        console.log('already there', data)
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
                        console.log('already there', data)
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
                console.log('adding listener to ', data.on)
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

    closeModal = () => {
        const dialogs = this.shadowRoot?.querySelectorAll('mateu-dialog')
        if (dialogs && dialogs.length > 0) {
            dialogs[dialogs.length - 1].close()
        }
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