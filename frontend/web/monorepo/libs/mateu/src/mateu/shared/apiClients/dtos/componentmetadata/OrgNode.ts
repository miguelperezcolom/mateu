export default interface OrgNode {
    id?: string
    title?: string
    subtitle?: string
    avatar?: string
    color?: string
    actionId?: string
    children?: OrgNode[]
}
