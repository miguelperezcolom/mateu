import {AxiosMateuApiClient} from "@infra/http/AxiosMateuApiClient";
import {appData, appState, upstream} from "@domain/state";
import {runActionCommandHandler} from "@domain/commands/runAction/RunActionCommandHandler";
import {RunActionCommand} from "@domain/commands/runAction/RunActionCommand";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import {Service} from "@application/service.ts";
import {Notification, NotificationPosition} from '@vaadin/notification';
import {LitElement} from "lit";

export class HttpService implements Service {

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

    handleUIIncrement = (uiIncrement: UIIncrement | undefined, initiator: HTMLElement) => {
        uiIncrement?.messages?.forEach(message => {
            Notification.show(message.text, {
                position: message.position?this.mapPosition(message.position):undefined,
                theme: message.variant,
                duration: message.duration
            });
        })
        uiIncrement?.commands?.forEach(command => {
            upstream.next({
                command,
                fragment: undefined,
                ui: undefined,
                error: undefined
            })
        })
        uiIncrement?.fragments?.forEach(fragment => {
            upstream.next({
                command: undefined,
                fragment,
                ui: undefined,
                error: undefined
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

    async runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    _appState: any,
                    serverSideType: string,
                    componentState: any,
                    parameters: any,
                    initiator: HTMLElement,
                    background: boolean,
    callback: any) {
        if (false && !route) {
            return
        }
        try {
            const uiIncrement = await runActionCommandHandler.handle(mateuApiClient, {
                baseUrl,
                route,
                consumedRoute,
                actionId,
                appState: appState.value,
                initiatorComponentId,
                componentState,
                parameters,
                serverSideType,
                initiator,
                background
            } as RunActionCommand)
            this.handleUIIncrement(uiIncrement, initiator)
            if (callback) {
                callback()
            }
            initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-succeeded', {
                detail: {
                    actionId
                },
                bubbles: true,
                composed: true
            }))

        } catch(reason) {
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
            }
    }

    private serialize(reason: any) {
        if (reason.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

}

export const httpService = new HttpService()