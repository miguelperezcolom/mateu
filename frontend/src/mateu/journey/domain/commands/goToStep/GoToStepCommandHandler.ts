import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {GoToStepCommand} from "./GoToStepCommand";
import {State} from "../../state";

export class GoToStepCommandHandler {

    public async handle(command: GoToStepCommand, state: State): Promise<void> {
        await mateuApiClient
            .runStepAction(
                state.uiId!,
                state.journeyTypeId!,
                state.journeyId!,
                command.__stepId,
                'xxxbacktostep',
                {})
    }

}

export const goToStepCommandHandler = new GoToStepCommandHandler()