import {StartJourneyCommand} from "./StartJourneyCommand";
import UIIncrement from "../../../../shared/apiClients/dtos/UIIncrement";
import {MateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class StartJourneyCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: StartJourneyCommand): Promise<UIIncrement> {
        return await mateuApiClient.createJourneyAndReturn(command.journeyTypeId, command.journeyId)
    }

}

export const startJourneyCommandHandler = new StartJourneyCommandHandler()