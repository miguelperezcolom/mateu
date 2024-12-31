import Component from "../../../../../../../../shared/apiClients/dtos/Component";

export interface FetchRowsQuery {
    baseUrl: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    listId: string
    page: number
    pageSize: number
    searchText: string | undefined
    filters: object
    sortOrders: string
    component: Component
    data: unknown
}