import {CallActionCommand} from "./CallActionCommand";
import UIIncrement from "../../../../shared/apiClients/dtos/UIIncrement";
import {MateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class CallActionCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: CallActionCommand): Promise<UIIncrement> {

        return mateuApiClient.runStepActionAndReturn(
            command.baseUrl,
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