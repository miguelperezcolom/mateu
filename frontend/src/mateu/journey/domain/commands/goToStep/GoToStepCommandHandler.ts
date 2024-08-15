import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {GoToStepCommand} from "./GoToStepCommand";
import {State} from "../../state";
import StepWrapper from "../../../../shared/apiClients/dtos/StepWrapper";

export class GoToStepCommandHandler {

    public async handle(command: GoToStepCommand, state: State): Promise<StepWrapper> {
        return await mateuApiClient
            .runStepActionAndReturn(
                state.uiId!,
                state.journeyTypeId!,
                state.journeyId!,
                command.__stepId,
                'xxxbacktostep',
                {
                    journey: JSON.parse(sessionStorage.getItem(state.journeyId!)!)
                })
    }

}

export const goToStepCommandHandler = new GoToStepCommandHandler()