import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {GoToIndexCommand} from "./GoToIndexCommand";
import {State} from "../../state";
import StepWrapper from "../../../../shared/apiClients/dtos/StepWrapper";

export class GoToIndexCommandHandler {

    public async handle(command: GoToIndexCommand, state: State): Promise<StepWrapper> {
        return await mateuApiClient
            .runStepActionAndReturn(
                state.uiId!,
                state.journeyTypeId!,
                state.journeyId!,
                state.previousStepId!,
                command.__listId,
                command)
    }

}

export const goToIndexCommandHandler = new GoToIndexCommandHandler()