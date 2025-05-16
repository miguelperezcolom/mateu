import { loadUiCommandHandler } from "@domain/commands/loadUi/LoadUiCommandHandler";
import { AxiosMateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { Subject } from "rxjs";
import MessageWrapper from "@domain/MessageWrapper";

export class Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string, config: any, initiator: HTMLElement, upstream: Subject<MessageWrapper>) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            initiator: initiator,
            contextData: config
        })
        upstream.next({
            message: undefined,
            ui: changes.ui
        })
    }
}

export const service = new Service()