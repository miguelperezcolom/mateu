import {loadUiCommandHandler} from "../domain/commands/loadUi/LoadUiCommandHandler";
import {upstream} from "../domain/upstream";
import {state} from "../domain/state";
import {AxiosMateuApiClient} from "../infra/http/AxiosMateuApiClient";

export class Service {

    async loadUi(mateuApiClient: AxiosMateuApiClient, baseUrl: string, journeyTypeId: string | undefined) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            journeyTypeId: journeyTypeId
        })
        upstream.next({...state, ...changes})
    }
}

export const service = new Service()