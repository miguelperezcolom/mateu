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

    confirmationTexts: ConfirmationTexts

    target: ActionTarget

    modalWidth: string

    modalHeight: string

}
