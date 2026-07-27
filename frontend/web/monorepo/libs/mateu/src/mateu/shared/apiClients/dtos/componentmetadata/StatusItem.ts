export default interface StatusItem {
    id?: string
    icon?: string
    avatar?: string
    title?: string
    description?: string
    status?: string
    statusColor?: string
    actionLabel?: string
    actionId?: string
    actionLabel2?: string
    actionId2?: string
    actionLabel3?: string
    actionId3?: string
    /** optional icon names (e.g. "vaadin:pencil") — renderers may show icon-only buttons with the label as tooltip */
    actionIcon?: string
    actionIcon2?: string
    actionIcon3?: string
}
