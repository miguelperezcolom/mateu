import {CallActionCommand} from "./CallActionCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {State} from "../../state";
import StepWrapper from "../../../../shared/apiClients/dtos/StepWrapper";

export class WrapperCallActionCommandHandler {

    public async handle(command: CallActionCommand, state: State): Promise<StepWrapper> {

        return await mateuApiClient.runStepActionAndReturn(
            state.uiId!,
            state.journeyTypeId!,
            state.journeyId!,
            state.stepId!,
            command.componentId,
            command.actionId,
            command.data
        ).catch((error) => {
            console.log('error en handler', error)
            throw error
        })

    }

}

export const wrapperCallActionCommandHandler = new WrapperCallActionCommandHandler()