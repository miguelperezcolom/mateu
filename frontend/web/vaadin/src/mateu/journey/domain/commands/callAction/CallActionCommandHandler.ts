import {CallActionCommand} from "./CallActionCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import UIIncrement from "../../../../shared/apiClients/dtos/UIIncrement";

export class CallActionCommandHandler {

    public async handle(command: CallActionCommand): Promise<UIIncrement> {

        return await mateuApiClient.runStepActionAndReturn(
            command.uiId,
            command.journeyTypeId,
            command.journeyId,
            command.stepId,
            command.componentId,
            command.actionId,
            command.componentType,
            command.data
        ).catch((error) => {
            console.log('error en handler', error)
            throw error
        })

    }

}

export const callActionCommandHandler = new CallActionCommandHandler()