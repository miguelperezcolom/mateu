export interface CrudState {
    baseUrl: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    listId: string
    items: unknown[]
    count: number
    searchText: string | undefined
    filters: unknown
    sorting: unknown[]
    page: number
    message: string

}
