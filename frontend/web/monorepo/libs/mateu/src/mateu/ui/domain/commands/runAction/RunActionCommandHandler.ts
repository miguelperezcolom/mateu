import { RunActionCommand } from "./RunActionCommand"
import { MateuApiClient } from "../../MateuApiClient"
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export class RunActionCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: RunActionCommand):
        Promise<{uiIncrements: UIIncrement[]}> {
        const uiIncrements = await mateuApiClient.runAction(
            command.baseUrl,
            command.route,
            command.consumedRoute,
            command.actionId,
            command.initiatorComponentId,
            command.appState,
            command.serverSideType,
            command.componentState,
            command.parameters,
            command.initiator,
            command.background
        )
        return {
            uiIncrements
        };
    }

}

export const runActionCommandHandler = new RunActionCommandHandler()

