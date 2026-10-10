import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";

/**
 * The record/context switcher of the page header (the Redwood selectObject/selectContext element).
 * Picking an option dispatches `actionId` with the picked value in the `_record` parameter.
 */
export default interface RecordSwitcher {
    options: Option[]
    value?: string
    /** 'object' — the record shown; 'context' — what the page is evaluated in */
    type?: 'object' | 'context'
    label?: string
    searchable?: boolean
    disabled?: boolean
    actionId: string
}
