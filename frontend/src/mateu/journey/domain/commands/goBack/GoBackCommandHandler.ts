import {GoBackCommand} from "./GoBackCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class GoBackCommandHandler {

    public async handle(_command: GoBackCommand): Promise<void> {
        state.step = await mateuApiClient
            .fetchStep(state.journeyTypeId!, state.journeyId!, state.previousStepId!)
        state.previousStepId = state.step.previousStepId
    }

}

export const goBackCommandHandler = new GoBackCommandHandler()