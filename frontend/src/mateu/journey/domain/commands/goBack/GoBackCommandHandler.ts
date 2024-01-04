import {GoBackCommand} from "./GoBackCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {State} from "../../state";

export class GoBackCommandHandler {

    public async handle(_command: GoBackCommand, state: State): Promise<void> {
        await mateuApiClient
            .runStepActionAndReturn(
                state.journeyTypeId!,
                state.journeyId!,
                state.previousStepId!,
                'xxxbacktostep',
                {})
    }

}

export const goBackCommandHandler = new GoBackCommandHandler()