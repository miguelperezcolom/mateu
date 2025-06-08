import { ButtonType } from "./ButtonType";
import { ButtonPosition } from "./ButtonPosition";
import { ButtonStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStereotype";

export default interface Button {

    id: string
    icon: string
    label: string
    type: ButtonType
    stereotype: ButtonStereotype
    variants: string[]
    visible: boolean
    position: ButtonPosition
    actionId: string

}
