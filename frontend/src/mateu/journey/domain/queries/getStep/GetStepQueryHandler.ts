import Step from "../../../../../../types/api/dtos/Step";
import {GetStepQuery} from "./GetStepQuery";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class GetStepQueryHandler {

    public handle(query: GetStepQuery): Promise<Step> {
        return mateuApiClient.fetchStep(state.journeyTypeId!, state.journeyId!, query.stepId)
    }

}

export const getStepQueryHandler = new GetStepQueryHandler()