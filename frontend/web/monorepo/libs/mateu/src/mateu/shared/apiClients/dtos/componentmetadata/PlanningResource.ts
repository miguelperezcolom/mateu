export default interface PlanningResource {

    id?: string
    label?: string
    group?: string
    // values of the board's attribute columns (e.g. type, housekeeping status)
    attributes?: string[]
    icon?: string | null

}
