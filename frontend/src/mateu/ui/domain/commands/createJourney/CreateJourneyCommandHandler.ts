import {CreateJourneyCommand} from "./CreateJourneyCommand"
import {state} from "../../state"
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class CreateJourneyCommandHandler {

    public async handle(command: CreateJourneyCommand): Promise<void> {
        state.journeyTypeId = command.journeyTypeId

        mateuApiClient.abortAll();
        document.title = command.label;
        var url = '#' + command.journeyTypeId
        if ('____home____' == command.journeyTypeId) {
            url = ''
        }
        window.history.pushState({},"", url);
    }

}

export const createJourneyCommandHandler = new CreateJourneyCommandHandler()