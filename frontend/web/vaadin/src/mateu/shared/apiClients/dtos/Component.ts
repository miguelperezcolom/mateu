import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";

export default interface Component {

    type: ComponentType
    id: string | undefined
    children: Component[] | undefined
    style: string
    cssClasses: string

}
