import {GoBackCommand} from "./GoBackCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {State} from "../../state";

export class GoBackCommandHandler {

    public async handle(_command: GoBackCommand, state: State): Promise<void> {
        state.step = await mateuApiClient
            .fetchStep(state.journeyTypeId!, state.journeyId!, state.previousStepId!)
        state.previousStepId = state.step.previousStepId
    }

}

export const goBackCommandHandler = new GoBackCommandHandler()