import {fetchRowsQueryHandler} from "./queries/fetchRows/FetchRowsQueryHandler";
import {CrudState} from "./crudstate";
import {Subject} from "rxjs";
import Component from "../../../../../../shared/apiClients/dtos/Component";

export class CrudService {

    async fetch(crudState: CrudState,
                crudUpstream: Subject<CrudState>,
                params: {
        listId: string
        page: number
        pageSize: number
        searchText: string | undefined
        filters: object
        sortOrders: string
    },  component: Component, data: unknown) {
        // Pagination
        const page = await fetchRowsQueryHandler.handle({
            baseUrl: crudState.baseUrl,
            uiId: crudState.uiId,
            journeyTypeId: crudState.journeyTypeId,
            journeyId: crudState.journeyId,
            stepId: crudState.stepId,
            listId: params.listId,
            filters: params.filters,
            page: params.page,
            pageSize: params.pageSize,
            sortOrders: params.sortOrders,
            searchText: params.searchText,
            component: component,
            data: data
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
            crudState.message = crudState.count > 0?`${crudState.count} elements found.`:''

            items.forEach((r, i) => {
                // @ts-ignore
                r.__index = i + (params.page * params.pageSize);
            })
            crudState.items = items
        }
        crudUpstream.next({...crudState})
    }

}
