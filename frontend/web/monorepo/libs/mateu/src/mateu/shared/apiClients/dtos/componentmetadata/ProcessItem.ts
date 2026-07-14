export default interface ProcessItem {
    id?: string
    name?: string
    systems?: string[]
    ok?: number
    warnings?: number
    errors?: number
    status?: string
    actionLabel?: string
    actionId?: string
}
