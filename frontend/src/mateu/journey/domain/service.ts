import {upstream} from "./upstream";
import {state} from "./state";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import {getJourneyQueryHandler} from "./queries/getJourney/GetJourneyQueryHandler";
import {getStepQueryHandler} from "./queries/getStep/GetStepQueryHandler";
import {goBackCommandHandler} from "./commands/goBack/GoBackCommandHandler";
import {goToIndexCommandHandler} from "./commands/goToIndex/GoToIndexCommandHandler";

export class Service {

    async startJourney(baseUrl: string, journeyTypeId: string) {
        console.log('start journey', baseUrl, journeyTypeId)
        await startJourneyCommandHandler.handle({baseUrl, journeyTypeId})
        upstream.next({...state})
    }

    async runAction(actionId: string, data: unknown) {
        await callActionCommandHandler.handle({actionId, data})
        await this.reloadJourney()
        upstream.next({...state})
    }

    private async reloadJourney() {
        state.journey = await getJourneyQueryHandler.handle({})
        state.stepId = state.journey.currentStepId
        state.step = await getStepQueryHandler.handle({stepId: state.stepId})
        state.previousStepId = state.step.previousStepId
    }

    async goBack() {
        await goBackCommandHandler.handle({})
        await this.reloadJourney()
        upstream.next({...state})
    }

    async goToIndex(data: { __listId: string; __index: number; __count: number }) {
        await goToIndexCommandHandler.handle(data)
        await this.reloadJourney()
        upstream.next({...state})
    }

}

export const service = new Service()