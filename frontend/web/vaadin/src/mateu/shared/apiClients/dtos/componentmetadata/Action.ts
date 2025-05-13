import {ActionType} from "./ActionType";
import ConfirmationTexts from "./ConfirmationTexts";
import {ActionTarget} from "./ActionTarget";
import {ActionPosition} from "./ActionPosition";
import { ActionStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionStereotype";

export default interface Action {

    id: string
    icon: string
    label: string
    type: ActionType
    stereotype: ActionStereotype
    variants: string[]
    visible: boolean
    validationRequired: boolean
    confirmationRequired: boolean
    rowsSelectedRequired: boolean
    confirmationTexts: ConfirmationTexts
    target: ActionTarget
    modalStyle: string
    modalTitle: string
    customEvent: string
    href: string
    runOnEnter: boolean
    position: ActionPosition
    timeoutMillis: number
    onSuccess: string[]
    onError: string[]

}
