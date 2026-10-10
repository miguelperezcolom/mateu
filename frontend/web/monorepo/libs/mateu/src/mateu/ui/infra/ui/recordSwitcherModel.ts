/**
 * Pure logic of the header record/context switcher (the Redwood selectObject/selectContext
 * element): which options a filter text keeps, which one is current, and the action a pick sends.
 * Shared by every renderer that draws the switcher, and unit-tested on its own.
 */
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";
import RecordSwitcher from "@mateu/shared/apiClients/dtos/componentmetadata/RecordSwitcher";

/** The parameter carrying the picked value (RecordSwitcherSupplier.VALUE_PARAMETER). */
export const SWITCHER_VALUE_PARAMETER = '_record'

const norm = (text: unknown): string =>
    String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * The options a filter text keeps: every whitespace-separated word must appear (accent- and
 * case-insensitive, any order) in the label or the description — the same word rule the listings'
 * search uses. A blank filter keeps everything.
 */
export const filterSwitcherOptions = (options: Option[], filter: string): Option[] => {
    const words = norm(filter).split(/\s+/).filter(Boolean)
    if (words.length === 0) return options
    return options.filter(option => {
        const haystack = norm(option.label) + ' ' + norm(option.description)
        return words.every(word => haystack.includes(word))
    })
}

/** The option currently selected, or undefined. Values compare as strings. */
export const currentSwitcherOption = (switcher: RecordSwitcher): Option | undefined =>
    (switcher.options ?? []).find(option => String(option.value) === String(switcher.value ?? ''))

/** The action a pick dispatches, or null when it would change nothing (same value, disabled). */
export const switcherPick = (switcher: RecordSwitcher, value: unknown):
    { actionId: string, parameters: Record<string, unknown> } | null => {
    if (switcher.disabled) return null
    if (value === undefined || value === null) return null
    if (String(value) === String(switcher.value ?? '')) return null
    return { actionId: switcher.actionId, parameters: { [SWITCHER_VALUE_PARAMETER]: value } }
}
