export interface FetchRowsQuery {

    uiId: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    listId: string
    page: number
    pageSize: number
    filters: object
    sortOrders: string

}