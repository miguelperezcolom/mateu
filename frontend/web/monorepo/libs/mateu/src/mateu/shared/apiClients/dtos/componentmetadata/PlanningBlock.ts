export default interface PlanningBlock {

    id?: string
    resourceId?: string
    start?: string
    end?: string
    label?: string
    color?: string
    status?: string
    icon?: string | null
    // hover text (lines separated by \n); absent = label · dates · status
    summary?: string | null

}
