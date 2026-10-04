import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action"
import { chromeText } from "@infra/ui/chromeTexts.ts"

/** What the confirmation dialog shows: the declared texts over the framework's generic wording. */
export interface ConfirmationDialogTexts {
    header: string
    message: string
    confirmationText: string
    denialText: string
}

/**
 * The framework's generic wording, in the page's language (chromeTexts: `<html lang>`, else the
 * browser's) — «Un momento» / «¿Seguro?» / «Sí» / «No» on a Spanish UI, English otherwise.
 */
const generic = (lang?: string): ConfirmationDialogTexts => ({
    header: chromeText('confirmTitle', lang),
    message: chromeText('confirmMessage', lang),
    confirmationText: chromeText('confirmYes', lang),
    denialText: chromeText('confirmNo', lang),
})

/**
 * The wording of the confirmation dialog for an action.
 *
 * <p>Each text falls back on its OWN. The four travel together in one record, so an action that
 * declares only a message — the common case: the developer wants to say what is about to happen,
 * not to rename the buttons — arrives with three empty strings, and taking the record as a block
 * blanked the header and left both buttons unlabelled.
 */
export const confirmationDialogTexts = (action: Action | undefined, lang?: string): ConfirmationDialogTexts => {
    const GENERIC = generic(lang)
    const texts = action?.confirmationTexts
    const declared = (text: string | undefined, fallback: string) =>
        text != null && text.trim().length > 0 ? text : fallback
    return {
        header: declared(texts?.title, GENERIC.header),
        message: declared(texts?.message, GENERIC.message),
        confirmationText: declared(texts?.confirmationText, GENERIC.confirmationText),
        denialText: declared(texts?.denialText, GENERIC.denialText),
    }
}
