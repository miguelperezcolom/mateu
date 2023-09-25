import {FetchCountQuery} from "./FetchCountQuery";
import {mateuApiClient} from "../../../../../../../../../shared/apiClients/MateuApiClient";

export class FetchCountQueryHandler {

    public async handle(query: FetchCountQuery): Promise<number> {
        return await mateuApiClient.fetchCount(
            query.journeyTypeId,
            query.journeyId,
            query.stepId,
            query.listId,
            query.filters
        )
    }

}

export const fetchCountQueryHandler = new FetchCountQueryHandler()