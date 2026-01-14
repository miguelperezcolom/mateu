import { GoToRoute } from "@mateu/shared/apiClients/dtos/componentmetadata/GoToRoute";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface MenuOption {
    label: string
    destination: GoToRoute
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

    baseUrl: string
    route: string
    consumedRoute: string
    appServerSideType: string | undefined
    serverSideType: string
    params: any
    explode: boolean
    uriPrefix: string | undefined
}