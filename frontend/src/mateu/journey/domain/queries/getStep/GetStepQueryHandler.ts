import {GetStepQuery} from "./GetStepQuery";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";
import Step from "../../../../shared/apiClients/dtos/Step";

export class GetStepQueryHandler {

    public handle(query: GetStepQuery): Promise<Step> {
        return mateuApiClient.fetchStep(state.journeyTypeId!, state.journeyId!, query.stepId)
    }

}

export const getStepQueryHandler = new GetStepQueryHandler()