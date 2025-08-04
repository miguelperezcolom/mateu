import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { ButtonColor } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor";

export default interface Button extends ComponentMetadata {

    id: string
    iconOnLeft: string
    iconOnRight: string
    label: string
    actionId: string
    primary: boolean
    autofocus: boolean
    image: string
    color: ButtonColor

}
