import {loadUiCommandHandler} from "./commands/loadUi/LoadUiCommandHandler";
import {createJourneyCommandHandler} from "./commands/createJourney/CreateJourneyCommandHandler";
import {upstream} from "./upstream";
import {state} from "./state";

export class Service {

    async loadUi(baseUrl: string, uiId: string, journeyTypeId: string | undefined) {
        await loadUiCommandHandler.handle({
            uiId: uiId,
            baseUrl: baseUrl,
            journeyTypeId: journeyTypeId
        })
        upstream.next({...state})
    }

    async createJourney(journeyTypeId: string, label: string) {
        await createJourneyCommandHandler.handle({
            journeyTypeId, label
        })
        upstream.next({...state})
    }
}

export const service = new Service()