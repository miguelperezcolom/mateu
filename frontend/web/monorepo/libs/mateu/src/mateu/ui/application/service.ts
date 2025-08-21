import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { sseService } from "@application/SSEService.ts";

export interface Service {

    loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string,
                 path: string | undefined,
                 config: any, initiator: HTMLElement): void

    runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    appState: any,
                    serverSideType: string,
                    componentState: any,
                    parameters: any,
                    initiator: HTMLElement,
                    background: boolean): void

}

export const service: Service = sseService