import { Service } from "@application/service.ts";
import { AxiosMateuApiClient } from "../infra/http/AxiosMateuApiClient";
import { httpService } from "@application/HttpService.ts";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import { appState, upstream } from "@domain/state.ts";

export class SSEService implements Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string, path: string | undefined, config: any, initiator: HTMLElement): Promise<void> {
        await httpService.loadUi(mateuApiClient, baseUrl, path, config, initiator)
    }

    async runAction(mateuApiClient: AxiosMateuApiClient, baseUrl: string, route: string, consumedRoute: string, actionId: string, initiatorComponentId: string, appState: any, serverSideType: string, componentState: any, parameters: any, initiator: HTMLElement, background: boolean): Promise<void> {
        //throw new Error('oops')
        //console.log(actionId)
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
                appState,
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
            fetch(baseUrl + '/mateu/v3/' +
                route + (actionId?'/' + actionId:''), {
                method: 'POST',
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).then(async response => {
                const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
                if (reader) {
                    while (true) {
                        const {value, done} = await reader.read();
                        if (done) break;
                        if (value.startsWith('data:')) {
                            const increment = JSON.parse(value.substring('data:'.length));
                            this.handleUIIncrement(increment)
                        } else {
                            let message = value;
                            try {
                                const error = JSON.parse(value);
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
            await httpService.runAction(mateuApiClient, baseUrl, route, consumedRoute, actionId, initiatorComponentId, appState, serverSideType, componentState, parameters, initiator, background)
        }
    }

    private serialize(reason: any) {
        if (reason.message) {
            return reason
        }
        return JSON.stringify(reason)
    }
    handleUIIncrement = (uiIncrement: UIIncrement | undefined) => {
        uiIncrement?.fragments?.forEach(fragment => {
            upstream.next({
                fragment,
                ui: undefined,
                error: undefined
            })
        })
        if (uiIncrement?.appState) {
            appState.value = uiIncrement.appState
        }
    }

}

export const sseService = new SSEService()