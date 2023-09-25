import {CallActionCommand} from "./CallActionCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class CallActionCommandHandler {

    public async handle(command: CallActionCommand): Promise<void> {

        await mateuApiClient.runStepAction(
            state.journeyTypeId!,
            state.journeyId!,
            state.stepId!,
            command.actionId,
            command.data
        )

    }

}

export const callActionCommandHandler = new CallActionCommandHandler()