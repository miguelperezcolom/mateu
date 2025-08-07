import { GoToRoute } from "@mateu/shared/apiClients/dtos/componentmetadata/GoToRoute";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface MenuOption {
    label: string
    destination: GoToRoute
    selected: boolean
    submenus: MenuOption[]
    separator: boolean
    component: Component
    className: string
    disabled: boolean
    disabledOnClick: boolean
    itemData: any
}