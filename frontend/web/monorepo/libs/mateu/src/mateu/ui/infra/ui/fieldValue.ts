/**
 * What an editable control's raw value means for the component state.
 *
 * A control speaks strings: an empty numeric field hands back `''`, and the question is what that
 * `''` IS. For a boxed numeric it is the absence of a value — "not stated", which for a duration or
 * a retry count is a different fact from zero and the reason the field is nullable in the first
 * place. Answering it with `parseInt('')` produces **NaN**, and NaN is the one value that cannot be
 * committed to state: it is not equal to itself, so every later comparison says "this changed", and
 * a control that refuses it (`vaadin-integer-field` clears it and announces the clear as a change)
 * closes the circle — field commits NaN, is handed NaN back, clears itself, the clear reads as a
 * new change. The page hangs with the form unusable, which is what this module exists to prevent.
 */

const isBlank = (value: unknown): boolean =>
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

/**
 * The value a numeric control's raw input should commit: nothing for a blank or unparseable input
 * (never NaN), the number otherwise. `integer` parses as an integer, matching the control that
 * produced it.
 */
export const numericCommitValue = (raw: unknown, integer: boolean): number | null => {
    if (isBlank(raw)) return null
    const parsed = integer ? parseInt(String(raw), 10) : Number(raw)
    return Number.isNaN(parsed) ? null : parsed
}

/**
 * Whether a control's raw value is worth committing at all, given what state already holds.
 *
 * Blank and absent are the same fact, so a control reporting `''` over a state that never had the
 * key is announcing nothing — and treating it as a change is how an untouched form starts writing
 * to itself. Everything else keeps the loose comparison the fields have always used, so `'5'` from
 * an input and a numeric `5` in state still count as equal.
 */
export const isNoOpCommit = (raw: unknown, current: unknown): boolean => {
    if (isBlank(raw) && isBlank(current)) return true
    // eslint-disable-next-line eqeqeq
    return raw == current
}
