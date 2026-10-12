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

/**
 * The value an `<input type="color">` can show for a field value. The control only accepts
 * `#rrggbb` (lowercase hex, six digits); anything else — no value, `#F00`, a CSS name — makes it
 * silently fall back to black, so a field holding `#ff0000` used to be painted black and the
 * user had no way to tell it already had a colour. Three-digit hex is expanded; anything that
 * cannot be shown keeps the control's own default.
 */
const COLOR_INPUT_DEFAULT = '#000000' // design-token-ok: the <input type=color> value contract, not a style

export const colorInputValue = (value: unknown): string => {
    if (typeof value !== 'string') return COLOR_INPUT_DEFAULT
    const v = value.trim().toLowerCase()
    if (/^#[0-9a-f]{6}$/.test(v)) return v
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v)
    if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    return COLOR_INPUT_DEFAULT
}
