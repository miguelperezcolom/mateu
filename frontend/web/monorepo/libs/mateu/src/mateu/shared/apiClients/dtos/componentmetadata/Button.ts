import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { ButtonColor } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor";
import { ButtonStyle } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStyle";
import { ButtonSize } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonSize";

export default interface Button extends ComponentMetadata {

    id: string
    label: string
    iconOnLeft: string
    iconOnRight: string
    image: string
    actionId: string
    shortcut: string
    autofocus: boolean
    disabled: boolean
    color: ButtonColor
    buttonStyle: ButtonStyle
    size: ButtonSize
    parameters: Record<string, unknown>
    separatorBefore: boolean
    children: Button[]

}
