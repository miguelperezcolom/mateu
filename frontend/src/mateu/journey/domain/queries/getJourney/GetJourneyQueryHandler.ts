import {GetJourneyQuery} from "./GetJourneyQuery";
import Journey from "../../../../shared/apiClients/dtos/Journey";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class GetJourneyQueryHandler {

    public async handle(_query: GetJourneyQuery): Promise<Journey> {
        return await mateuApiClient
            .fetchJourney(_query.journeyTypeId, _query.journeyId)
    }

}

export const getJourneyQueryHandler = new GetJourneyQueryHandler()