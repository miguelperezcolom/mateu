import {fetchRowsQueryHandler} from "./queries/fetchRows/FetchRowsQueryHandler";
import {CrudState} from "./crudstate";
import {Subject} from "rxjs";

export class CrudService {

    async fetch(crudState: CrudState,
                crudUpstream: Subject<CrudState>,
                params: {
        listId: string
        page: number
        pageSize: number
        filters: object
        sortOrders: string
    }) {


        // @ts-ignore
        /*
        if (rows.code == 'ERR_CANCELED') {
            state.message = `Request cancelled`;
            return {rows: [], count: 0}
        }
         */

        // Pagination
        const page = await fetchRowsQueryHandler.handle({
            journeyTypeId: crudState.journeyTypeId,
            journeyId: crudState.journeyId,
            stepId: crudState.stepId,
            listId: params.listId,
            filters: params.filters,
            page: params.page,
            pageSize: params.pageSize,
            sortOrders: params.sortOrders
        })
        const items = page.content
        const count = page.totalElements
        // @ts-ignore
        if (page.message) {
            // @ts-ignore
            crudState.message = page.message;
            crudState.items = []
            crudState.count = 0
        } else {
            crudState.count = count
            crudState.message = `${crudState.count} elements found.`;

            items.forEach((r, i) => {
                // @ts-ignore
                r.__index = i + (params.page * params.pageSize);
            })
            crudState.items = items
        }
        crudUpstream.next({...crudState})
    }


}
