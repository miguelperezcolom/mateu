import {LoadUiCommand} from "./LoadUiCommand"
import UI from "../../../../shared/apiClients/dtos/UI"
import {MateuApiClient} from "../../MateuApiClient"

export class LoadUiCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: LoadUiCommand):
        Promise<{ui: UI}> {
        const ui = await mateuApiClient.fetchUi(command.baseUrl, command.config, command.initiator)
        return {
            ui: ui,
        };
    }

}

export const loadUiCommandHandler = new LoadUiCommandHandler()