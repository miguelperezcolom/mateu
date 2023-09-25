import {StartJourneyCommand} from "./StartJourneyCommand";
import {nanoid} from "@reduxjs/toolkit";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class StartJourneyCommandHandler {

    public async handle(command: StartJourneyCommand): Promise<void> {
        const journeyId = nanoid()
        await mateuApiClient.createJourney(command.journeyTypeId, journeyId)
        state.baseUrl = command.baseUrl
        state.journey = await mateuApiClient.fetchJourney(command.journeyTypeId, journeyId)
        state.journeyTypeId = command.journeyTypeId
        state.stepId = state.journey.currentStepId
        state.step = await mateuApiClient.fetchStep(command.journeyTypeId, journeyId, state.stepId)
        state.journeyId = journeyId
        state.previousStepId = state.step.previousStepId
    }

}

export const startJourneyCommandHandler = new StartJourneyCommandHandler()