import {FetchRowsQuery} from "./FetchRowsQuery";
import Page from "../../../../../../../../shared/apiClients/dtos/Page";
import {MateuApiClient} from "../../../../../../../../shared/apiClients/MateuApiClient";

export class FetchRowsQueryHandler {

    public async handle(mateuApiClient: MateuApiClient, query: FetchRowsQuery): Promise<Page> {
        return await mateuApiClient.fetchRows(
            query.baseUrl,
            query.journeyTypeId,
            query.journeyId,
            query.stepId,
            query.listId,
            query.page,
            query.pageSize,
            query.sortOrders,
            query.searchText,
            query.filters,
            query.component,
            query.data
        )
    }

}

export const fetchRowsQueryHandler = new FetchRowsQueryHandler()