/**
 * The `required` client-side rule (`SetDataValue` on `<field>.required`, e.g. "the VAT number is
 * required only for a company"). The rule engine writes `data['<field>.required']`; the renderers
 * used to act only on `.hidden` / `.disabled`, so the rule reached the browser and changed nothing:
 * no asterisk, and an empty value was saved. This is the one place the flag is read — for the mark
 * on the field (renderClientSideComponent) and for the check before a validating action
 * (mateu-component.checkValidations).
 */

const SUFFIX = '.required'

/** Whether a rule currently makes `fieldId` required (`true` only: absent/false = as declared). */
export const ruleRequires = (data: Record<string, unknown> | undefined, fieldId: string | undefined): boolean =>
    !!fieldId && data?.[fieldId + SUFFIX] === true

/** The fields a rule currently makes required, minus those a rule hides (a hidden field asks nothing). */
export const ruleRequiredFields = (data: Record<string, unknown> | undefined): string[] => {
    if (!data) return []
    return Object.keys(data)
        .filter(key => key.endsWith(SUFFIX) && data[key] === true)
        .map(key => key.substring(0, key.length - SUFFIX.length))
        .filter(field => field.length > 0 && data[field + '.hidden'] !== true)
}

/** Empty the way a required field means it: nothing, blank text, or an empty list. */
export const isEmptyValue = (value: unknown): boolean =>
    value === undefined || value === null
    || (typeof value === 'string' && value.trim() === '')
    || (Array.isArray(value) && value.length === 0)

/**
 * The fields a rule makes required whose value in `state` is empty — restricted to
 * `fieldsToValidate` when given (a partial validation).
 */
export const missingRuleRequired = (
    state: Record<string, unknown> | undefined,
    data: Record<string, unknown> | undefined,
    fieldsToValidate?: string[],
): string[] =>
    ruleRequiredFields(data)
        .filter(field => !fieldsToValidate || fieldsToValidate.includes(field))
        .filter(field => isEmptyValue(state?.[field]))
