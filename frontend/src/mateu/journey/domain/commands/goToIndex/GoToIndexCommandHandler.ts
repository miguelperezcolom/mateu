import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {GoToIndexCommand} from "./GoToIndexCommand";
import {state} from "../../state";

export class GoToIndexCommandHandler {

    public async handle(command: GoToIndexCommand): Promise<void> {
        await mateuApiClient
            .runStepAction(
                state.journeyTypeId!,
                state.journeyId!,
                state.previousStepId!,
                command.__listId,
                command)
    }

}

export const goToIndexCommandHandler = new GoToIndexCommandHandler()