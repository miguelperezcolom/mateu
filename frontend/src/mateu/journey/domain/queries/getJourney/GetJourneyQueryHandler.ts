import {GetJourneyQuery} from "./GetJourneyQuery";
import Journey from "../../../../shared/apiClients/dtos/Journey";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class GetJourneyQueryHandler {

    public async handle(_query: GetJourneyQuery): Promise<Journey> {
        return await mateuApiClient.fetchJourney(state.journeyTypeId!, state.journeyId!)
    }

}

export const getJourneyQueryHandler = new GetJourneyQueryHandler()