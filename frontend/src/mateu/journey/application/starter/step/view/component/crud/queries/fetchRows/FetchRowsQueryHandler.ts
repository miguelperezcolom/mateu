import {FetchRowsQuery} from "./FetchRowsQuery";
import {mateuApiClient} from "../../../../../../../../../shared/apiClients/MateuApiClient";

export class FetchRowsQueryHandler {

    public async handle(query: FetchRowsQuery): Promise<unknown[]> {
        return await mateuApiClient.fetchRows(
            query.journeyTypeId,
            query.journeyId,
            query.stepId,
            query.listId,
            query.page,
            query.pageSize,
            query.sortOrders,
            query.filters
        )
    }

}

export const fetchRowsQueryHandler = new FetchRowsQueryHandler()