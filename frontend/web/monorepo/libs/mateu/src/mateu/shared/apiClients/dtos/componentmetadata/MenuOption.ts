import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface MenuOption {
    label: string
    actionId: string | undefined
    selected: boolean
    submenus: MenuOption[]
    separator: boolean
    component: Component
    className: string
    disabled: boolean
    disabledOnClick: boolean
    itemData: any
    icon: string,

    remote: boolean

    path: string

    baseUrl: string
    route: string
    consumedRoute: string
    serverSideType: string | undefined
    params: any
    explode: boolean
    uriPrefix: string | undefined
}