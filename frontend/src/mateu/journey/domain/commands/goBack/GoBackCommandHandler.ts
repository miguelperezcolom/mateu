import {GoBackCommand} from "./GoBackCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {State} from "../../state";
import StepWrapper from "../../../../shared/apiClients/dtos/StepWrapper";

export class GoBackCommandHandler {

    public async handle(_command: GoBackCommand, state: State): Promise<StepWrapper> {
        return await mateuApiClient
            .runStepActionAndReturn(
                state.journeyTypeId!,
                state.journeyId!,
                state.previousStepId!,
                'xxxbacktostep',
                {
                    journey: JSON.parse(sessionStorage.getItem(state.journeyId!)!)
                })
    }

}

export const goBackCommandHandler = new GoBackCommandHandler()