import { loadUiCommandHandler } from "@domain/commands/loadUi/LoadUiCommandHandler";
import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { appState, upstream } from "@domain/state";
import { runActionCommandHandler } from "@domain/commands/runAction/RunActionCommandHandler";
import { RunActionCommand } from "@domain/commands/runAction/RunActionCommand";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export class Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string,
                 path: string | undefined,
                 config: any, initiator: HTMLElement) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            initiator: initiator,
            config,
            path: path
        })
        upstream.next({
            fragment: undefined,
            ui: changes.ui,
            error: undefined
        })
        this.handleUIIncrement(changes.ui.home)
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

    async runAction(mateuApiClient: AxiosMateuApiClient,
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
                    background: boolean) {
        const changes = await runActionCommandHandler.handle(mateuApiClient, {
            baseUrl,
            route: route?route:'_no_route',
            consumedRoute,
            actionId,
            appState,
            initiatorComponentId,
            componentState,
            parameters,
            serverSideType,
            initiator,
            background
        } as RunActionCommand)
        this.handleUIIncrement(changes.uiIncrement)
    }

}

export const service = new Service()