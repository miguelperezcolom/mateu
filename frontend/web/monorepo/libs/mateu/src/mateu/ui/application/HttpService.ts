import {AxiosMateuApiClient} from "@infra/http/AxiosMateuApiClient";
import {appData, appState, upstream} from "@domain/state";
import {runActionCommandHandler} from "@domain/commands/runAction/RunActionCommandHandler";
import {RunActionCommand} from "@domain/commands/runAction/RunActionCommand";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import {Service} from "@application/service.ts";
import {notify} from "@application/Notifier.ts";
import {LitElement} from "lit";
import {nanoid} from "nanoid";
import {ComponentState} from "@infra/ui/renderers/types.ts";

export class HttpService implements Service {

    handleUIIncrement = (uiIncrement: UIIncrement | undefined, initiator: HTMLElement, callbackToken: string) => {


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
        uiIncrement?.messages?.forEach(message => {
            notify({
                text: message.text,
                position: message.position,
                variant: message.variant,
                duration: message.duration,
                undoLabel: message.undoLabel,
                undoActionId: message.undoActionId,
                undoParameters: message.undoParameters,
            }, initiator)
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
    }

    async runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    _appState: ComponentState,
                    serverSideType: string,
                    componentState: ComponentState,
                    parameters: Record<string, unknown>,
                    initiator: HTMLElement,
                    background: boolean,
    callback: ((result?: unknown) => void) | undefined, callbackonly: boolean, callbackToken: string) {
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

            initiator.shadowRoot?.dispatchEvent(new CustomEvent('backend-call-succeeded', {
                detail: {
                    actionId,
                    evevntId: nanoid()
                },
                bubbles: true,
                composed: true
            }))

        } catch(reason) {
            console.warn('Action request failed', reason)
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

    private serialize(reason: unknown) {
        if ((reason as Error)?.message) {
            return reason
        }
        return JSON.stringify(reason)
    }

}

export const httpService = new HttpService()