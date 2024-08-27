import {FetchRowsQuery} from "./FetchRowsQuery";
import {mateuApiClient} from "../../../../../../../../shared/apiClients/MateuApiClient";
import Page from "../../../../../../../../shared/apiClients/dtos/Page";

export class FetchRowsQueryHandler {

    public async handle(query: FetchRowsQuery): Promise<Page> {
        return await mateuApiClient.fetchRows(
            query.uiId,
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