import { Service } from "@application/service.ts";
import { AxiosMateuApiClient } from "../infra/http/AxiosMateuApiClient";
import { httpService } from "@application/HttpService.ts";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import { appData, appState, upstream } from "@domain/state.ts";
import { Notification, NotificationPosition } from "@vaadin/notification";
import { LitElement } from "lit";
import { ComponentState } from "@infra/ui/renderers/types.ts";

export class SSEService implements Service {

    async runAction(mateuApiClient: AxiosMateuApiClient, baseUrl: string, route: string, consumedRoute: string, actionId: string, initiatorComponentId: string, _appState: ComponentState, serverSideType: string, componentState: ComponentState, parameters: Record<string, unknown>, initiator: HTMLElement, background: boolean, callback: ((result?: unknown) => void) | undefined, callbackonly: boolean, callbackToken: string): Promise<void> {
        //throw new Error('oops')
        //console.log(actionId)

        if (!route) {
            return
        }
        if (true || 'server-action' == actionId) {
            // const evtSource = new EventSource("/sse");
            // evtSource.onmessage = (event) => {
            //     console.log('received', event)
            // };
            // evtSource.onerror = (err) => {
            //     console.error("EventSource failed:", err);
            //     evtSource.close();
            // };

            route = route?route:'_no_route'

            if (route && route.startsWith('/')) {
                route = route.substring(1)
            }

            const payload = {
                serverSideType,
                appState: appState.value,
                componentState,
                parameters,
                initiatorComponentId,
                consumedRoute,
                route: '/' + route,
                actionId
            }

            if (!background) {
                initiator.dispatchEvent(new CustomEvent('backend-called-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                    }
                }))
            }
            fetch(baseUrl + '/mateu/v3/sse/' +
                route, {
                method: 'POST',
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).then(async response => {
                const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
                if (reader) {
                    let buffer = ''
                    while (true) {
                        const {value, done} = await reader.read();
                        if (done) break;
                        buffer += value
                        const events = buffer.split('\n\n')
                        buffer = events.pop() ?? ''
                        for (const event of events) {
                            const line = event.trim()
                            if (!line) continue
                            if (line.startsWith('data:')) {
                                const uiIncrement = JSON.parse(line.substring('data:'.length).trim())

                                if (callback) {
                                    callback(uiIncrement)
                                }

                                if (!callbackonly) {
                                    this.handleUIIncrement(uiIncrement, initiator, callbackToken)
                                }

                                if (uiIncrement.messages && uiIncrement.messages.length == 1) {
                                    if (uiIncrement.messages[0].variant == 'error') {
                                        initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-failed', {
                                            detail: {
                                                actionId
                                            },
                                            bubbles: true,
                                            composed: true
                                        }))
                                    }
                                }
                            } else {
                                let message = line;
                                try {
                                    const error = JSON.parse(line);
                                    message = error.message;
                                    if (error._embedded?.errors?.length > 0) {
                                        if (error._embedded.errors[0].message) {
                                            message = error._embedded.errors[0].message
                                        }
                                    }
                                } catch (ignored) {

                                }
                                throw new Error(message)
                            }
                        }
                    }
                }
                if (!background) {
                    initiator.dispatchEvent(new CustomEvent('backend-succeeded-event', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            actionId
                        }
                    }))
                }
                initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-succeeded', {
                    detail: {
                        actionId
                    },
                    bubbles: true,
                    composed: true
                }))
            })
                .catch(reason => {
                initiator.dispatchEvent(new CustomEvent('backend-failed-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        actionId,
                        reason: this.serialize(reason)
                    }
                }))
                    initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-failed', {
                        detail: {
                            actionId
                        },
                        bubbles: true,
                        composed: true
                    }))
            })
//            console.log('response', response)


            //console.log('closed')

        } else {
            await httpService.runAction(mateuApiClient, baseUrl, route, consumedRoute, actionId, initiatorComponentId, appState, serverSideType, componentState, parameters, initiator, background, callback, callbackonly, callbackToken)
        }
    }

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

    mapPosition = (position: string): NotificationPosition => {
        switch(position) {
            case 'topStretch': return 'top-stretch'
            case 'topStart': return 'top-start'
            case 'topCenter': return 'top-center'
            case 'topEnd': return 'top-end'
            case 'middle': return 'middle'
            case 'bottomStart': return 'bottom-start'
            case 'bottomEnd': return 'bottom-end'
            case 'bottomStretch': return 'bottom-stretch'
            case 'bottomCenter': return 'bottom-center'
        }
        return 'bottom-end'
    }

    /**
     * Undoable toast (Message.undoable on the server): text + an Undo button that dispatches the
     * message's undoActionId on the INITIATOR component (which advertises the action), then closes.
     * Built with a custom vaadin-notification renderer since Notification.show is text-only.
     */
    private showUndoableMessage(message: { text: string, position?: string, variant?: string, duration?: number, undoLabel?: string, undoActionId?: string, undoParameters?: Record<string, unknown> }, initiator: HTMLElement) {
        const notification = new Notification()
        notification.position = message.position ? this.mapPosition(message.position) : 'bottom-end'
        notification.duration = message.duration ?? 10000
        if (message.variant) notification.setAttribute('theme', message.variant)
        notification.renderer = (root: HTMLElement) => {
            if (root.firstElementChild) return
            const text = document.createElement('span')
            text.textContent = message.text
            const undo = document.createElement('button')
            undo.textContent = message.undoLabel ?? 'Undo'
            undo.style.cssText = 'margin-left: 0.75rem; background: none; border: 1px solid currentColor;'
                + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
                + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
            undo.addEventListener('click', () => {
                initiator.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: message.undoActionId,
                        parameters: message.undoParameters ?? {}
                    },
                    bubbles: true,
                    composed: true
                }))
                notification.opened = false
            })
            root.append(text, undo)
        }
        document.body.appendChild(notification)
        notification.opened = true
        notification.addEventListener('opened-changed', (e: Event) => {
            if (!(e as CustomEvent).detail.value) notification.remove()
        })
    }

    handleUIIncrement = (uiIncrement: UIIncrement | undefined, initiator: HTMLElement, callbackToken: string) => {
        uiIncrement?.messages?.forEach(message => {
            if (message.undoActionId) {
                // undoable toast: an Undo button dispatching the reverse action on the initiator
                this.showUndoableMessage(message, initiator)
                return
            }
            Notification.show(message.text, {
                position: message.position?this.mapPosition(message.position):'bottom-end',
                theme: message.variant,
                duration: message.duration
            });
        })
        if (uiIncrement?.banners && uiIncrement.banners.length > 0) {
            document.dispatchEvent(new CustomEvent('page-banners-received', {
                detail: { banners: uiIncrement.banners, append: uiIncrement.appendBanners ?? false },
                bubbles: false,
                composed: false
            }))
        }

        uiIncrement?.commands?.forEach(command => {
            upstream.next({
                command,
                fragment: undefined,
                ui: undefined,
                error: undefined,
                callbackToken
            })
        })
        uiIncrement?.fragments?.forEach(fragment => {
            upstream.next({
                command: undefined,
                fragment,
                ui: undefined,
                error: undefined,
                callbackToken
            })
        })
        if (uiIncrement?.appState) {
            appState.value = {...uiIncrement.appState}
            const litElement = initiator as LitElement
            litElement.dispatchEvent(new CustomEvent('app-data-updated', {
                bubbles: true,
                composed: true
            }))
        }
        if (uiIncrement?.appData) {
            const newAppData = uiIncrement?.appData
            appData.value = {...uiIncrement.appData, ...newAppData}
            const litElement = initiator as LitElement
            litElement.dispatchEvent(new CustomEvent('app-data-updated', {
                bubbles: true,
                composed: true
            }))
        }
    }

}

export const sseService = new SSEService()