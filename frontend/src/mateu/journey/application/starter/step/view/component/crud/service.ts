import {fetchRowsQueryHandler} from "./queries/fetchRows/FetchRowsQueryHandler";
import {fetchCountQueryHandler} from "./queries/fetchCount/FetchCountQueryHandler";
import {crudUpstream} from "./crudUpstream";
import {CrudState} from "./crudstate";
import {state} from "../../../../../../domain/state";

export class CrudService {

    async fetch(crudState: CrudState, params: {
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
        const count = await fetchCountQueryHandler.handle({
            journeyTypeId: state.journeyTypeId!,
            journeyId: state.journeyId!,
            stepId: state.stepId!,
            listId: params.listId,
            filters: params.filters
        })
        // @ts-ignore
        if (count.message) {
            // @ts-ignore
            crudState.message = count.message;
            crudState.items = []
            crudState.count = 0
        } else {
            crudState.count = count
            crudState.message = `${crudState.count} elements found.`;
        }
        crudUpstream.next({...crudState})
        const items = await fetchRowsQueryHandler.handle({
            journeyTypeId: state.journeyTypeId!,
            journeyId: state.journeyId!,
            stepId: state.stepId!,
            listId: params.listId,
            filters: params.filters,
            page: params.page,
            pageSize: params.pageSize,
            sortOrders: params.sortOrders
        })
        // @ts-ignore
        if (items.message) {
            // @ts-ignore
            crudState.message = items.message;
            crudState.items = []
            crudState.count = 0
        } else {
            items.forEach((r, i) => {
                // @ts-ignore
                r.__index = i + (params.page * params.pageSize);
            })
            crudState.items = items
        }
        crudUpstream.next({...crudState})
    }


}

export const crudService = new CrudService()