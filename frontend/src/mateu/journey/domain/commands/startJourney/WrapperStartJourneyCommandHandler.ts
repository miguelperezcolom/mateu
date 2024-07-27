import {StartJourneyCommand} from "./StartJourneyCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {nanoid} from "nanoid";
import {State} from "../../state";

export class WrapperStartJourneyCommandHandler {

    public async handle(command: StartJourneyCommand, state: State): Promise<void> {
        const journeyId = nanoid()
        const stepWrapper = await mateuApiClient.createJourneyAndReturn(command.uiId, command.journeyTypeId, journeyId)
        sessionStorage.setItem(journeyId, JSON.stringify(stepWrapper.store))
        state.baseUrl = command.baseUrl
        state.journey = stepWrapper.journey
        state.uiId = command.uiId
        state.journeyTypeId = command.journeyTypeId
        state.stepId = state.journey.currentStepId
        state.step = stepWrapper.step
        state.journeyId = journeyId
        state.previousStepId = state.step.previousStepId
    }

}

export const wrapperStartJourneyCommandHandler = new WrapperStartJourneyCommandHandler()