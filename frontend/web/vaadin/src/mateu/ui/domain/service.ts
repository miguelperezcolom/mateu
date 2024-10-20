import {loadUiCommandHandler} from "./commands/loadUi/LoadUiCommandHandler";
import {upstream} from "./upstream";
import {state} from "./state";

export class Service {

    async loadUi(baseUrl: string, uiId: string, journeyTypeId: string | undefined) {
        const changes = await loadUiCommandHandler.handle({
            uiId: uiId,
            baseUrl: baseUrl,
            journeyTypeId: journeyTypeId
        })
        upstream.next({...state, ...changes})
    }
}

export const service = new Service()