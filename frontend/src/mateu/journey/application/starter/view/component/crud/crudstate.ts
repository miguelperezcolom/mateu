export interface CrudState {

    uiId: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    listId: string
    items: unknown[]
    count: number
    filters: unknown
    sorting: unknown[]
    page: number
    message: string

}
