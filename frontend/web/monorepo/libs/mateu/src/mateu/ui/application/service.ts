import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { httpService } from "@application/HttpService.ts";
import { ComponentState } from "@infra/ui/renderers/types.ts";

export interface Service {

    runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    appState: ComponentState,
                    serverSideType: string,
                    componentState: ComponentState,
                    parameters: Record<string, unknown>,
                    initiator: HTMLElement,
                    background: boolean,
    callback: ((result?: unknown) => void) | undefined, callbackonly: boolean, callbackToken: string): void

}

export const service: Service = httpService