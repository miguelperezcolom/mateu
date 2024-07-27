import {StartJourneyCommand} from "./StartJourneyCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {nanoid} from "nanoid";
import {State} from "../../state";

export class StartJourneyCommandHandler {

    public async handle(command: StartJourneyCommand, state: State): Promise<void> {
        const journeyId = nanoid()
        await mateuApiClient.createJourney(command.uiId, command.journeyTypeId, journeyId)
        state.baseUrl = command.baseUrl
        state.journey = await mateuApiClient.fetchJourney(command.uiId, command.journeyTypeId, journeyId)
        state.uiId = command.uiId
        state.journeyTypeId = command.journeyTypeId
        state.stepId = state.journey.currentStepId
        state.step = await mateuApiClient.fetchStep(command.uiId, command.journeyTypeId, journeyId, state.stepId)
        state.journeyId = journeyId
        state.previousStepId = state.step.previousStepId
    }

}

export const startJourneyCommandHandler = new StartJourneyCommandHandler()