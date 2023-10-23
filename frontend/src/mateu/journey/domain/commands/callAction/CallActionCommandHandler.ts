import {CallActionCommand} from "./CallActionCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class CallActionCommandHandler {

    public async handle(command: CallActionCommand): Promise<void> {

        return await mateuApiClient.runStepAction(
            state.journeyTypeId!,
            state.journeyId!,
            state.stepId!,
            command.actionId,
            command.data
        ).catch((error) => {
            console.log('error en handler', error)
            throw error
        })

    }

}

export const callActionCommandHandler = new CallActionCommandHandler()