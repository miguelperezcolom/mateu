import {loadUiCommandHandler} from "../domain/commands/loadUi/LoadUiCommandHandler";
import { State, state } from "../domain/state";
import {AxiosMateuApiClient} from "../infra/http/AxiosMateuApiClient";
import { Subject } from "rxjs";

export class Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string, config: any, initiator: HTMLElement, upstream: Subject<State>) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            initiator: initiator,
            contextData: config
        })
        upstream.next({...state, ...changes, ...config})
    }
}

export const service = new Service()