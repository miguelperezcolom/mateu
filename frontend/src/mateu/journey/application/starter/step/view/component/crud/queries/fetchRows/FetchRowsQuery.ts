export interface FetchRowsQuery {

    journeyTypeId: string
    journeyId: string
    stepId: string
    listId: string
    page: number
    pageSize: number
    filters: object
    sortOrders: string

}