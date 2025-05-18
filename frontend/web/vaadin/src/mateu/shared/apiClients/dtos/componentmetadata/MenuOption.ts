export default interface MenuOption {
    label: string
    route: string
    selected: boolean
    children: MenuOption[]
}