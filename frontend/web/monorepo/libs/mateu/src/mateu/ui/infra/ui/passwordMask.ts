/**
 * A password is never shown, not even read-only: a read-only `password` field (a detail view, a
 * property list, a plain-text form) shows a fixed mask — one length, so it does not tell how long
 * the secret is — and nothing to copy. Empty stays empty (there is nothing to hide).
 */
export const PASSWORD_MASK = '••••••••'

export const isPasswordField = (field: { stereotype?: string } | undefined | null): boolean =>
    field?.stereotype === 'password'

/** The value a read-only field shows: masked when the field is a password, else untouched. */
export const shownReadOnlyValue = <T>(field: { stereotype?: string } | undefined | null, value: T): T | string =>
    isPasswordField(field) ? (value === undefined || value === null || value === '' ? '' : PASSWORD_MASK) : value
