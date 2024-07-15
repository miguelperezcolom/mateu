import {CreateJourneyCommand} from "./CreateJourneyCommand"
import {state} from "../../state"
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class CreateJourneyCommandHandler {

    public async handle(command: CreateJourneyCommand): Promise<void> {
        state.journeyTypeId = command.journeyTypeId

        mateuApiClient.abortAll();
        document.title = command.label;
        window.history.pushState({},"", '#' + command.journeyTypeId);
    }

}

export const createJourneyCommandHandler = new CreateJourneyCommandHandler()