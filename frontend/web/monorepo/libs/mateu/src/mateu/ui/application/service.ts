import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { httpService } from "@application/HttpService.ts";

export interface Service {

    runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string,
                    route: string,
                    consumedRoute: string,
                    actionId: string,
                    initiatorComponentId: string,
                    appState: any,
                    serverSideType: string,
                    appServerSideType: string,
                    componentState: any,
                    parameters: any,
                    initiator: HTMLElement,
                    background: boolean,
    callback: any): void

}

export const service: Service = httpService