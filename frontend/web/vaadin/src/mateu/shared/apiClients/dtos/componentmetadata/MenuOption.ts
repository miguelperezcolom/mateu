export default interface MenuOption {
    label: string
    journeyTypeId: string
    selected: boolean
    children: MenuOption[]
}