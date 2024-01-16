import {ActionType} from "./ActionType";
import ConfirmationTexts from "./ConfirmationTexts";
import {ActionTarget} from "./ActionTarget";

export default interface Action {

    id: string

    caption: string

    type: ActionType

    visible: boolean

    validationRequired: boolean

    confirmationRequired: boolean

    rowsSelectedRequired: boolean

    confirmationTexts: ConfirmationTexts

    target: ActionTarget

    modalStyle: string

}
