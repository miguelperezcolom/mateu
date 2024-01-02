import {GetStepQuery} from "./GetStepQuery";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import Step from "../../../../shared/apiClients/dtos/Step";

export class GetStepQueryHandler {

    public handle(_query: GetStepQuery): Promise<Step> {
        return mateuApiClient.fetchStep(_query.journeyTypeId, _query.journeyId, _query.stepId)
    }

}

export const getStepQueryHandler = new GetStepQueryHandler()