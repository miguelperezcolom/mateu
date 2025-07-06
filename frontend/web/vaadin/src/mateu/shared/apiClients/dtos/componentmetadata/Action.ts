import ConfirmationTexts from "./ConfirmationTexts";
import { ActionTarget } from "./ActionTarget";

export default interface Action {

    id: string
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
    onSuccess: string[]
    onError: string[]
    background: boolean

}
