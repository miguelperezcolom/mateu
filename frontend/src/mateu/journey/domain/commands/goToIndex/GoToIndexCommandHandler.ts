import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {GoToIndexCommand} from "./GoToIndexCommand";
import {State} from "../../state";

export class GoToIndexCommandHandler {

    public async handle(command: GoToIndexCommand, state: State): Promise<void> {
        await mateuApiClient
            .runStepAction(
                state.uiId!,
                state.journeyTypeId!,
                state.journeyId!,
                state.previousStepId!,
                command.__listId,
                command)
    }

}

export const goToIndexCommandHandler = new GoToIndexCommandHandler()