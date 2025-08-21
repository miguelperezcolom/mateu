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

            console.log('route', route)
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

            const response = await fetch(baseUrl + '/mateu/v3/' +
                route + (actionId?'/' + actionId:''), {
                method: 'POST',
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
//            console.log('response', response)
            const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
//            console.log('entering loop')
            if (reader) {
                while (true) {
                    const {value, done} = await reader.read();
                    if (done) break;
                    //console.log('Received', value);
                    const increment = JSON.parse(value.substring('data:'.length));
                    //console.log('Received', increment);
                    this.handleUIIncrement(increment)
                }
            }
            //console.log('closed')

        } else {
            await httpService.runAction(mateuApiClient, baseUrl, route, consumedRoute, actionId, initiatorComponentId, appState, serverSideType, componentState, parameters, initiator, background)
        }
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