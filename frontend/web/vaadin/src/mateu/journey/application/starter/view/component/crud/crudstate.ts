export interface CrudState {
    baseUrl: string
    uiId: string
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
