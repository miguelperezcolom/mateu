import {StartJourneyCommand} from "./StartJourneyCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import UIIncrement from "../../../../shared/apiClients/dtos/UIIncrement";

export class StartJourneyCommandHandler {

    public async handle(command: StartJourneyCommand): Promise<UIIncrement> {
        return await mateuApiClient.createJourneyAndReturn(command.uiId, command.journeyTypeId, command.journeyId)
    }

}

export const startJourneyCommandHandler = new StartJourneyCommandHandler()