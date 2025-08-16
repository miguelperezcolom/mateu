import ConfirmationTexts from "./ConfirmationTexts";

export default interface Action {

    id: string
    validationRequired: boolean
    confirmationRequired: boolean
    rowsSelectedRequired: boolean
    confirmationTexts: ConfirmationTexts
    modalStyle: string
    modalTitle: string
    customEvent: string
    href: string
    runOnEnter: boolean
    onSuccess: string[]
    onError: string[]
    background: boolean

}
