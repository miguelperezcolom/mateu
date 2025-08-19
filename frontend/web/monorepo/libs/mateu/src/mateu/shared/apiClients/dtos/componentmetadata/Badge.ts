import { BadgeColor } from "./BadgeColor";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Badge extends ComponentMetadata {

    text: string
    iconOnLeft: string
    iconOnRight: string
    color: BadgeColor
    primary: boolean
    small: boolean
    pill: boolean

}
