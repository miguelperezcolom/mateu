import ConfirmationTexts from "./ConfirmationTexts";

export default interface Action {

    id: string
    validationRequired: boolean
    confirmationRequired: boolean
    rowsSelectedRequired: boolean
    confirmationTexts: ConfirmationTexts
    modalStyle: string
    modalTitle: string
    customEvent: {
        name: string,
        detail: unknown
    }
    href: string
    runOnEnter: boolean
    onSuccess: string[]
    onError: string[]
    background: boolean
    js: string
    sse: boolean
    fieldsToValidate: string
    bubble: boolean
    shortcut: string
    /** Per-action request ceiling in ms; 0/absent uses the client default. */
    timeoutMillis: number
    /** Declared safe to re-send: the client may retry it by itself on a transient failure. */
    idempotent: boolean
}
