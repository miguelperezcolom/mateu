import { loadUiCommandHandler } from "@domain/commands/loadUi/LoadUiCommandHandler";
import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { upstream } from "@domain/state";
import { runActionCommandHandler } from "@domain/commands/runAction/RunActionCommandHandler";
import { RunActionCommand } from "@domain/commands/runAction/RunActionCommand";

export class Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string,
                 config: any, initiator: HTMLElement) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            initiator: initiator,
            contextData: config
        })
        upstream.next({
            fragment: undefined,
            ui: changes.ui,
            error: undefined
        })
    }

    async runAction(mateuApiClient: AxiosMateuApiClient,
                    baseUrl: string, route: string,
                    actionId: string, initiatorComponentId: string,
                    config: any, serverSideType: string,
                    userData: any, initiator: HTMLElement) {
        const changes = await runActionCommandHandler.handle(mateuApiClient, {
            baseUrl,
            journeyTypeId: route,
            actionId,
            config,
            initiatorComponentId,
            userData,
            serverSideType,
            initiator
        } as RunActionCommand)
        changes.uiIncrement.fragments?.forEach(fragment => {
            upstream.next({
                fragment,
                ui: undefined,
                error: undefined
            })
        })
    }

}

export const service = new Service()