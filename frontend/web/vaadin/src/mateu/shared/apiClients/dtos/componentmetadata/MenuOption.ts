import { GoToRoute } from "@mateu/shared/apiClients/dtos/componentmetadata/GoToRoute";

export default interface MenuOption {
    label: string
    destination: GoToRoute
    selected: boolean
    children: MenuOption[]
}