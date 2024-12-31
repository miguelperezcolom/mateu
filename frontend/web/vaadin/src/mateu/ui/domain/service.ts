import {loadUiCommandHandler} from "./commands/loadUi/LoadUiCommandHandler";
import {upstream} from "./upstream";
import {state} from "./state";
import {MateuApiClient} from "../../shared/apiClients/MateuApiClient";

export class Service {

    async loadUi(mateuApiClient: MateuApiClient, baseUrl: string, journeyTypeId: string | undefined) {
        const changes = await loadUiCommandHandler.handle(mateuApiClient, {
            baseUrl: baseUrl,
            journeyTypeId: journeyTypeId
        })
        upstream.next({...state, ...changes})
    }
}

export const service = new Service()