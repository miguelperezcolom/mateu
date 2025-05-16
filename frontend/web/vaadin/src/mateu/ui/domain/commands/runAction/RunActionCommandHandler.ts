import { RunActionCommand } from "./RunActionCommand"
import { MateuApiClient } from "../../MateuApiClient"
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export class RunActionCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: RunActionCommand):
        Promise<{uiIncrement: UIIncrement}> {
        const uiIncrement = await mateuApiClient.runAction(
            command.baseUrl,
            command.journeyTypeId,
            command.actionId,
            command.initiatorComponentId,
            command.config,
            command.serverSideType,
            command.userData,
            command.initiator)
        return {
            uiIncrement
        };
    }

}

export const runActionCommandHandler = new RunActionCommandHandler()

