import type { nothing } from 'lit'

/** The detail of the `value-changed` event a field dispatches when its value changes. */
export type ValueChangedDetail = { value: unknown; fieldId: string | undefined }

/** A file already attached to a file field, as it travels in the state. */
export interface FileLike {
    id: string
    name: string
}

/**
 * A field's value as it comes out of the component state: whatever the wire carried for it (a
 * string, a number, an option object, a list…). Each render function narrows it for its control.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldValue = any

/** The label to give the control: the interpolated text, or `nothing` when it is hidden or already drawn. */
export type FieldLabel = string | typeof nothing
