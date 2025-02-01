import {LoadUiCommand} from "./LoadUiCommand"
import UI from "../../../../shared/apiClients/dtos/UI"
import {MateuApiClient} from "../../MateuApiClient"

export class LoadUiCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: LoadUiCommand):
        Promise<{ui: UI, journeyTypeId: string | undefined}> {
        const ui = await mateuApiClient.fetchUi()
        if (ui?.contextData) {
            try {
                mateuApiClient.contextData = ui.contextData?JSON.parse(ui.contextData):{}
            } catch (e) {
                console.log('error when parsing context data', e)
            }
        }
        return {
            ui: ui,
            journeyTypeId: command.journeyTypeId
        };
    }

}

export const loadUiCommandHandler = new LoadUiCommandHandler()